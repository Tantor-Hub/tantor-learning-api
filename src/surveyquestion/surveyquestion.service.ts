import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SurveyQuestion } from 'src/models/model.surveyquestion';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CreateSurveyQuestionDto } from './dto/create-surveyquestion.dto';
import { UpdateSurveyQuestionDto } from './dto/update-surveyquestion.dto';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class SurveyQuestionService {
  constructor(
    @InjectModel(SurveyQuestion)
    private surveyQuestionModel: typeof SurveyQuestion,
    @InjectModel(Users)
    private userModel: typeof Users,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
  ) {}

  async create(
    createSurveyQuestionDto: CreateSurveyQuestionDto,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      // Validate that the training session exists
      const trainingSession = await this.trainingSessionModel.findByPk(
        createSurveyQuestionDto.id_session,
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Training session not found',
        });
      }

      // Validate that the user exists
      const creator = await this.userModel.findOne({
        where: { uuid: user.uuid_user },
      });
      if (!creator) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'User not found',
        });
      }

      const surveyQuestion = await this.surveyQuestionModel.create({
        ...createSurveyQuestionDto,
        createdBy: user.uuid_user,
      });

      return Responder({
        status: HttpStatusCode.Created,
        data: surveyQuestion,
        customMessage: 'Survey question created successfully',
      });
    } catch (error) {
      console.error('Error creating survey question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error creating survey question',
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const surveyQuestions = await this.surveyQuestionModel.findAll({
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['uuid', 'fs_name', 'ls_name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestions,
        customMessage: 'Survey questions retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving survey questions:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving survey questions',
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const surveyQuestion = await this.surveyQuestionModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['uuid', 'fs_name', 'ls_name', 'email'],
          },
        ],
      });

      if (!surveyQuestion) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Survey question not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestion,
        customMessage: 'Survey question retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving survey question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving survey question',
      });
    }
  }

  async update(
    user: IJwtSignin,
    id: string,
    updateSurveyQuestionDto: UpdateSurveyQuestionDto,
  ): Promise<ResponseServer> {
    try {
      const surveyQuestion = await this.surveyQuestionModel.findByPk(id);
      if (!surveyQuestion) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Survey question not found',
        });
      }

      // Check if user is the creator or has admin privileges
      if (surveyQuestion.createdBy !== user.uuid_user) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'You can only update surveys you created',
        });
      }

      // If updating training session, validate that the training session exists
      if (updateSurveyQuestionDto.id_session) {
        const trainingSession = await this.trainingSessionModel.findByPk(
          updateSurveyQuestionDto.id_session,
        );
        if (!trainingSession) {
          return Responder({
            status: HttpStatusCode.BadRequest,
            customMessage: 'Training session not found',
          });
        }
      }

      await surveyQuestion.update(updateSurveyQuestionDto);

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestion,
        customMessage: 'Survey question updated successfully',
      });
    } catch (error) {
      console.error('Error updating survey question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error updating survey question',
      });
    }
  }

  async remove(user: IJwtSignin, id: string): Promise<ResponseServer> {
    try {
      const surveyQuestion = await this.surveyQuestionModel.findByPk(id);
      if (!surveyQuestion) {
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Survey question not found',
        });
      }

      // Check if user is the creator or has admin privileges
      if (surveyQuestion.createdBy !== user.uuid_user) {
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'You can only delete surveys you created',
        });
      }

      await surveyQuestion.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        customMessage: 'Survey question deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting survey question:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error deleting survey question',
      });
    }
  }

  async findBySessionId(sessionId: string): Promise<ResponseServer> {
    try {
      const surveyQuestions = await this.surveyQuestionModel.findAll({
        where: { id_session: sessionId },
        include: [
          {
            model: Users,
            as: 'creator',
            attributes: ['uuid', 'fs_name', 'ls_name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestions,
        customMessage: 'Survey questions retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving survey questions by session:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving survey questions',
      });
    }
  }

  async findByCreator(creatorId: string): Promise<ResponseServer> {
    try {
      const surveyQuestions = await this.surveyQuestionModel.findAll({
        where: { createdBy: creatorId },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestions,
        customMessage: 'Survey questions retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving survey questions by creator:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving survey questions',
      });
    }
  }

  async findByCategory(
    category: 'before' | 'during' | 'after',
  ): Promise<ResponseServer> {
    try {
      const surveyQuestions = await this.surveyQuestionModel.findAll({
        where: { categories: category },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            attributes: ['id', 'title'],
          },
          {
            model: Users,
            as: 'creator',
            attributes: ['uuid', 'fs_name', 'ls_name', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: surveyQuestions,
        customMessage: 'Survey questions retrieved successfully',
      });
    } catch (error) {
      console.error('Error retrieving survey questions by category:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        customMessage: 'Error retrieving survey questions',
      });
    }
  }
}
