import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { CreateStudentevaluationDto } from './dto/create-studentevaluation.dto';
import { UpdateStudentevaluationDto } from './dto/update-studentevaluation.dto';
import { UpdateEvaluationStatusDto } from './dto/update-evaluation-status.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Users } from 'src/models/model.users';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Op } from 'sequelize';
import { MarkingStatus } from 'src/models/model.studentevaluation';

@Injectable()
export class StudentevaluationService {
  constructor(
    @InjectModel(Studentevaluation)
    private studentevaluationModel: typeof Studentevaluation,
    @InjectModel(SessionCours)
    private sessionCoursModel: typeof SessionCours,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(EvaluationQuestionOption)
    private evaluationQuestionOptionModel: typeof EvaluationQuestionOption,
  ) {}

  async create(
    createStudentevaluationDto: CreateStudentevaluationDto & {
      createdBy: string;
    },
  ): Promise<ResponseServer> {
    try {
      // Validate that sessionCoursId is provided (required)
      const { sessionCoursId, lessonId, createdBy } =
        createStudentevaluationDto;

      if (!sessionCoursId) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: "L'identifiant sessionCoursId est requis",
        });
      }

      // Validate that the creator exists (createdBy comes from JWT token)
      if (createdBy) {
        const creator = await this.usersModel.findByPk(createdBy);
        if (!creator) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Utilisateur créateur non trouvé',
          });
        }
      }

      // lessonId is optional - can be provided along with sessionCoursId

      // Validate that the linked entity exists
      if (sessionCoursId) {
        const sessionCours =
          await this.sessionCoursModel.findByPk(sessionCoursId);
        if (!sessionCours) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Cours de session non trouvé',
          });
        }
      }

      if (lessonId && lessonId.length > 0) {
        // Validate that all lessons exist
        const lessons = await this.lessonModel.findAll({
          where: { id: { [Op.in]: lessonId } },
        });
        if (lessons.length !== lessonId.length) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'One or more lessons not found',
          });
        }
      }

      // Validate time fields if provided
      const { beginningTime, endingTime } = createStudentevaluationDto;
      if (beginningTime && endingTime) {
        const [beginHour, beginMin] = beginningTime.split(':').map(Number);
        const [endHour, endMin] = endingTime.split(':').map(Number);
        const beginMinutes = beginHour * 60 + beginMin;
        const endMinutes = endHour * 60 + endMin;

        if (beginMinutes >= endMinutes) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: 'Beginning time must be before ending time',
          });
        }
      }

      // Convert string date to Date object if present
      const createData: any = { ...createStudentevaluationDto };
      if (
        createData.submittiondate &&
        typeof createData.submittiondate === 'string'
      ) {
        createData.submittiondate = new Date(createData.submittiondate);
      }
      // beginningTime and endingTime remain as strings (HH:MM format)

      const evaluation = await this.studentevaluationModel.create(createData);

      console.log('✅ Student evaluation created successfully:', {
        id: evaluation.id,
        title: evaluation.title,
        type: evaluation.type,
        points: evaluation.points,
        sessionCoursId: evaluation.sessionCoursId,
        lessonId: evaluation.lessonId,
        createdBy: evaluation.createdBy,
        ispublish: evaluation.ispublish,
        createdAt: evaluation.createdAt,
      });

      return Responder({
        status: HttpStatusCode.Created,
        data: {
          evaluation: evaluation,
          message: 'Student evaluation created successfully',
          details: {
            id: evaluation.id,
            title: evaluation.title,
            type: evaluation.type,
            points: evaluation.points,
            sessionCoursId: evaluation.sessionCoursId,
            lessonId: evaluation.lessonId,
            createdBy: evaluation.createdBy,
            ispublish: evaluation.ispublish,
            createdAt: evaluation.createdAt,
          },
        },
        customMessage: 'Student evaluation created successfully',
      });
    } catch (error) {
      console.error('❌ Error creating student evaluation:', error);

      // Provide more specific error messages
      let errorMessage = 'Error creating student evaluation';
      if (error.name === 'SequelizeValidationError') {
        errorMessage =
          'Validation error: ' + error.errors.map((e) => e.message).join(', ');
        console.error('🔍 Validation Error Details:', error.errors);
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage =
          'Invalid reference: The referenced session course or lesson does not exist';
        console.error('🔗 Foreign Key Error:', error.message);
      } else if (error.name === 'SequelizeDatabaseError') {
        errorMessage = 'Database error: ' + error.message;
        console.error('🗄️ Database Error:', error.message);
      } else {
        console.error('⚠️ Unexpected Error:', error.name, error.message);
      }

      console.error('📋 Error Response:', {
        status: HttpStatusCode.InternalServerError,
        errorMessage,
        errorName: error.name,
        errorDetails: error.details || null,
      });

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: error.name,
          message: error.message,
          details: error.details || null,
        },
        customMessage: errorMessage,
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const evaluations = await this.studentevaluationModel.findAll({
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get all unique lesson IDs from evaluations and fetch lessons
      const allLessonIds = evaluations.reduce((acc, evaluation) => {
        if (evaluation.lessonId && Array.isArray(evaluation.lessonId)) {
          acc.push(...evaluation.lessonId);
        }
        return acc;
      }, [] as string[]);

      const uniqueLessonIds = [...new Set(allLessonIds)];

      const lessons = await this.lessonModel.findAll({
        where: { id: { [Op.in]: uniqueLessonIds } },
        attributes: ['id', 'title', 'description', 'ispublish'],
      });

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessons = lessons.filter(
          (lesson) =>
            evaluation.lessonId && evaluation.lessonId.includes(lesson.id),
        );
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluationsWithLessons,
        customMessage: 'Student evaluations retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student evaluations:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluations',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id, {
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points', 'isImmediateResult'],
            include: [
              {
                model: EvaluationQuestionOption,
                as: 'options',
                attributes: ['id', 'text', 'isCorrect'],
              },
            ],
          },
        ],
      });

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Fetch lessons if lessonId array exists
      let lessons: any[] = [];
      if (
        evaluation.lessonId &&
        Array.isArray(evaluation.lessonId) &&
        evaluation.lessonId.length > 0
      ) {
        lessons = await this.lessonModel.findAll({
          where: { id: { [Op.in]: evaluation.lessonId } },
          attributes: ['id', 'title', 'description', 'ispublish'],
        });
      }

      const evaluationWithLessons = {
        ...evaluation.toJSON(),
        lessons,
      };

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluationWithLessons,
        customMessage: 'Student evaluation retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluation',
      });
    }
  }

  async findByLecturer(createdBy: string): Promise<ResponseServer> {
    try {
      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          createdBy: createdBy,
        },
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get all unique lesson IDs from evaluations and fetch lessons
      const allLessonIds = evaluations.reduce((acc, evaluation) => {
        if (evaluation.lessonId && Array.isArray(evaluation.lessonId)) {
          acc.push(...evaluation.lessonId);
        }
        return acc;
      }, [] as string[]);

      const uniqueLessonIds = [...new Set(allLessonIds)];

      const lessons = await this.lessonModel.findAll({
        where: { id: { [Op.in]: uniqueLessonIds } },
        attributes: ['id', 'title', 'description', 'ispublish'],
      });

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessons = lessons.filter(
          (lesson) =>
            evaluation.lessonId && evaluation.lessonId.includes(lesson.id),
        );
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluationsWithLessons,
        customMessage: 'Student evaluations retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student evaluations by lecturer:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluations',
      });
    }
  }

  async getCreatorForEvaluation(evaluationId: string): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(
        evaluationId,
        {
          attributes: ['id', 'createdBy'],
        },
      );

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      const creator = await this.usersModel.findByPk(evaluation.createdBy, {
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });

      if (!creator) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Creator not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: creator,
        customMessage: 'Creator retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving creator for evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving creator',
      });
    }
  }

  async findByLessonId(lessonId: string): Promise<ResponseServer> {
    try {
      // First verify that the lesson exists
      const lesson = await this.lessonModel.findByPk(lessonId);
      if (!lesson) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Lesson not found',
        });
      }

      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          lessonId: {
            [Op.contains]: [lessonId],
          },
        },
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get all unique lesson IDs from evaluations
      const allLessonIds = evaluations.reduce((acc, evaluation) => {
        if (evaluation.lessonId && Array.isArray(evaluation.lessonId)) {
          acc.push(...evaluation.lessonId);
        }
        return acc;
      }, [] as string[]);

      const uniqueLessonIds = [...new Set(allLessonIds)];

      // Fetch all lessons
      const lessons = await this.lessonModel.findAll({
        where: { id: { [Op.in]: uniqueLessonIds } },
        attributes: ['id', 'title', 'description', 'ispublish'],
      });

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessons = lessons.filter(
          (lesson) =>
            evaluation.lessonId && evaluation.lessonId.includes(lesson.id),
        );
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluations: evaluationsWithLessons,
          total: evaluations.length,
          lessons,
        },
        customMessage: 'Student evaluations for lesson retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching student evaluations by lesson ID:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluations for lesson',
      });
    }
  }

  async findBySessionCoursId(sessionCoursId: string): Promise<ResponseServer> {
    try {
      // First verify that the session course exists
      const sessionCours =
        await this.sessionCoursModel.findByPk(sessionCoursId);
      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found',
        });
      }

      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          sessionCoursId: sessionCoursId,
        },
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get all unique lesson IDs from evaluations and fetch lessons
      const allLessonIds = evaluations.reduce((acc, evaluation) => {
        if (evaluation.lessonId && Array.isArray(evaluation.lessonId)) {
          acc.push(...evaluation.lessonId);
        }
        return acc;
      }, [] as string[]);

      const uniqueLessonIds = [...new Set(allLessonIds)];

      const lessons = await this.lessonModel.findAll({
        where: { id: { [Op.in]: uniqueLessonIds } },
        attributes: ['id', 'title', 'description', 'ispublish'],
      });

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessons = lessons.filter(
          (lesson) =>
            evaluation.lessonId && evaluation.lessonId.includes(lesson.id),
        );
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluations: evaluationsWithLessons,
          total: evaluations.length,
          sessionCours,
        },
        customMessage:
          'Student evaluations for session course retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error fetching student evaluations by session course ID:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage:
          'Error retrieving student evaluations for session course',
      });
    }
  }

  async findBySessionCoursIdForStudent(
    sessionCoursId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      // First verify that the session course exists
      const sessionCours =
        await this.sessionCoursModel.findByPk(sessionCoursId);
      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found',
        });
      }

      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          sessionCoursId: sessionCoursId,
          studentId: {
            [Op.contains]: [studentId],
          },
          ispublish: true,
        },
        include: [
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get all unique lesson IDs from evaluations and fetch lessons
      const allLessonIds = evaluations.reduce((acc, evaluation) => {
        if (evaluation.lessonId && Array.isArray(evaluation.lessonId)) {
          acc.push(...evaluation.lessonId);
        }
        return acc;
      }, [] as string[]);

      const uniqueLessonIds = [...new Set(allLessonIds)];

      const lessons = await this.lessonModel.findAll({
        where: {
          id: { [Op.in]: uniqueLessonIds },
          ispublish: true,
        },
        attributes: ['id', 'title', 'description', 'ispublish'],
      });

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessons = lessons.filter(
          (lesson) =>
            evaluation.lessonId && evaluation.lessonId.includes(lesson.id),
        );
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluations: evaluationsWithLessons,
          total: evaluations.length,
        },
        customMessage: 'Student evaluations retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error fetching student evaluations by session course ID for student:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluations',
      });
    }
  }

  async getStudentsForEvaluation(
    evaluationId: string,
  ): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(
        evaluationId,
        {
          attributes: ['id', 'studentId'],
        },
      );

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      if (!evaluation.studentId || evaluation.studentId.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: [],
          customMessage: 'No students have participated in this evaluation yet',
        });
      }

      const students = await this.usersModel.findAll({
        where: {
          id: {
            [Op.in]: evaluation.studentId,
          },
        },
        attributes: ['id', 'firstName', 'lastName', 'email'],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: students,
        customMessage:
          'Students who participated in evaluation retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving students for evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving students for evaluation',
      });
    }
  }

  async addStudentToEvaluation(
    evaluationId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      const evaluation =
        await this.studentevaluationModel.findByPk(evaluationId);
      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Verify student exists
      const student = await this.usersModel.findByPk(studentId);
      if (!student) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student not found',
        });
      }

      // Get current student IDs or initialize empty array
      const currentStudentIds = evaluation.studentId || [];

      // Check if student is already in the evaluation
      if (currentStudentIds.includes(studentId)) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Student is already participating in this evaluation',
        });
      }

      // Add student to the evaluation
      const updatedStudentIds = [...currentStudentIds, studentId];
      await evaluation.update({ studentId: updatedStudentIds });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluationId,
          studentId,
          totalStudents: updatedStudentIds.length,
        },
        customMessage: 'Student added to evaluation successfully',
      });
    } catch (error) {
      console.error('Error adding student to evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error adding student to evaluation',
      });
    }
  }

  async removeStudentFromEvaluation(
    evaluationId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      const evaluation =
        await this.studentevaluationModel.findByPk(evaluationId);
      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Get current student IDs or initialize empty array
      const currentStudentIds = evaluation.studentId || [];

      // Check if student is in the evaluation
      if (!currentStudentIds.includes(studentId)) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Student is not participating in this evaluation',
        });
      }

      // Remove student from the evaluation
      const updatedStudentIds = currentStudentIds.filter(
        (id) => id !== studentId,
      );
      await evaluation.update({ studentId: updatedStudentIds });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluationId,
          studentId,
          totalStudents: updatedStudentIds.length,
        },
        customMessage: 'Student removed from evaluation successfully',
      });
    } catch (error) {
      console.error('Error removing student from evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error removing student from evaluation',
      });
    }
  }

  async update(
    id: string,
    updateStudentevaluationDto: UpdateStudentevaluationDto,
  ): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id);

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // lessonId is optional - can be provided along with sessionCoursId
      const { sessionCoursId, lessonId } = updateStudentevaluationDto;

      // Validate that the linked entity exists if provided
      if (sessionCoursId) {
        const sessionCours =
          await this.sessionCoursModel.findByPk(sessionCoursId);
        if (!sessionCours) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Session course not found',
          });
        }
      }

      if (lessonId && lessonId.length > 0) {
        // Validate that all lessons exist
        const lessons = await this.lessonModel.findAll({
          where: { id: { [Op.in]: lessonId } },
        });
        if (lessons.length !== lessonId.length) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'One or more lessons not found',
          });
        }
      }

      // Validate time fields if provided
      const { beginningTime, endingTime } = updateStudentevaluationDto;
      if (beginningTime && endingTime) {
        const [beginHour, beginMin] = beginningTime.split(':').map(Number);
        const [endHour, endMin] = endingTime.split(':').map(Number);
        const beginMinutes = beginHour * 60 + beginMin;
        const endMinutes = endHour * 60 + endMin;

        if (beginMinutes >= endMinutes) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: 'Beginning time must be before ending time',
          });
        }
      }

      // Convert string date to Date object if present
      const updateData: any = { ...updateStudentevaluationDto };
      if (
        updateData.submittiondate &&
        typeof updateData.submittiondate === 'string'
      ) {
        updateData.submittiondate = new Date(updateData.submittiondate);
      }

      const updatedEvaluation = await evaluation.update(updateData);

      console.log('✅ Student evaluation updated successfully:', {
        id: updatedEvaluation.id,
        title: updatedEvaluation.title,
        type: updatedEvaluation.type,
        points: updatedEvaluation.points,
        sessionCoursId: updatedEvaluation.sessionCoursId,
        lessonId: updatedEvaluation.lessonId,
        createdBy: updatedEvaluation.createdBy,
        ispublish: updatedEvaluation.ispublish,
        updatedAt: updatedEvaluation.updatedAt,
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluation: updatedEvaluation,
          message: 'Student evaluation updated successfully',
          details: {
            id: updatedEvaluation.id,
            title: updatedEvaluation.title,
            type: updatedEvaluation.type,
            points: updatedEvaluation.points,
            sessionCoursId: updatedEvaluation.sessionCoursId,
            lessonId: updatedEvaluation.lessonId,
            createdBy: updatedEvaluation.createdBy,
            ispublish: updatedEvaluation.ispublish,
            updatedAt: updatedEvaluation.updatedAt,
          },
        },
        customMessage: 'Student evaluation updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating student evaluation:', error);

      // Provide more specific error messages
      let errorMessage = 'Error updating student evaluation';
      if (error.name === 'SequelizeValidationError') {
        errorMessage =
          'Validation error: ' + error.errors.map((e) => e.message).join(', ');
        console.error('🔍 Validation Error Details:', error.errors);
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage =
          'Invalid reference: The referenced session course or lesson does not exist';
        console.error('🔗 Foreign Key Error:', error.message);
      } else if (error.name === 'SequelizeDatabaseError') {
        errorMessage = 'Database error: ' + error.message;
        console.error('🗄️ Database Error:', error.message);
      } else {
        console.error('⚠️ Unexpected Error:', error.name, error.message);
      }

      console.error('📋 Error Response:', {
        status: HttpStatusCode.InternalServerError,
        errorMessage,
        errorName: error.name,
        errorDetails: error.details || null,
      });

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: error.name,
          message: error.message,
          details: error.details || null,
        },
        customMessage: errorMessage,
      });
    }
  }

  async updateMarkingStatus(
    id: string,
    markingStatus: string,
  ): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id);

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Validate marking status
      const validStatuses = [
        'pending',
        'in_progress',
        'completed',
        'published',
      ];
      if (!validStatuses.includes(markingStatus)) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: `Invalid marking status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Update the marking status
      await evaluation.update({
        markingStatus: markingStatus as MarkingStatus,
      });

      console.log('✅ Marking status updated successfully:', {
        id: evaluation.id,
        title: evaluation.title,
        markingStatus: markingStatus,
        updatedAt: new Date(),
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluation: evaluation,
          message: 'Marking status updated successfully',
          details: {
            id: evaluation.id,
            title: evaluation.title,
            markingStatus: markingStatus,
            updatedAt: evaluation.updatedAt,
          },
        },
        customMessage: 'Marking status updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating marking status:', error);
      const errorMessage = 'Error updating marking status';
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: error.name,
          message: error.message,
          details: error.details || null,
        },
        customMessage: errorMessage,
      });
    }
  }

  async updateEvaluationStatus(
    id: string,
    updateStatusDto: UpdateEvaluationStatusDto,
  ): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id);

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Prepare update data
      const updateData: any = {};

      if (updateStatusDto.ispublish !== undefined) {
        updateData.ispublish = updateStatusDto.ispublish;
      }

      if (updateStatusDto.isImmediateResult !== undefined) {
        updateData.isImmediateResult = updateStatusDto.isImmediateResult;
      }

      if (updateStatusDto.markingStatus !== undefined) {
        updateData.markingStatus = updateStatusDto.markingStatus;
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'No status fields provided for update',
        });
      }

      // Update the evaluation status
      await evaluation.update(updateData);

      console.log('✅ Evaluation status updated successfully:', {
        id: evaluation.id,
        title: evaluation.title,
        updatedFields: updateData,
        updatedAt: new Date(),
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluation: evaluation,
          message: 'Evaluation status updated successfully',
          details: {
            id: evaluation.id,
            title: evaluation.title,
            ...updateData,
            updatedAt: evaluation.updatedAt,
          },
        },
        customMessage: 'Evaluation status updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating evaluation status:', error);
      const errorMessage = 'Error updating evaluation status';
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: error.name,
          message: error.message,
          details: error.details || null,
        },
        customMessage: errorMessage,
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id, {
        include: [
          {
            model: EvaluationQuestion,
            as: 'questions',
            include: [
              {
                model: EvaluationQuestionOption,
                as: 'options',
              },
            ],
          },
        ],
      });

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      console.log(
        '🗑️ Starting cascade deletion for evaluation:',
        evaluation.id,
      );
      console.log(
        '📊 Found questions to delete:',
        evaluation.questions?.length || 0,
      );

      // Count total options to be deleted
      let totalOptionsToDelete = 0;
      if (evaluation.questions) {
        for (const question of evaluation.questions) {
          totalOptionsToDelete += question.options?.length || 0;
        }
      }
      console.log('📝 Found options to delete:', totalOptionsToDelete);

      // Start transaction for cascade deletion
      const transaction =
        await this.studentevaluationModel.sequelize!.transaction();

      try {
        // Delete all evaluation question options first
        if (evaluation.questions) {
          for (const question of evaluation.questions) {
            if (question.options && question.options.length > 0) {
              await EvaluationQuestionOption.destroy({
                where: { questionId: question.id },
                transaction,
              });
              console.log(
                `✅ Deleted ${question.options.length} options for question ${question.id}`,
              );
            }
          }
        }

        // Delete all evaluation questions
        if (evaluation.questions && evaluation.questions.length > 0) {
          await EvaluationQuestion.destroy({
            where: { evaluationId: id },
            transaction,
          });
          console.log(
            `✅ Deleted ${evaluation.questions.length} questions for evaluation ${id}`,
          );
        }

        // Finally delete the student evaluation
        await evaluation.destroy({ transaction });

        // Commit the transaction
        await transaction.commit();

        console.log(
          '✅ Cascade deletion completed successfully for evaluation:',
          id,
        );

        return Responder({
          status: HttpStatusCode.Ok,
          customMessage: `Student evaluation and all associated data deleted successfully. Deleted ${evaluation.questions?.length || 0} questions and ${totalOptionsToDelete} options.`,
          data: {
            deletedEvaluation: {
              id: evaluation.id,
              title: evaluation.title,
            },
            deletedQuestions: evaluation.questions?.length || 0,
            deletedOptions: totalOptionsToDelete,
          },
        });
      } catch (transactionError) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error(
          '❌ Transaction rolled back due to error:',
          transactionError,
        );
        throw transactionError;
      }
    } catch (error) {
      console.error(
        '❌ Error during cascade deletion of student evaluation:',
        error,
      );

      let errorMessage = 'Error deleting student evaluation';
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorMessage =
          'Cannot delete evaluation due to existing references. Please remove all related data first.';
      } else if (error.name === 'SequelizeDatabaseError') {
        errorMessage = 'Database error occurred during deletion.';
      }

      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: errorMessage,
        data: {
          error: error.message,
          errorType: error.name,
        },
      });
    }
  }

  async getEvaluationQuestionsForStudent(
    evaluationId: string,
    studentId: string,
  ): Promise<ResponseServer> {
    try {
      console.log(
        `[STUDENT EVALUATION SERVICE] Getting evaluation questions for student ${studentId} and evaluation ${evaluationId}`,
      );

      // First, get the evaluation with all its details
      const evaluation = await this.studentevaluationModel.findByPk(
        evaluationId,
        {
          include: [
            {
              model: EvaluationQuestion,
              as: 'questions',
              attributes: ['id', 'type', 'text', 'points', 'isImmediateResult'],
              include: [
                {
                  model: EvaluationQuestionOption,
                  as: 'options',
                  attributes: ['id', 'text', 'isCorrect'],
                },
              ],
            },
          ],
        },
      );

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      // Check if the evaluation is published
      if (!evaluation.ispublish) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'This evaluation is not yet published',
        });
      }

      // Check if the student is enrolled in this evaluation
      if (
        !evaluation.studentId ||
        !Array.isArray(evaluation.studentId) ||
        !evaluation.studentId.includes(studentId)
      ) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'You are not enrolled in this evaluation',
        });
      }

      // Check if the evaluation is still available (not past submission date)
      const now = new Date();
      const submissionDate = new Date(evaluation.submittiondate);

      if (now > submissionDate) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'This evaluation has expired',
        });
      }

      // Return evaluation data without sessionCours and lessons
      const evaluationData = evaluation.toJSON();

      console.log(
        `[STUDENT EVALUATION SERVICE] ✅ Successfully retrieved evaluation questions for student ${studentId}`,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluationData,
        customMessage: 'Evaluation questions retrieved successfully',
      });
    } catch (error) {
      console.error(
        '[STUDENT EVALUATION SERVICE] Error getting evaluation questions for student:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          "Erreur lors de la récupération des questions d'évaluation",
      });
    }
  }
}
