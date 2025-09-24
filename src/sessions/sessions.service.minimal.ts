import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseServer } from 'src/interface/interface.response';
import { CreateSessionDto } from './dto/create-session.dto';
import { AllSercices } from '../services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Users } from 'src/models/model.users';
import { MailService } from '../services/service.mail';
import { Formations } from 'src/models/model.formations';
import { Session } from 'src/models/model.session';
import { UpdateSessionDto } from './dto/update-session.dto';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { Cours } from 'src/models/model.cours';
import { Payement } from 'src/models/model.payementbycard';
import { Survey } from 'src/models/model.questionspourquestionnaireinscription';
import { Questionnaires } from 'src/models/model.questionnaireoninscriptionsession';
import { Options } from 'src/models/model.optionquestionnaires';
import { Payementopco } from 'src/models/model.payementbyopco';
import { CpfPaymentDto, PayementOpcoDto } from './dto/payement-method-opco.dto';
import { CreateSessionFullStepDto } from './dto/create-sesion-fulldoc.dto';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { IInternalResponse } from 'src/interface/interface.internalresponse';
import { CreateSessionPaiementDto } from './dto/create-payment-full-dto';
import { RequiredDocument } from 'src/utils/utiles.documentskeyenum';
import { SurveyResponse } from 'src/models/model.surveyresponses';
import { CreateSurveyDto } from './dto/create-session-questionnaire.dto';
import { CreatePaymentSessionDto } from '../dto/payement-methode.dto';
import { Stripe } from 'stripe';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session)
    private readonly sessionModel: typeof Session,

    @InjectModel(Formations)
    private readonly formationModel: typeof Formations,

    @InjectModel(Users)
    private readonly usersModel: typeof Users,

    @InjectModel(Cours)
    private readonly coursModel: typeof Cours,

    @InjectModel(Payement)
    private readonly payementModel: typeof Payement,

    @InjectModel(Payementopco)
    private readonly payementOpcoModel: typeof Payementopco,

    @InjectModel(Survey)
    private readonly surveyModel: typeof Survey,

    @InjectModel(Questionnaires)
    private readonly questionModel: typeof Questionnaires,

    @InjectModel(Options)
    private readonly optionsModel: typeof Options,

    @InjectModel(SurveyResponse)
    private readonly surveyResponseModel: typeof SurveyResponse,

    private readonly allSercices: AllSercices,
    private readonly mailService: MailService,
    @Inject(Sequelize) private readonly sequelize: Sequelize,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      const session = await this.sessionModel.create({
        ...createSessionDto,
        createdBy: user.id_user,
      });

      return Responder({ status: HttpStatusCode.Created, data: session });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async getSessionById(id: number): Promise<ResponseServer> {
    try {
      const session = await this.sessionModel.findOne({
        where: { id },
        include: [
          {
            model: Formations,
            required: true,
          },
          {
            model: Users,
            as: 'CreatedBy',
            required: false,
          },
        ],
      });

      if (session) {
        return Responder({ status: HttpStatusCode.Ok, data: session });
      } else {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session not found',
        });
      }
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async getAllSessions(): Promise<ResponseServer> {
    try {
      const sessions = await this.sessionModel.findAll({
        include: [
          {
            model: Formations,
            required: true,
          },
          {
            model: Users,
            as: 'CreatedBy',
            required: false,
          },
        ],
      });

      return Responder({ status: HttpStatusCode.Ok, data: sessions });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async updateSession(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<ResponseServer> {
    try {
      const session = await this.sessionModel.findByPk(id);
      if (!session) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session not found',
        });
      }

      await session.update(updateSessionDto);
      return Responder({ status: HttpStatusCode.Ok, data: session });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async deleteSession(id: number): Promise<ResponseServer> {
    try {
      const session = await this.sessionModel.findByPk(id);
      if (!session) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Session not found',
        });
      }

      await session.destroy();
      return Responder({ status: HttpStatusCode.Ok, data: 'Session deleted' });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
}
