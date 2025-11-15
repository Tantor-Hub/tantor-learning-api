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
import { StudentAnswer } from 'src/models/model.studentanswer';
import { StudentAnswerOption } from 'src/models/model.studentansweroption';
import { UserInSession } from 'src/models/model.userinsession';
import { TrainingSession } from 'src/models/model.trainingssession';
import { Training } from 'src/models/model.trainings';
import { Op } from 'sequelize';
import {
  MarkingStatus,
  StudentevaluationType,
} from 'src/models/model.studentevaluation';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

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
    @InjectModel(StudentAnswer)
    private studentAnswerModel: typeof StudentAnswer,
    @InjectModel(StudentAnswerOption)
    private studentAnswerOptionModel: typeof StudentAnswerOption,
    @InjectModel(UserInSession)
    private userInSessionModel: typeof UserInSession,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
    @InjectModel(Training)
    private trainingModel: typeof Training,
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

  async findBySessionCoursIdForInstructor(
    sessionCoursId: string,
    instructorId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== findBySessionCoursIdForInstructor: Starting ===');
      console.log('SessionCours ID:', sessionCoursId);
      console.log('Instructor ID:', instructorId);

      // First verify that the session course exists and instructor is assigned
      const sessionCours = await this.sessionCoursModel.findByPk(
        sessionCoursId,
        {
          attributes: ['id', 'title', 'description', 'id_formateur'],
        },
      );

      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found',
        });
      }

      // Verify instructor is assigned to this sessioncours
      const isInstructorAssigned =
        sessionCours.id_formateur &&
        Array.isArray(sessionCours.id_formateur) &&
        sessionCours.id_formateur.includes(instructorId);

      if (!isInstructorAssigned) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            'You are not assigned as an instructor for this session course',
        });
      }

      // Get all evaluations (both published and unpublished) for this sessioncours
      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          sessionCoursId: sessionCoursId,
          // No filter on ispublish - return both published and unpublished
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
          {
            model: Users,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false,
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

      const lessons =
        uniqueLessonIds.length > 0
          ? await this.lessonModel.findAll({
              where: { id: { [Op.in]: uniqueLessonIds } },
              attributes: ['id', 'title', 'description', 'ispublish'],
            })
          : [];

      // Add lessons to each evaluation
      const evaluationsWithLessons = evaluations.map((evaluation) => {
        const evaluationLessonIds = evaluation.lessonId;
        const evaluationLessons =
          evaluationLessonIds && Array.isArray(evaluationLessonIds)
            ? lessons.filter((lesson) =>
                evaluationLessonIds.includes(lesson.id),
              )
            : [];
        return {
          ...evaluation.toJSON(),
          lessons: evaluationLessons,
        };
      });

      console.log(`=== findBySessionCoursIdForInstructor: Success ===`);
      console.log(`Found ${evaluations.length} evaluations`);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluations: evaluationsWithLessons,
          total: evaluations.length,
          published: evaluations.filter((e) => e.ispublish).length,
          unpublished: evaluations.filter((e) => !e.ispublish).length,
          sessionCours: {
            id: sessionCours.id,
            title: sessionCours.title,
            description: sessionCours.description,
          },
        },
        customMessage:
          'Student evaluations for session course retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error fetching student evaluations by session course ID for instructor:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage:
          'Error retrieving student evaluations for session course',
      });
    }
  }

  async getStudentsWhoAnsweredEvaluation(
    evaluationId: string,
    instructorId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== getStudentsWhoAnsweredEvaluation: Starting ===');
      console.log('Evaluation ID:', evaluationId);
      console.log('Instructor ID:', instructorId);

      // First get the evaluation with its sessioncours
      const evaluation = await this.studentevaluationModel.findByPk(
        evaluationId,
        {
          include: [
            {
              model: SessionCours,
              as: 'sessionCours',
              attributes: ['id', 'title', 'description', 'id_formateur'],
            },
            {
              model: Users,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'email'],
              required: false,
            },
          ],
        },
      );

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Evaluation not found',
        });
      }

      // Verify instructor is assigned to this sessioncours
      const sessionCours = evaluation.sessionCours as any;
      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found for this evaluation',
        });
      }

      const isInstructorAssigned =
        sessionCours.id_formateur &&
        Array.isArray(sessionCours.id_formateur) &&
        sessionCours.id_formateur.includes(instructorId);

      if (!isInstructorAssigned) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            "You are not assigned as an instructor for this evaluation's session course",
        });
      }

      // Get all student answers for this evaluation with points information
      const studentAnswers = await this.studentAnswerModel.findAll({
        where: {
          evaluationId: evaluationId,
        },
        attributes: ['studentId', 'points'],
        raw: true,
      });

      // Extract unique student IDs and calculate marked answers percentage
      const studentAnswerStats = new Map<
        string,
        { total: number; marked: number }
      >();

      studentAnswers.forEach((answer: any) => {
        const studentId = answer.studentId;
        if (!studentAnswerStats.has(studentId)) {
          studentAnswerStats.set(studentId, { total: 0, marked: 0 });
        }
        const stats = studentAnswerStats.get(studentId)!;
        stats.total++;
        // An answer is considered marked if it has points assigned (points is not null)
        if (answer.points !== null && answer.points !== undefined) {
          stats.marked++;
        }
      });

      const uniqueStudentIds = Array.from(studentAnswerStats.keys());

      if (uniqueStudentIds.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            evaluation: {
              id: evaluation.id,
              title: evaluation.title,
              description: evaluation.description,
              type: evaluation.type,
              points: evaluation.points,
              sessionCoursId: evaluation.sessionCoursId,
            },
            students: [],
            totalStudents: 0,
          },
          customMessage:
            'No students have answered questions in this evaluation yet',
        });
      }

      // Get student details
      const students = await this.usersModel.findAll({
        where: {
          id: {
            [Op.in]: uniqueStudentIds,
          },
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        order: [
          ['lastName', 'ASC'],
          ['firstName', 'ASC'],
        ],
      });

      // Get lessons for the evaluation
      const evaluationLessonIds = evaluation.lessonId;
      const lessons =
        evaluationLessonIds && Array.isArray(evaluationLessonIds)
          ? await this.lessonModel.findAll({
              where: { id: { [Op.in]: evaluationLessonIds } },
              attributes: ['id', 'title', 'description', 'ispublish'],
            })
          : [];

      console.log(`=== getStudentsWhoAnsweredEvaluation: Success ===`);
      console.log(
        `Found ${students.length} unique students who answered questions`,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluation: {
            id: evaluation.id,
            title: evaluation.title,
            description: evaluation.description,
            type: evaluation.type,
            points: evaluation.points,
            submittiondate: evaluation.submittiondate,
            beginningTime: evaluation.beginningTime,
            endingTime: evaluation.endingTime,
            ispublish: evaluation.ispublish,
            isImmediateResult: evaluation.isImmediateResult,
            markingStatus: evaluation.markingStatus,
            sessionCoursId: evaluation.sessionCoursId,
            lessonId: evaluation.lessonId,
            createdAt: evaluation.createdAt,
            updatedAt: evaluation.updatedAt,
            sessionCours: {
              id: sessionCours.id,
              title: sessionCours.title,
              description: sessionCours.description,
            },
            creator: evaluation.creator
              ? {
                  id: evaluation.creator.id,
                  firstName: evaluation.creator.firstName,
                  lastName: evaluation.creator.lastName,
                  email: evaluation.creator.email,
                }
              : null,
            lessons: lessons,
          },
          students: students.map((student) => {
            const stats = studentAnswerStats.get(student.id) || {
              total: 0,
              marked: 0,
            };
            const markedPercentage =
              stats.total > 0
                ? Math.round((stats.marked / stats.total) * 100 * 100) / 100
                : 0;

            return {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              avatar: student.avatar || null,
              totalAnswers: stats.total,
              markedAnswers: stats.marked,
              markedPercentage: markedPercentage,
            };
          }),
          totalStudents: students.length,
        },
        customMessage:
          'Students who answered questions in evaluation retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching students who answered evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving students who answered evaluation',
      });
    }
  }

  async getAllStudentAnswersForEvaluation(
    evaluationId: string,
    instructorId: string,
    studentId?: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== getAllStudentAnswersForEvaluation: Starting ===');
      console.log('Evaluation ID:', evaluationId);
      console.log('Instructor ID:', instructorId);

      // First get the evaluation with its sessioncours
      const evaluation = await this.studentevaluationModel.findByPk(
        evaluationId,
        {
          include: [
            {
              model: SessionCours,
              as: 'sessionCours',
              attributes: ['id', 'title', 'description', 'id_formateur'],
            },
            {
              model: Users,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'email'],
              required: false,
            },
            {
              model: EvaluationQuestion,
              as: 'questions',
              attributes: ['id', 'type', 'text', 'points'],
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
          customMessage: 'Evaluation not found',
        });
      }

      // Verify instructor is assigned to this sessioncours
      const sessionCours = evaluation.sessionCours as any;
      if (!sessionCours) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Session course not found for this evaluation',
        });
      }

      const isInstructorAssigned =
        sessionCours.id_formateur &&
        Array.isArray(sessionCours.id_formateur) &&
        sessionCours.id_formateur.includes(instructorId);

      if (!isInstructorAssigned) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            "You are not assigned as an instructor for this evaluation's session course",
        });
      }

      // Build where clause - filter by evaluationId and optionally by studentId
      const whereClause: any = {
        evaluationId: evaluationId,
      };

      if (studentId) {
        whereClause.studentId = studentId;
      }

      // Get all student answers for this evaluation with question and student info
      const studentAnswers = await this.studentAnswerModel.findAll({
        where: whereClause,
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
          },
          {
            model: EvaluationQuestion,
            as: 'question',
            attributes: ['id', 'type', 'text', 'points'],
            include: [
              {
                model: EvaluationQuestionOption,
                as: 'options',
                attributes: ['id', 'text', 'isCorrect'],
              },
            ],
          },
        ],
        order: [
          ['studentId', 'ASC'],
          ['questionId', 'ASC'],
        ],
      });

      // Get lessons for the evaluation
      const evaluationLessonIds = evaluation.lessonId;
      const lessons =
        evaluationLessonIds && Array.isArray(evaluationLessonIds)
          ? await this.lessonModel.findAll({
              where: { id: { [Op.in]: evaluationLessonIds } },
              attributes: ['id', 'title', 'description', 'ispublish'],
            })
          : [];

      // Format the answers with question data
      const formattedAnswers = studentAnswers.map((answer) => ({
        id: answer.id,
        questionId: answer.questionId,
        studentId: answer.studentId,
        evaluationId: answer.evaluationId,
        answerText: answer.answerText,
        isCorrect: answer.isCorrect,
        points: answer.points,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        student: answer.student
          ? {
              id: answer.student.id,
              firstName: answer.student.firstName,
              lastName: answer.student.lastName,
              email: answer.student.email,
              avatar: answer.student.avatar || null,
            }
          : null,
        question: answer.question
          ? {
              id: answer.question.id,
              type: answer.question.type,
              text: answer.question.text,
              points: answer.question.points,
              options: answer.question.options || [],
            }
          : null,
      }));

      console.log(`=== getAllStudentAnswersForEvaluation: Success ===`);
      console.log(`Found ${studentAnswers.length} student answers`);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          evaluation: {
            id: evaluation.id,
            title: evaluation.title,
            description: evaluation.description,
            type: evaluation.type,
            points: evaluation.points,
            submittiondate: evaluation.submittiondate,
            beginningTime: evaluation.beginningTime,
            endingTime: evaluation.endingTime,
            ispublish: evaluation.ispublish,
            isImmediateResult: evaluation.isImmediateResult,
            markingStatus: evaluation.markingStatus,
            sessionCoursId: evaluation.sessionCoursId,
            lessonId: evaluation.lessonId,
            createdAt: evaluation.createdAt,
            updatedAt: evaluation.updatedAt,
            sessionCours: {
              id: sessionCours.id,
              title: sessionCours.title,
              description: sessionCours.description,
            },
            creator: evaluation.creator
              ? {
                  id: evaluation.creator.id,
                  firstName: evaluation.creator.firstName,
                  lastName: evaluation.creator.lastName,
                  email: evaluation.creator.email,
                }
              : null,
            lessons: lessons,
            questions: evaluation.questions || [],
          },
          answers: formattedAnswers,
          totalAnswers: formattedAnswers.length,
        },
        customMessage:
          'All student answers for evaluation retrieved successfully',
      });
    } catch (error) {
      console.error(
        'Error fetching all student answers for evaluation:',
        error,
      );
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving all student answers for evaluation',
      });
    }
  }

  async getStudentStatisticsBySession(
    studentId: string,
    sessionId: string,
  ): Promise<ResponseServer> {
    try {
      // Verify the student is enrolled in this session
      const userInSession = await this.userInSessionModel.findOne({
        where: {
          id_user: studentId,
          id_session: sessionId,
          status: 'in', // Only active enrollments
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
      });

      if (!userInSession || !userInSession.trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage:
            'Session not found or student is not enrolled in this session',
        });
      }

      // Get all sessioncours for this specific session
      const sessionCoursList = await this.sessionCoursModel.findAll({
        where: {
          id_session: sessionId,
        },
        attributes: ['id'],
      });

      const sessionCoursIds = sessionCoursList.map((sc) => sc.id);

      if (sessionCoursIds.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            averagePoints: 0,
            percentage: 0,
            totalPointsEarned: 0,
            totalPossiblePoints: 0,
            futureHomeworkCount: 0,
            sessionCoursCount: 0,
          },
          customMessage: 'Student statistics retrieved successfully',
        });
      }

      // Get all evaluations for these sessioncours
      // Filter by markingStatus = 'published' and type in ['test', 'quiz', 'examen']
      const evaluations = await this.studentevaluationModel.findAll({
        where: {
          sessionCoursId: {
            [Op.in]: sessionCoursIds,
          },
          ispublish: true,
          markingStatus: MarkingStatus.PUBLISHED,
          type: {
            [Op.in]: [
              StudentevaluationType.TEST,
              StudentevaluationType.QUIZ,
              StudentevaluationType.EXAMEN,
            ],
          },
        },
        attributes: ['id', 'points', 'type', 'submittiondate'],
      });

      // Calculate total possible points
      const totalPossiblePoints = evaluations.reduce(
        (sum, evaluation) => sum + (evaluation.points || 0),
        0,
      );

      // Get all student answers for these evaluations
      const studentAnswers = await this.studentAnswerModel.findAll({
        where: {
          studentId: studentId,
          evaluationId: {
            [Op.in]: evaluations.map((e) => e.id),
          },
        },
        attributes: ['evaluationId', 'points'],
      });

      // Calculate total points earned
      const totalPointsEarned = studentAnswers.reduce(
        (sum, answer) => sum + (answer.points || 0),
        0,
      );

      // Calculate average points (average per evaluation)
      const evaluationCount = evaluations.length;
      const averagePoints =
        evaluationCount > 0 ? totalPointsEarned / evaluationCount : 0;

      // Calculate percentage
      const percentage =
        totalPossiblePoints > 0
          ? (totalPointsEarned / totalPossiblePoints) * 100
          : 0;

      // Count future homework evaluations
      const now = new Date();
      const futureHomeworkCount = evaluations.filter(
        (evaluation) =>
          evaluation.type === StudentevaluationType.HOMEWORK &&
          new Date(evaluation.submittiondate) > now,
      ).length;

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          sessionId: sessionId,
          averagePoints: Math.round(averagePoints * 100) / 100, // Round to 2 decimal places
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
          totalPointsEarned,
          totalPossiblePoints,
          futureHomeworkCount,
          sessionCoursCount: sessionCoursIds.length,
          evaluationCount,
        },
        customMessage: 'Student statistics retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving student statistics:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student statistics',
      });
    }
  }

  async getSecretaryStudentStatistics(filters: {
    trainingId?: string;
    trainingsessionId?: string;
    sessioncoursId?: string;
    lessonId?: string;
    studentId?: string;
  }): Promise<ResponseServer> {
    try {
      // Build query to find sessioncours based on filters
      let sessionCoursIds: string[] = [];

      if (filters.lessonId) {
        // If lessonId is provided, get sessioncours from lessons
        const lessons = await this.lessonModel.findAll({
          where: {
            id: filters.lessonId,
          },
          attributes: ['id_cours'],
        });
        sessionCoursIds = lessons.map((l) => l.id_cours).filter(Boolean);
      } else if (filters.sessioncoursId) {
        // If sessioncoursId is provided, use it directly
        sessionCoursIds = [filters.sessioncoursId];
      } else if (filters.trainingsessionId) {
        // If trainingsessionId is provided, get all sessioncours for that session
        const sessionCoursList = await this.sessionCoursModel.findAll({
          where: {
            id_session: filters.trainingsessionId,
          },
          attributes: ['id'],
        });
        sessionCoursIds = sessionCoursList.map((sc) => sc.id);
      } else if (filters.trainingId) {
        // If trainingId is provided, get all trainingsessions, then all sessioncours
        const trainingSessions = await this.trainingSessionModel.findAll({
          where: {
            id_trainings: filters.trainingId,
          },
          attributes: ['id'],
        });
        const sessionIds = trainingSessions.map((ts) => ts.id);
        if (sessionIds.length > 0) {
          const sessionCoursList = await this.sessionCoursModel.findAll({
            where: {
              id_session: {
                [Op.in]: sessionIds,
              },
            },
            attributes: ['id'],
          });
          sessionCoursIds = sessionCoursList.map((sc) => sc.id);
        }
      }

      // If no filters provided or no sessioncours found, return empty result
      if (
        sessionCoursIds.length === 0 &&
        !filters.lessonId &&
        !filters.sessioncoursId &&
        !filters.trainingsessionId &&
        !filters.trainingId
      ) {
        // Get all sessioncours if no filter
        const allSessionCours = await this.sessionCoursModel.findAll({
          attributes: ['id'],
        });
        sessionCoursIds = allSessionCours.map((sc) => sc.id);
      }

      if (sessionCoursIds.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            students: [],
            filters: filters,
          },
          customMessage: 'No session courses found for the given filters',
        });
      }

      // Build evaluation query
      const evaluationWhere: any = {
        sessionCoursId: {
          [Op.in]: sessionCoursIds,
        },
        ispublish: true,
        markingStatus: MarkingStatus.PUBLISHED,
        type: {
          [Op.in]: [
            StudentevaluationType.TEST,
            StudentevaluationType.QUIZ,
            StudentevaluationType.EXAMEN,
          ],
        },
      };

      // If lessonId filter is provided, also filter by lessonId in the evaluation
      if (filters.lessonId) {
        evaluationWhere[Op.or] = [
          { lessonId: { [Op.contains]: [filters.lessonId] } },
          { lessonId: null },
        ];
      }

      // Get all evaluations matching the criteria
      const evaluations = await this.studentevaluationModel.findAll({
        where: evaluationWhere,
        attributes: ['id', 'points', 'type', 'submittiondate'],
      });

      if (evaluations.length === 0) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            students: [],
            filters: filters,
            totalEvaluations: 0,
          },
          customMessage: 'No evaluations found for the given filters',
        });
      }

      const evaluationIds = evaluations.map((e) => e.id);
      const totalPossiblePoints = evaluations.reduce(
        (sum, evaluation) => sum + (evaluation.points || 0),
        0,
      );

      // Get all student answers for these evaluations
      const studentAnswersWhere: any = {
        evaluationId: {
          [Op.in]: evaluationIds,
        },
      };

      // If studentId is provided, filter for that student only
      if (filters.studentId) {
        studentAnswersWhere.studentId = filters.studentId;
      }

      const studentAnswers = await this.studentAnswerModel.findAll({
        where: studentAnswersWhere,
        attributes: ['studentId', 'evaluationId', 'points'],
      });

      // Group answers by student
      const studentStatsMap = new Map<
        string,
        {
          studentId: string;
          totalPointsEarned: number;
          evaluationCount: number;
        }
      >();

      studentAnswers.forEach((answer) => {
        const studentId = answer.studentId;
        if (!studentStatsMap.has(studentId)) {
          studentStatsMap.set(studentId, {
            studentId,
            totalPointsEarned: 0,
            evaluationCount: 0,
          });
        }
        const stats = studentStatsMap.get(studentId)!;
        stats.totalPointsEarned += answer.points || 0;
        stats.evaluationCount += 1;
      });

      // Get student details
      const studentIds = Array.from(studentStatsMap.keys());
      const students = await this.usersModel.findAll({
        where: {
          id: {
            [Op.in]: studentIds,
          },
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
      });

      // Build result array
      const result = students
        .map((student) => {
          const stats = studentStatsMap.get(student.id);
          if (!stats) {
            return null;
          }

          const averagePoints =
            stats.evaluationCount > 0
              ? stats.totalPointsEarned / stats.evaluationCount
              : 0;
          const percentage =
            totalPossiblePoints > 0
              ? (stats.totalPointsEarned / totalPossiblePoints) * 100
              : 0;

          return {
            studentId: student.id,
            studentName:
              `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
              'Unknown',
            studentEmail: student.email,
            studentAvatar: student.avatar || null,
            averagePoints: Math.round(averagePoints * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
            totalPointsEarned: stats.totalPointsEarned,
            totalPossiblePoints: totalPossiblePoints,
            evaluationCount: stats.evaluationCount,
          };
        })
        .filter(Boolean);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          students: result,
          filters: filters,
          totalEvaluations: evaluations.length,
          totalPossiblePoints: totalPossiblePoints,
        },
        customMessage: 'Student evaluation statistics retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving secretary student statistics:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving student evaluation statistics',
        data: {
          error: error.message,
        },
      });
    }
  }
}
