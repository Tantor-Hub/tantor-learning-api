import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import databaseConfig from './config/config.database';
import { Users } from './models/model.users';

import { Sequelize } from 'sequelize-typescript';
import { UsersModule } from './users/users.module';
import { FormationsModule } from './formations/formations.module';
import { Formations } from './models/model.formations';
import { TrainingCategory } from './models/model.trainingcategory';
import { SessionsModule } from './sessions/sessions.module';
import { WebrtcGatewayService } from './services/service.webrtc';
import { MediasoupService } from './services/service.mediasoup';
import { GoogleDriveService } from './services/service.googledrive';
import { DocsService } from './services/service.docs';
import { AllSercices } from './services/serices.all';
import { CmsService } from './cms/cms.service';
import { CmsModule } from './cms/cms.module';
import { AppInfos } from './models/model.appinfos';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { CryptoService } from './services/service.crypto';
import { JwtService } from './services/service.jwt';
import { Dialect } from 'sequelize';

import { log } from 'node:console';
import { Contacts } from './models/model.contactform';
import { MailService } from './services/service.mail';
import { Messages } from './models/model.messages';
import { CoursService } from './cours/cours.service';
import { CoursModule } from './cours/cours.module';
import { Cours } from './models/model.cours';
import { Session } from './models/model.session';

import { Newsletter } from './models/model.newsletter';
import { UsersService } from './users/users.service';

import { Questionnaires } from './models/model.questionnaireoninscriptionsession';
import { Survey } from './models/model.questionspourquestionnaireinscription';
import { Payementopco } from './models/model.payementbyopco';
import { SurveyResponse } from './models/model.surveyresponses';
import { ModuleDeFormation } from './models/model.moduledeformation';
import { ModuleDeFormationModule } from './moduledeformation/moduledeformation.module';
import { TrainingCategoryModule } from './trainingcategory/trainingcategory.module';
import { TrainingsModule } from './trainings/trainings.module';
import { Training as TrainingModel } from './models/model.trainings';
import { StripeModule } from './stripe/stripe.module';
import { LessonModule } from './lesson/lesson.module';
import { LessondocumentModule } from './lessondocument/lessondocument.module';
import { SessiondocumentModule } from './sessiondocument/sessiondocument.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres' as Dialect,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadModels: true,
        synchronize: false,
        logging: false,
        // logging: console.log,
      }),
    }),
    SequelizeModule.forFeature([
      Users,
      Formations,
      TrainingCategory,
      TrainingModel,
      AppInfos,
      Contacts,
      Messages,
      Newsletter,
      Cours,
      Session,
      Payementopco,
      Survey,
      Questionnaires,
      SurveyResponse,
    ]),
    // Removed RolesModule as roles module is deleted
    // RolesModule,
    UsersModule,
    FormationsModule,
    SessionsModule,
    CmsModule,
    CoursModule,
    LessonModule,
    LessondocumentModule,
    SessiondocumentModule,
    StripeModule,
    ModuleDeFormationModule,
    TrainingCategoryModule,
    TrainingsModule,
  ],
  providers: [
    AppService,
    MediasoupService,
    WebrtcGatewayService,
    GoogleDriveService,
    DocsService,
    AllSercices,
    JwtService,
    NestJwtService,
    CryptoService,
    MailService,
    UsersService,
    // Removed RolesService as roles module is deleted
    // RolesService,
  ],
  controllers: [AppController],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      this.sequelize
        .sync({ alter: false, force: false })
        .then((_) => {
          console.log(
            '[ Database ] Connexion réussie',
            this.sequelize.getDatabaseName(),
          );
          // const connectionUri = this.sequelize.options['url'] || this.sequelize.options.host;
          // const models = Object.keys(this.sequelize.models);
          // console.log(`[ URL ] ${connectionUri} [ Database ] : `, this.sequelize.getDatabaseName());
        })
        .catch((err) => log('[ DB Error ]', err));
    } catch (error) {
      console.error('[ Database ] Échec de connexion : ', error.message);
    }
  }
}
