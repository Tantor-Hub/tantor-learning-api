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
import { SessionCours } from 'src/models/model.sessioncours';
import { Lesson } from 'src/models/model.lesson';

@Injectable()
export class StudentevaluationService {
  constructor(
    @InjectModel(Studentevaluation)
    private studentevaluationModel: typeof Studentevaluation,
    @InjectModel(SessionCours)
    private sessionCoursModel: typeof SessionCours,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
  ) {}

  async create(
    createStudentevaluationDto: CreateStudentevaluationDto,
  ): Promise<ResponseServer> {
    try {
      // Validate that either sessionCoursId or lessonId is provided, but not both
      const { sessionCoursId, lessonId } = createStudentevaluationDto;

      if (sessionCoursId && lessonId) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Evaluation can be linked to either a session course or a lesson, not both',
        });
      }

      if (!sessionCoursId && !lessonId) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Evaluation must be linked to either a session course or a lesson',
        });
      }

      // Validate that the linked entity exists
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

      if (lessonId) {
        const lesson = await this.lessonModel.findByPk(lessonId);
        if (!lesson) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Lesson not found',
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

      const evaluation = await this.studentevaluationModel.create(createData);

      return Responder({
        status: HttpStatusCode.Created,
        data: evaluation,
        customMessage: 'Student evaluation created successfully',
      });
    } catch (error) {
      console.error('Error creating student evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating student evaluation',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const evaluations = await this.studentevaluationModel.findAll({
        include: [
          {
            model: Users,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: Lesson,
            as: 'lesson',
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluations,
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
            model: Users,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: EvaluationQuestion,
            as: 'questions',
            attributes: ['id', 'type', 'text', 'points', 'isImmediateResult'],
            include: [
              {
                model: require('src/models/model.evaluationquestionoption')
                  .EvaluationQuestionOption,
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluation,
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

  async findByLecturer(lecturerId: string): Promise<ResponseServer> {
    try {
      const evaluations = await this.studentevaluationModel.findAll({
        where: { lecturerId },
        include: [
          {
            model: Users,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: SessionCours,
            as: 'sessionCours',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: Lesson,
            as: 'lesson',
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

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluations,
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

      // Validate that either sessionCoursId or lessonId is provided, but not both
      const { sessionCoursId, lessonId } = updateStudentevaluationDto;

      if (sessionCoursId && lessonId) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Evaluation can be linked to either a session course or a lesson, not both',
        });
      }

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

      if (lessonId) {
        const lesson = await this.lessonModel.findByPk(lessonId);
        if (!lesson) {
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Lesson not found',
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

      await evaluation.update(updateData);

      return Responder({
        status: HttpStatusCode.Ok,
        data: evaluation,
        customMessage: 'Student evaluation updated successfully',
      });
    } catch (error) {
      console.error('Error updating student evaluation:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating student evaluation',
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
