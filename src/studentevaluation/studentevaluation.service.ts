import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Studentevaluation } from 'src/models/model.studentevaluation';
import { CreateStudentevaluationDto } from './dto/create-studentevaluation.dto';
import { UpdateStudentevaluationDto } from './dto/update-studentevaluation.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Users } from 'src/models/model.users';
import { EvaluationQuestion } from 'src/models/model.evaluationquestion';
import { EvaluationQuestionOption } from 'src/models/model.evaluationquestionoption';
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';
import { Op } from 'sequelize';

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
        attributes: ['id', 'title', 'description'],
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
          attributes: ['id', 'title', 'description'],
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
        attributes: ['id', 'title', 'description'],
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
        attributes: ['id', 'title', 'description'],
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
        attributes: ['id', 'title', 'description'],
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

  async remove(id: string): Promise<ResponseServer> {
    try {
      const evaluation = await this.studentevaluationModel.findByPk(id);

      if (!evaluation) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Student evaluation not found',
        });
      }

      await evaluation.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Student evaluation deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting student evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting student evaluation',
      });
    }
  }
}
