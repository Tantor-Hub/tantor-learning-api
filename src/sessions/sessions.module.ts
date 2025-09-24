import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { JwtService } from 'src/services/service.jwt';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Users } from 'src/models/model.users';
import { Formations } from 'src/models/model.formations';
import { MediasoupService } from 'src/services/service.mediasoup';
import { DocsService } from 'src/services/service.docs';
import { Cours } from 'src/models/model.cours';
import { Session } from 'src/models/model.session';
import { Payement } from 'src/models/model.payementbycard';
import { Survey } from 'src/models/model.questionspourquestionnaireinscription';
import { Questionnaires } from 'src/models/model.questionnaireoninscriptionsession';
import { Options } from 'src/models/model.optionquestionnaires';
import { Payementopco } from 'src/models/model.payementbyopco';
import { SurveyResponse } from 'src/models/model.surveyresponses';
import { StripeModule } from 'src/strategy/strategy.stripe';
@Module({
  imports: [
    SequelizeModule.forFeature([
      Payement,
      SurveyResponse,
      Payementopco,
      Questionnaires,
      Options,
      Survey,
      Users,
      Formations,
      Cours,
      Session,
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
    StripeModule,
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    JwtService,
    GoogleDriveService,
    AllSercices,
    MailService,
    MediasoupService,
    DocsService,
  ],
})
export class SessionsModule {}
