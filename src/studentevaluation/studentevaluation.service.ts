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
import { Event } from 'src/models/model.event';
import { Op, literal, QueryTypes } from 'sequelize';
import {
  MarkingStatus,
  StudentevaluationType,
} from 'src/models/model.studentevaluation';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { TrainingType } from 'src/interface/interface.trainings';

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
    @InjectModel(EvaluationQuestion)
    private evaluationQuestionModel: typeof EvaluationQuestion,
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
    @InjectModel(Event)
    private eventModel: typeof Event,
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
          lessonId: literal(`"lessonId"::jsonb @> '["${lessonId}"]'::jsonb`),
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
          ispublish: true,
          markingStatus: MarkingStatus.PENDING,
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

      const now = new Date();
      const activeEvaluations = evaluations.filter((evaluation) => {
        if (!evaluation.submittiondate) {
          return true;
        }

        const submissionDate = new Date(evaluation.submittiondate);
        if (Number.isNaN(submissionDate.getTime())) {
          return true;
        }

        return now <= submissionDate;
      });

      // Get all unique lesson IDs from evaluations and fetch lessons
      const allLessonIds = activeEvaluations.reduce((acc, evaluation) => {
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
      const evaluationsWithLessons = activeEvaluations.map((evaluation) => {
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
          total: evaluationsWithLessons.length,
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
        MarkingStatus.PENDING,
        MarkingStatus.IN_PROGRESS,
        MarkingStatus.PUBLISHED,
      ];
      if (!validStatuses.includes(markingStatus as MarkingStatus)) {
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

  async getMarkingStatus(
    evaluationId: string,
    instructorId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== getMarkingStatus: Starting ===');
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
          ],
          attributes: [
            'id',
            'title',
            'description',
            'type',
            'points',
            'markingStatus',
            'sessionCoursId',
            'createdAt',
            'updatedAt',
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

      console.log('✅ getMarkingStatus: Success');
      console.log('Marking Status:', evaluation.markingStatus);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          markingStatus: evaluation.markingStatus,
        },
        customMessage: 'Marking status retrieved successfully',
      });
    } catch (error) {
      console.error('❌ Error getting marking status:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: error.name,
          message: error.message,
          details: error.details || null,
        },
        customMessage: 'Error retrieving marking status',
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
      let studentAnswers: any[] = [];
      let studentAnswerStats = new Map<
        string,
        { total: number; marked: number }
      >();

      if (evaluation.isImmediateResult) {
        // For isImmediateResult evaluations, query StudentAnswerOption directly
        // First, get all questions for this evaluation
        const questions = await this.evaluationQuestionModel.findAll({
          where: {
            evaluationId: evaluationId,
          },
          attributes: ['id'],
        });

        const questionIds = questions.map((q) => q.id);

        if (questionIds.length > 0) {
          // Query StudentAnswerOption directly for these questions
          // Now we can filter by studentId directly since it's in the model
          const studentAnswerOptions =
            await this.studentAnswerOptionModel.findAll({
              where: {
                questionId: {
                  [Op.in]: questionIds,
                },
              },
              attributes: ['id', 'questionId', 'points', 'studentId'],
              include: [
                {
                  model: EvaluationQuestion,
                  as: 'question',
                  attributes: ['id', 'evaluationId'],
                  where: {
                    evaluationId: evaluationId,
                  },
                  required: true,
                },
              ],
            });

          console.log(
            `Evaluation: "${evaluation.title}" - Found ${studentAnswerOptions.length} StudentAnswerOption records`,
          );

          // Group StudentAnswerOptions by studentId and questionId
          // Now we can use studentId directly from StudentAnswerOption
          const studentQuestionOptionsMap = new Map<
            string,
            Map<string, any[]>
          >();
          studentAnswerOptions.forEach((option: any) => {
            const studentId = option.studentId;
            const questionId = option.questionId;

            if (!studentQuestionOptionsMap.has(studentId)) {
              studentQuestionOptionsMap.set(studentId, new Map());
            }
            const questionMap = studentQuestionOptionsMap.get(studentId)!;

            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, []);
            }
            questionMap.get(questionId)!.push({
              id: option.id,
              questionId: option.questionId,
              points: option.points,
            });
          });

          // Create answer entries for each student-question combination
          studentQuestionOptionsMap.forEach((questionMap, studentId) => {
            questionMap.forEach((options, questionId) => {
              const totalPoints = options.reduce(
                (sum, opt) => sum + (opt.points || 0),
                0,
              );

              studentAnswers.push({
                studentId: studentId,
                questionId: questionId,
                points: totalPoints,
                selectedOptions: options,
              });

              // Update stats
              if (!studentAnswerStats.has(studentId)) {
                studentAnswerStats.set(studentId, { total: 0, marked: 0 });
              }
              const stats = studentAnswerStats.get(studentId)!;
              stats.total++;
              if (totalPoints > 0) {
                stats.marked++;
              }
            });
          });

          console.log(
            `Evaluation: "${evaluation.title}" - Created ${studentAnswers.length} student answer entries from StudentAnswerOption`,
          );
        }
      } else {
        // For non-immediate result evaluations, use StudentAnswer model
        const studentAnswersQuery: any = {
          where: {
            evaluationId: evaluationId,
          },
          attributes: ['studentId', 'points', 'questionId'],
          raw: true,
        };

        studentAnswers =
          await this.studentAnswerModel.findAll(studentAnswersQuery);

        // Extract unique student IDs and calculate marked answers percentage
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
      }

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

      // Calculate results for each student
      // Get all questions for this evaluation to calculate total possible points
      const questions = await this.evaluationQuestionModel.findAll({
        where: {
          evaluationId: evaluationId,
        },
        attributes: ['id', 'points', 'type'],
      });

      const questionIds = questions.map((q) => q.id);

      // Calculate total possible points
      const totalPossiblePoints = questions.reduce(
        (sum, question) => sum + (question.points || 0),
        0,
      );

      // Calculate total points earned by each student
      const studentPointsMap = new Map<string, number>();

      studentAnswers.forEach((answer: any) => {
        const studentId = answer.studentId;
        // Points are already calculated from selectedOptions for isImmediateResult evaluations
        // or from StudentAnswer.points for regular evaluations
        const points = answer.points || 0;

        const currentTotal = studentPointsMap.get(studentId) || 0;
        studentPointsMap.set(studentId, currentTotal + points);
      });

      console.log(`=== getStudentsWhoAnsweredEvaluation: Success ===`);
      console.log(
        `Evaluation: "${evaluation.title}" - Found ${students.length} unique students who answered questions`,
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
            let markedPercentage =
              stats.total > 0
                ? Math.round((stats.marked / stats.total) * 100 * 100) / 100
                : 0;
            let markedAnswers = stats.marked;

            if (evaluation.isImmediateResult && stats.total > 0) {
              markedPercentage = 100;
              markedAnswers = stats.total;
            }

            const totalPointsEarned = studentPointsMap.get(student.id) || 0;
            const percentage =
              totalPossiblePoints > 0
                ? Math.round(
                    (totalPointsEarned / totalPossiblePoints) * 100 * 100,
                  ) / 100
                : 0;

            return {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              avatar: student.avatar || null,
              totalAnswers: stats.total,
              markedAnswers: markedAnswers,
              markedPercentage: markedPercentage,
              totalPointsEarned: totalPointsEarned,
              totalPossiblePoints: totalPossiblePoints,
              percentage: percentage,
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
      // Include only quiz, test, and examen types (all published evaluations)
      const evaluationWhere: any = {
        sessionCoursId: {
          [Op.in]: sessionCoursIds,
        },
        ispublish: true,
        markingStatus: MarkingStatus.PUBLISHED,
        type: {
          [Op.in]: [
            StudentevaluationType.QUIZ,
            StudentevaluationType.TEST,
            StudentevaluationType.EXAMEN,
          ],
        },
      };

      // If lessonId filter is provided, also filter by lessonId in the evaluation
      if (filters.lessonId) {
        evaluationWhere[Op.or] = [
          literal(`"lessonId"::jsonb @> '["${filters.lessonId}"]'::jsonb`),
          { lessonId: null },
        ];
      }

      // Get all evaluations matching the criteria (include sessionCoursId to map to sessions)
      // Note: evaluations can be empty, but we still want to return all students
      const evaluations = await this.studentevaluationModel.findAll({
        where: evaluationWhere,
        attributes: [
          'id',
          'title',
          'points',
          'type',
          'submittiondate',
          'sessionCoursId',
          'isImmediateResult',
        ],
      });

      const evaluationIds = evaluations.map((e) => e.id);
      const overallTotalPossiblePoints = 20;

      // Get all student answers for all evaluations
      // Include answers from both StudentAnswer and StudentAnswerOption tables
      // regardless of isImmediateResult value
      const studentAnswers: Array<{
        studentId: string;
        evaluationId: string;
        points: number;
      }> = [];

      // Get answers from StudentAnswer table for all evaluations
      if (evaluationIds.length > 0) {
        const studentAnswersWhere: any = {
          evaluationId: {
            [Op.in]: evaluationIds,
          },
        };

        // If studentId is provided, filter for that student only
        if (filters.studentId) {
          studentAnswersWhere.studentId = filters.studentId;
        }

        const studentAnswersFromTable = await this.studentAnswerModel.findAll({
          where: studentAnswersWhere,
          attributes: ['studentId', 'evaluationId', 'points'],
        });

        studentAnswersFromTable.forEach((answer) => {
          studentAnswers.push({
            studentId: answer.studentId,
            evaluationId: answer.evaluationId,
            points: answer.points || 0,
          });
        });
      }

      // Get answers from StudentAnswerOption table for all evaluations
      if (evaluationIds.length > 0) {
        // Get all questions for all evaluations
        const questions = await this.evaluationQuestionModel.findAll({
          where: {
            evaluationId: {
              [Op.in]: evaluationIds,
            },
          },
          attributes: ['id', 'evaluationId'],
        });

        const questionIds = questions.map((q) => q.id);

        if (questionIds.length > 0) {
          // Query StudentAnswerOption for these questions
          const studentAnswerOptionsWhere: any = {
            questionId: {
              [Op.in]: questionIds,
            },
          };

          // If studentId is provided, filter for that student only
          if (filters.studentId) {
            studentAnswerOptionsWhere.studentId = filters.studentId;
          }

          const studentAnswerOptions =
            await this.studentAnswerOptionModel.findAll({
              where: studentAnswerOptionsWhere,
              attributes: ['id', 'questionId', 'points', 'studentId'],
              include: [
                {
                  model: EvaluationQuestion,
                  as: 'question',
                  attributes: ['id', 'evaluationId'],
                  required: true,
                },
              ],
            });

          // Group StudentAnswerOptions by studentId and evaluationId
          const studentEvaluationPointsMap = new Map<
            string,
            Map<string, number>
          >();

          studentAnswerOptions.forEach((option: any) => {
            const studentId = option.studentId;
            const evaluationId = option.question?.evaluationId;

            if (!evaluationId) return;

            if (!studentEvaluationPointsMap.has(studentId)) {
              studentEvaluationPointsMap.set(studentId, new Map());
            }
            const evaluationMap = studentEvaluationPointsMap.get(studentId)!;

            const currentPoints = evaluationMap.get(evaluationId) || 0;
            evaluationMap.set(
              evaluationId,
              currentPoints + (option.points || 0),
            );
          });

          // Convert to studentAnswers format
          studentEvaluationPointsMap.forEach((evaluationMap, studentId) => {
            evaluationMap.forEach((totalPoints, evaluationId) => {
              studentAnswers.push({
                studentId: studentId,
                evaluationId: evaluationId,
                points: totalPoints,
              });
            });
          });
        }
      }

      // Create a map of evaluationId -> evaluation points (total possible points)
      const evaluationPointsMap = new Map<string, number>();
      evaluations.forEach((evaluation) => {
        evaluationPointsMap.set(evaluation.id, evaluation.points || 0);
      });

      // Group answers by student and evaluation, then calculate scores normalized to /20 per evaluation
      // First, aggregate points per student per evaluation
      const studentEvaluationPointsMap = new Map<string, Map<string, number>>();

      studentAnswers.forEach((answer) => {
        const studentId = answer.studentId;
        const evaluationId = answer.evaluationId;

        if (!studentEvaluationPointsMap.has(studentId)) {
          studentEvaluationPointsMap.set(studentId, new Map());
        }
        const evaluationMap = studentEvaluationPointsMap.get(studentId)!;

        const currentPoints = evaluationMap.get(evaluationId) || 0;
        evaluationMap.set(evaluationId, currentPoints + (answer.points || 0));
      });

      // Now calculate stats with scores normalized to /20 per evaluation
      const studentStatsMap = new Map<
        string,
        {
          studentId: string;
          totalPointsEarned: number; // Sum of scores converted to /20
          evaluationCount: number;
        }
      >();

      studentEvaluationPointsMap.forEach((evaluationMap, studentId) => {
        let totalPointsEarnedNormalized = 0;
        let evaluationCount = 0;

        evaluationMap.forEach((pointsEarned, evaluationId) => {
          const evaluationPoints = evaluationPointsMap.get(evaluationId) || 0;

          if (evaluationPoints > 0) {
            // Convert points earned to scale over 20 for this evaluation
            const scoreOver20 = (pointsEarned / evaluationPoints) * 20;
            totalPointsEarnedNormalized += scoreOver20;
            evaluationCount += 1;
          }
        });

        studentStatsMap.set(studentId, {
          studentId,
          totalPointsEarned: totalPointsEarnedNormalized,
          evaluationCount,
        });
      });

      // Get all students based on filters
      let allEnrolledStudentIds: string[] = [];

      // If studentId filter is provided, use only that student
      if (filters.studentId) {
        allEnrolledStudentIds = [filters.studentId];
      } else {
        // Determine which sessions to get students from based on filters
        let sessionIdsForStudents: string[] = [];

        if (filters.trainingId) {
          // Get all sessions for this training
          const trainingSessions = await this.trainingSessionModel.findAll({
            where: {
              id_trainings: filters.trainingId,
            },
            attributes: ['id'],
          });
          sessionIdsForStudents = trainingSessions.map((ts) => ts.id);
        } else if (filters.trainingsessionId) {
          // Use the specific session
          sessionIdsForStudents = [filters.trainingsessionId];
        } else if (filters.sessioncoursId) {
          // Get session from sessioncours
          const sessionCoursList = await this.sessionCoursModel.findAll({
            where: {
              id: filters.sessioncoursId,
            },
            attributes: ['id_session'],
          });
          sessionIdsForStudents = sessionCoursList
            .map((sc) => sc.id_session)
            .filter(Boolean) as string[];
        } else if (filters.lessonId) {
          // Get session from lesson's sessioncours
          const lessons = await this.lessonModel.findAll({
            where: {
              id: filters.lessonId,
            },
            attributes: ['id_cours'],
          });
          const lessonSessionCoursIds = lessons
            .map((l) => l.id_cours)
            .filter(Boolean) as string[];

          if (lessonSessionCoursIds.length > 0) {
            const sessionCoursList = await this.sessionCoursModel.findAll({
              where: {
                id: {
                  [Op.in]: lessonSessionCoursIds,
                },
              },
              attributes: ['id_session'],
            });
            sessionIdsForStudents = sessionCoursList
              .map((sc) => sc.id_session)
              .filter(Boolean) as string[];
          }
        }
        // If no filter is provided, sessionIdsForStudents will be empty
        // and we'll get all students in the system

        // Get all students enrolled in these sessions (if any sessions found)
        if (sessionIdsForStudents.length > 0) {
          const userInSessions = await this.userInSessionModel.findAll({
            where: {
              id_session: {
                [Op.in]: sessionIdsForStudents,
              },
              status: 'in', // Only active enrollments
            },
            attributes: ['id_user'],
          });
          allEnrolledStudentIds = Array.from(
            new Set(userInSessions.map((uis) => uis.id_user)),
          );
        }
        // If no sessions found (no filter), allEnrolledStudentIds will remain empty
        // and we'll get all students below
      }

      // Get student details
      // If no filter or no enrolled students found, get ALL students in the system
      const studentsWhere: any = {
        role: 'student', // Only get students
      };

      if (allEnrolledStudentIds.length > 0) {
        // If we have specific enrolled students, use them
        studentsWhere.id = {
          [Op.in]: allEnrolledStudentIds,
        };
      }
      // If allEnrolledStudentIds is empty and no filter, studentsWhere will only have role='student'
      // which will return ALL students in the system

      const students = await this.usersModel.findAll({
        where: studentsWhere,
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
      });

      // Helper function to calculate hours from time strings (HH:MM format)
      const calculateHoursFromTime = (
        beginningHour: string,
        endingHour: string,
      ): number => {
        try {
          const [beginHour, beginMin] = beginningHour.split(':').map(Number);
          const [endHour, endMin] = endingHour.split(':').map(Number);
          const beginTotalMinutes = beginHour * 60 + beginMin;
          const endTotalMinutes = endHour * 60 + endMin;
          const diffMinutes = endTotalMinutes - beginTotalMinutes;
          // Handle case where ending time is next day
          const totalMinutes =
            diffMinutes < 0 ? diffMinutes + 24 * 60 : diffMinutes;
          return totalMinutes / 60; // Convert to hours
        } catch (error) {
          console.error('Error calculating hours from time:', error);
          return 0;
        }
      };

      // Calculate sessionStats from evaluations (always, not just when trainingId is provided)
      // Get all sessionCours for the evaluations to map to sessions
      const evaluationSessionCoursIds = evaluations
        .map((e) => e.sessionCoursId)
        .filter(Boolean) as string[];

      const studentSessionStatsMap = new Map<
        string,
        Array<{
          sessionId: string;
          sessionTitle: string;
          studentPoints: number;
          sessionAverage: number;
          totalMaxPoints: number;
        }>
      >();

      if (evaluationSessionCoursIds.length > 0) {
        // Get sessionCours with their session information
        const sessionCoursList = await this.sessionCoursModel.findAll({
          where: {
            id: {
              [Op.in]: evaluationSessionCoursIds,
            },
          },
          attributes: ['id', 'id_session'],
          include: [
            {
              model: TrainingSession,
              attributes: ['id', 'title'],
              required: false,
            },
          ],
        });

        // Create map: sessionCoursId -> sessionId
        const sessionCoursToSessionMap = new Map<string, string>();
        const sessionIdToTitleMap = new Map<string, string>();
        sessionCoursList.forEach((sc) => {
          if (sc.id_session && sc.trainingSession) {
            sessionCoursToSessionMap.set(sc.id, sc.id_session);
            sessionIdToTitleMap.set(sc.id_session, sc.trainingSession.title);
          }
        });

        // Get evaluations with their sessionId
        const evaluationsWithSession = evaluations.map((evaluation) => ({
          ...evaluation.toJSON(),
          sessionId: sessionCoursToSessionMap.get(evaluation.sessionCoursId),
        }));

        // Group evaluations by session
        const evaluationsBySession = new Map<
          string,
          Array<(typeof evaluationsWithSession)[0]>
        >();
        evaluationsWithSession.forEach((evaluation) => {
          if (evaluation.sessionId) {
            if (!evaluationsBySession.has(evaluation.sessionId)) {
              evaluationsBySession.set(evaluation.sessionId, []);
            }
            evaluationsBySession.get(evaluation.sessionId)!.push(evaluation);
          }
        });

        // Calculate per-session statistics for all students
        const sessionStatsMap = new Map<
          string,
          {
            totalMaxPoints: number;
            studentPointsMap: Map<string, number>;
          }
        >();

        evaluationsBySession.forEach((sessionEvals, sessionId) => {
          const totalMaxPoints = sessionEvals.reduce(
            (sum, evaluation) => sum + (evaluation.points || 0),
            0,
          );

          // Get all student answers for these evaluations
          const sessionEvalIds = sessionEvals.map((e) => e.id);
          const sessionStudentAnswers = studentAnswers.filter((answer) =>
            sessionEvalIds.includes(answer.evaluationId),
          );

          // Calculate points per student for this session
          const studentPointsMap = new Map<string, number>();
          sessionStudentAnswers.forEach((answer) => {
            const currentPoints = studentPointsMap.get(answer.studentId) || 0;
            studentPointsMap.set(
              answer.studentId,
              currentPoints + (answer.points || 0),
            );
          });

          sessionStatsMap.set(sessionId, {
            totalMaxPoints,
            studentPointsMap,
          });
        });

        // For each student, calculate their session stats
        // Use students from studentStatsMap (those with evaluations) for sessionStats calculation
        // Students without evaluations will have empty sessionStats arrays
        const studentIdsForSessionStats = Array.from(studentStatsMap.keys());
        studentIdsForSessionStats.forEach((studentId) => {
          const sessionStats: Array<{
            sessionId: string;
            sessionTitle: string;
            studentPoints: number;
            sessionAverage: number;
            totalMaxPoints: number;
          }> = [];

          evaluationsBySession.forEach((sessionEvals, sessionId) => {
            const sessionTitle = sessionIdToTitleMap.get(sessionId) || '';
            const sessionStatsData = sessionStatsMap.get(sessionId);

            if (sessionStatsData) {
              const studentPoints =
                sessionStatsData.studentPointsMap.get(studentId) || 0;
              const totalMaxPoints = sessionStatsData.totalMaxPoints;

              // Calculate average points for all students in this session
              const allStudentPoints = Array.from(
                sessionStatsData.studentPointsMap.values(),
              );
              const sessionAverage =
                allStudentPoints.length > 0
                  ? allStudentPoints.reduce((sum, pts) => sum + pts, 0) /
                    allStudentPoints.length
                  : 0;

              // Only include sessions where this student has evaluations
              if (
                studentPoints > 0 ||
                sessionEvals.some((e) =>
                  studentAnswers.some(
                    (sa) =>
                      sa.evaluationId === e.id && sa.studentId === studentId,
                  ),
                )
              ) {
                sessionStats.push({
                  sessionId,
                  sessionTitle,
                  studentPoints,
                  sessionAverage: Math.round(sessionAverage * 100) / 100,
                  totalMaxPoints,
                });
              }
            }
          });

          studentSessionStatsMap.set(studentId, sessionStats);
        });
      }

      // If trainingId filter is provided, get additional training information
      let trainingPeriod: { startDate?: Date; endDate?: Date } | null = null;
      const studentSessionTitlesMap = new Map<string, string[]>();
      const studentTotalHoursMap = new Map<string, number>();

      if (filters.trainingId) {
        // Get all sessions for this training
        const trainingSessions = await this.trainingSessionModel.findAll({
          where: {
            id_trainings: filters.trainingId,
          },
          attributes: ['id', 'title', 'begining_date', 'ending_date'],
        });

        // Calculate training period (earliest start to latest end)
        if (trainingSessions.length > 0) {
          const dates = trainingSessions
            .map((ts) => ({
              start: ts.begining_date,
              end: ts.ending_date,
            }))
            .filter((d) => d.start && d.end);
          if (dates.length > 0) {
            trainingPeriod = {
              startDate: new Date(
                Math.min(...dates.map((d) => new Date(d.start).getTime())),
              ),
              endDate: new Date(
                Math.max(...dates.map((d) => new Date(d.end).getTime())),
              ),
            };
          }
        }

        // For each student, get their sessions and calculate hours
        const sessionIds = trainingSessions.map((ts) => ts.id);
        // Use all enrolled students, not just those with evaluations
        const studentIdsForTraining =
          allEnrolledStudentIds.length > 0
            ? allEnrolledStudentIds
            : Array.from(studentStatsMap.keys());
        for (const studentId of studentIdsForTraining) {
          // Get sessions this student is in
          const userSessions = await this.userInSessionModel.findAll({
            where: {
              id_user: studentId,
              id_session: {
                [Op.in]: sessionIds,
              },
            },
            include: [
              {
                model: TrainingSession,
                attributes: ['id', 'title'],
              },
            ],
          });

          // Get session titles
          const sessionTitles = userSessions
            .map((us) => us.trainingSession?.title)
            .filter(Boolean) as string[];
          studentSessionTitlesMap.set(studentId, sessionTitles);

          // Get all events for these sessions
          const userSessionIds = userSessions.map((us) => us.id_session);
          if (userSessionIds.length > 0) {
            const events = await this.eventModel.findAll({
              where: {
                id_cible_session: {
                  [Op.in]: userSessionIds,
                },
              },
              attributes: ['beginning_hour', 'ending_hour'],
            });

            // Calculate total hours from all events
            let totalHours = 0;
            events.forEach((event) => {
              if (event.beginning_hour && event.ending_hour) {
                totalHours += calculateHoursFromTime(
                  event.beginning_hour,
                  event.ending_hour,
                );
              }
            });
            studentTotalHoursMap.set(studentId, totalHours);
          }
        }
      }

      // Calculate matiere-based statistics (grouped by sessionCoursId)
      // Get all sessionCours details for matiere information
      const allSessionCoursIds = Array.from(
        new Set(evaluations.map((e) => e.sessionCoursId).filter(Boolean)),
      );
      const sessionCoursDetails =
        allSessionCoursIds.length > 0
          ? await this.sessionCoursModel.findAll({
              where: {
                id: {
                  [Op.in]: allSessionCoursIds,
                },
              },
              attributes: ['id', 'title', 'ponderation'],
              include: [
                {
                  model: TrainingSession,
                  attributes: ['id', 'id_trainings'],
                  required: false,
                  include: [
                    {
                      model: Training,
                      attributes: ['id', 'trainingtype'],
                      required: false,
                    },
                  ],
                },
              ],
            })
          : [];
      const sessionCoursMap = new Map<
        string,
        {
          id: string;
          title: string;
          modality: TrainingType | null;
          coefficient: number | null;
        }
      >();
      sessionCoursDetails.forEach((sc) => {
        // Get modality from training type via the relationship chain
        // SessionCours -> TrainingSession -> Training -> trainingtype
        // The Training relationship in TrainingSession is named 'trainings' (plural)
        const training = (sc.trainingSession as any)?.trainings;
        const modality: TrainingType | null = training?.trainingtype || null;

        sessionCoursMap.set(sc.id, {
          id: sc.id,
          title: sc.title || '',
          modality,
          coefficient:
            typeof sc.ponderation === 'number' ? sc.ponderation : null,
        });
      });

      // Helper function to get comment based on score over 20
      const getComment = (scoreOver20: number): string => {
        if (scoreOver20 >= 0 && scoreOver20 <= 6) {
          return 'Ajournée';
        } else if (scoreOver20 >= 7 && scoreOver20 <= 10) {
          return 'Admissible';
        } else if (scoreOver20 >= 11 && scoreOver20 <= 20) {
          return 'Admis';
        }
        return 'Ajournée'; // Default for scores outside expected range
      };

      // Generate releveTable for each student with ALL evaluations
      // This includes all evaluations, not grouped by matiere
      const studentReleveTableMap = new Map<
        string,
        Array<{
          matiereTitle: string;
          evaluationTitle: string;
          evaluationType: string;
          pointsEarned: number;
          totalPossiblePoints: number;
          scoreOver20: number;
          comment: string;
          modality: string | null;
          percentage: number;
          didEvaluation: boolean;
        }>
      >();

      // Use all students we fetched for releveTable calculation
      // This ensures all students get a releveTable entry, even if they have no evaluations
      const studentIdsForReleve = students.map((s) => s.id);

      studentIdsForReleve.forEach((studentId) => {
        const releveTable: Array<{
          matiereTitle: string;
          evaluationTitle: string;
          evaluationType: string;
          pointsEarned: number;
          totalPossiblePoints: number;
          scoreOver20: number;
          comment: string;
          modality: string | null;
          percentage: number;
          didEvaluation: boolean;
        }> = [];

        // Get student answers for this student
        const studentAnswersForStudent = studentAnswers.filter(
          (answer) => answer.studentId === studentId,
        );

        // Create a map of evaluationId -> total points earned
        const studentEvaluationPointsMap = new Map<string, number>();
        studentAnswersForStudent.forEach((answer) => {
          const currentPoints =
            studentEvaluationPointsMap.get(answer.evaluationId) || 0;
          studentEvaluationPointsMap.set(
            answer.evaluationId,
            currentPoints + (answer.points || 0),
          );
        });

        // For each evaluation, create an entry in releveTable
        // Note: Only evaluations with markingStatus='published' are included
        // (evaluations array is already filtered by markingStatus: MarkingStatus.PUBLISHED)
        evaluations.forEach((evaluation) => {
          const matiereInfo = sessionCoursMap.get(evaluation.sessionCoursId);
          if (!matiereInfo) return;

          const pointsEarned =
            studentEvaluationPointsMap.get(evaluation.id) || 0;
          const totalPossiblePoints = evaluation.points || 0;
          const didEvaluation = studentEvaluationPointsMap.has(evaluation.id);

          // Convert to score over 20
          const scoreOver20 =
            totalPossiblePoints > 0
              ? (pointsEarned / totalPossiblePoints) * 20
              : 0;
          const scoreOver20Rounded = Math.round(scoreOver20 * 100) / 100;

          // Get comment based on score (only if student did the evaluation)
          const comment = didEvaluation ? getComment(scoreOver20) : 'Ajournée';

          // Calculate percentage
          const percentage = (scoreOver20Rounded / 20) * 100;

          // Round actual points earned for consistency (not converted to /20)
          const pointsEarnedRounded = Math.round(pointsEarned * 100) / 100;

          releveTable.push({
            matiereTitle: matiereInfo.title,
            evaluationTitle: evaluation.title || '',
            evaluationType: String(evaluation.type),
            pointsEarned: didEvaluation ? pointsEarnedRounded : 0,
            totalPossiblePoints,
            scoreOver20: didEvaluation ? scoreOver20Rounded : 0,
            comment,
            modality: matiereInfo.modality
              ? String(matiereInfo.modality)
              : null,
            percentage: didEvaluation ? Math.round(percentage * 100) / 100 : 0,
            didEvaluation,
          });
        });

        studentReleveTableMap.set(studentId, releveTable);
      });

      // Count all published evaluations based on the most specific filter
      // This needs to be calculated before building the result array for average calculation
      // Filter priority: lessonId > sessioncoursId > trainingsessionId > trainingId > no filter (all)
      // Include only quiz, test, and examen types
      const totalEvaluationsWhere: any = {
        ispublish: true,
        markingStatus: MarkingStatus.PUBLISHED,
        type: {
          [Op.in]: [
            StudentevaluationType.QUIZ,
            StudentevaluationType.TEST,
            StudentevaluationType.EXAMEN,
          ],
        },
      };

      if (filters.lessonId) {
        // Most specific: filter by lessonId
        // Get sessioncours for this lesson
        const lessons = await this.lessonModel.findAll({
          where: {
            id: filters.lessonId,
          },
          attributes: ['id_cours'],
        });
        const lessonSessionCoursIds = lessons
          .map((l) => l.id_cours)
          .filter(Boolean) as string[];

        if (lessonSessionCoursIds.length > 0) {
          totalEvaluationsWhere.sessionCoursId = {
            [Op.in]: lessonSessionCoursIds,
          };
          totalEvaluationsWhere[Op.or] = [
            literal(`"lessonId"::jsonb @> '["${filters.lessonId}"]'::jsonb`),
            { lessonId: null },
          ];
        } else {
          // No sessioncours found for this lesson, return 0
          totalEvaluationsWhere.sessionCoursId = { [Op.in]: [] };
        }
      } else if (filters.sessioncoursId) {
        // Filter by sessioncoursId
        totalEvaluationsWhere.sessionCoursId = filters.sessioncoursId;
      } else if (filters.trainingsessionId) {
        // Filter by trainingsessionId - get all sessioncours for this session
        const sessionCoursList = await this.sessionCoursModel.findAll({
          where: {
            id_session: filters.trainingsessionId,
          },
          attributes: ['id'],
        });
        const sessionCoursIdsForCount = sessionCoursList.map((sc) => sc.id);
        if (sessionCoursIdsForCount.length > 0) {
          totalEvaluationsWhere.sessionCoursId = {
            [Op.in]: sessionCoursIdsForCount,
          };
        } else {
          // No sessioncours found for this session, return 0
          totalEvaluationsWhere.sessionCoursId = { [Op.in]: [] };
        }
      } else if (filters.trainingId) {
        // Filter by trainingId - get all sessioncours for all sessions in this training
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
          const sessionCoursIdsForCount = sessionCoursList.map((sc) => sc.id);
          if (sessionCoursIdsForCount.length > 0) {
            totalEvaluationsWhere.sessionCoursId = {
              [Op.in]: sessionCoursIdsForCount,
            };
          } else {
            // No sessioncours found for this training, return 0
            totalEvaluationsWhere.sessionCoursId = { [Op.in]: [] };
          }
        } else {
          // No sessions found for this training, return 0
          totalEvaluationsWhere.sessionCoursId = { [Op.in]: [] };
        }
      }
      // If no filter, totalEvaluationsWhere will only have the base conditions
      // which will count ALL published evaluations in the system

      const totalEvaluationsCount = await this.studentevaluationModel.count({
        where: totalEvaluationsWhere,
      });

      // Build result array - include ALL enrolled students, even if they have no evaluations
      // totalEvaluationsCount is the total number of evaluations available based on filters
      const result = students.map((student) => {
        const stats = studentStatsMap.get(student.id);

        // If student has no evaluations, use default values (zeros)
        const hasEvaluations = stats && stats.evaluationCount > 0;

        // Total number of evaluations available (based on filters)
        // This is the count of ALL evaluations, not just the ones the student did
        const totalEvaluationsAvailable = totalEvaluationsCount;

        // Get releveTable for this student
        const releveTable = studentReleveTableMap.get(student.id) || [];

        // Calculate totalPointsEarned from releveTable
        // For each evaluation in releveTable, convert pointsEarned to /20 scale using totalPossiblePoints
        // Then sum all converted scores and normalize to get totalPointsEarned over 20
        let totalPointsEarnedSumOver20 = 0;
        let completedEvaluationsCount = 0;

        releveTable.forEach((entry) => {
          if (entry.didEvaluation && entry.totalPossiblePoints > 0) {
            // Convert pointsEarned to /20 scale for this evaluation
            const scoreOver20 =
              (entry.pointsEarned / entry.totalPossiblePoints) * 20;
            totalPointsEarnedSumOver20 += scoreOver20;
            completedEvaluationsCount += 1;
          }
        });

        // Normalize totalPointsEarned to be over 20 (average across all evaluations)
        // If there are N total evaluations, divide the sum by N to get average over 20
        const totalPossiblePointsNormalized = 20;
        const totalPointsEarnedNormalized =
          totalEvaluationsAvailable > 0
            ? totalPointsEarnedSumOver20 / totalEvaluationsAvailable
            : 0;

        // Calculate average points over ALL evaluations (not just the ones student did)
        // If student did 2 out of 10 evaluations, average is calculated over all 10
        // averagePoints = totalPointsEarnedNormalized (already normalized to /20)
        const averagePoints = totalPointsEarnedNormalized;

        // Calculate average points over ONLY evaluations the student completed
        // If student did 2 out of 10 evaluations, averageDid is calculated over only those 2
        // averageDid = totalPointsEarnedSumOver20 / completedEvaluationsCount
        const averageDid =
          completedEvaluationsCount > 0
            ? totalPointsEarnedSumOver20 / completedEvaluationsCount
            : 0;

        // Calculate percentage based on normalized values (out of 20)
        const percentage =
          totalPossiblePointsNormalized > 0
            ? (totalPointsEarnedNormalized / totalPossiblePointsNormalized) *
              100
            : 0;

        const baseResult: any = {
          studentId: student.id,
          studentName:
            `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
            'Unknown',
          studentEmail: student.email,
          studentAvatar: student.avatar || null,
          averagePoints: Math.round(averagePoints * 100) / 100,
          averageDid: Math.round(averageDid * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          totalPointsEarned:
            Math.round(totalPointsEarnedNormalized * 100) / 100,
          totalPossiblePoints: totalPossiblePointsNormalized,
          evaluationCount: completedEvaluationsCount,
        };

        // Add releveTable with all evaluations (includes didEvaluation flag)
        // If student has no evaluations, releveTable will still contain all evaluations with didEvaluation: false
        baseResult.releveTable = releveTable;

        // Add training-specific fields (always included for consistent structure)
        baseResult.sessionTitles = filters.trainingId
          ? studentSessionTitlesMap.get(student.id) || []
          : [];
        baseResult.totalHours = filters.trainingId
          ? Math.round((studentTotalHoursMap.get(student.id) || 0) * 100) / 100
          : 0;

        return baseResult;
      });

      const responseData: any = {
        students: result,
        filters: filters,
        totalEvaluations: totalEvaluationsCount,
        totalPossiblePoints: overallTotalPossiblePoints,
      };

      // Add training period if trainingId filter is provided
      if (filters.trainingId && trainingPeriod) {
        responseData.trainingPeriod = {
          startDate: trainingPeriod.startDate,
          endDate: trainingPeriod.endDate,
        };
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: responseData,
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

  /**
   * Generate releve table from matiereStats
   * Formats matiereStats into a table structure for transcript/report
   */
  generateReleveTable(
    matiereStats: Array<{
      matiereTitle: string;
      pointsEarned: number;
      totalPossiblePoints: number;
      scoreOver20: number;
      comment: string;
      evaluationTypes: string;
      modality: TrainingType | null;
      percentage: number;
    }>,
  ): Array<{
    matiereTitle: string;
    evaluationType: string;
    pointsEarned: number;
    totalPossiblePoints: number;
    scoreOver20: number;
    comment: string;
    modality: string | null;
    percentage: number;
  }> {
    return matiereStats.map((matiere) => ({
      matiereTitle: matiere.matiereTitle,
      evaluationType: matiere.evaluationTypes, // evaluationTypes is now a string
      pointsEarned: matiere.pointsEarned,
      totalPossiblePoints: matiere.totalPossiblePoints,
      scoreOver20: matiere.scoreOver20,
      comment: matiere.comment,
      modality: matiere.modality ? String(matiere.modality) : null,
      percentage: matiere.percentage,
    }));
  }
}
