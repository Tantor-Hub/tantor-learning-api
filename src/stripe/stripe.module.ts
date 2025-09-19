import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeModule as StripeClientModule } from '../strategy/strategy.stripe';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payement } from '../models/model.payementbycard';
import { Payementopco } from '../models/model.payementbyopco';
import { SessionsService } from '../sessions/sessions.service';
import { JwtService } from '../services/service.jwt';
import { MailService } from '../services/service.mail';
import { AllSercices } from '../services/serices.all';
import { GoogleDriveService } from '../services/service.googledrive';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Users } from '../models/model.users';
import { FormateurHasSession } from '../models/model.formateurhassession';
import { SessionSuivi } from '../models/model.suivisession';
import { Formations } from '../models/model.formations';
import { Categories } from '../models/model.categoriesformations';
import { Thematiques } from '../models/model.groupeformations';
import { MediasoupService } from '../services/service.mediasoup';
import { StagiaireHasSession } from '../models/model.stagiairehassession';
import { DocsService } from '../services/service.docs';
import { SeanceSessions } from '../models/model.courshasseances';
import { HomeworksSession } from '../models/model.homework';
import { StagiaireHasHomeWork } from '../models/model.stagiairehashomeworks';
import { UploadDocument } from '../models/model.documentsession';
import { AvantFormationDocs } from '../models/model.avantformation';
import { PendantFormationDocs } from '../models/model.pendantformation';
import { ApresFormationDocs } from '../models/model.apresformation';
import { Cours } from '../models/model.sessionshascours';
import { Survey } from '../models/model.questionspourquestionnaireinscription';
import { Questionnaires } from '../models/model.questionnaireoninscriptionsession';
import { Options } from '../models/model.optionquestionnaires';
import { SurveyResponse } from '../models/model.surveyresponses';

@Module({
  imports: [
    StripeClientModule,
    SequelizeModule.forFeature([
      UploadDocument,
      Payement,
      SurveyResponse,
      Payementopco,
      Questionnaires,
      Options,
      Survey,
      AvantFormationDocs,
      PendantFormationDocs,
      ApresFormationDocs,
      SessionSuivi,
      Users,
      FormateurHasSession,
      Formations,
      Categories,
      Thematiques,
      StagiaireHasSession,
      SeanceSessions,
      HomeworksSession,
      StagiaireHasSession,
      StagiaireHasHomeWork,
      Cours,
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '1h'),
        },
      }),
    }),
  ],
  controllers: [StripeController],
  providers: [
    StripeService,
    SessionsService,
    JwtService,
    GoogleDriveService,
    AllSercices,
    MailService,
    MediasoupService,
    DocsService,
  ],
})
export class StripeModule {}
