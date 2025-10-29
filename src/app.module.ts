import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import databaseConfig, { cloudinaryConfig } from './config/database.config';
import { Users } from './models/model.users';
import { UserRoles } from './models/model.userroles';

import { Sequelize } from 'sequelize-typescript';
import { UsersModule } from './users/users.module';
import { TrainingCategory } from './models/model.trainingcategory';
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

import { Newsletter } from './models/model.newsletter';
import { UsersService } from './users/users.service';

import { PaymentMethodOpco } from './models/model.paymentmethodopco';
import { ModuleDeFormation } from './models/model.moduledeformation';
import { ModuleDeFormationModule } from './moduledeformation/moduledeformation.module';
import { TrainingCategoryModule } from './trainingcategory/trainingcategory.module';
import { TrainingsModule } from './trainings/trainings.module';
import { TrainingSessionModule } from './trainingssession/trainingssession.module';
import { StudentSessionModule } from './studentsession/studentsession.module';
import { SessionCoursModule } from './sessioncours/sessioncours.module';
import { Training as TrainingModel } from './models/model.trainings';
import { LessonModule } from './lesson/lesson.module';
import { LessondocumentModule } from './lessondocument/lessondocument.module';
import { SessionDocumentModule } from './sessiondocument/sessiondocument.module';
import { SurveyQuestionModule } from './surveyquestion/surveyquestion.module';
import { EventModule } from './event/event.module';
import { ChatModule } from './chat/chat.module';
import { RepliesChatModule } from './replieschat/replieschat.module';
import { PaymentMethodCpfModule } from './paymentmethodcpf/paymentmethodcpf.module';
import { UserInSessionModule } from './userinsession/userinsession.module';
import { PaymentMethodCardModule } from './paymentmethodcard/paymentmethodcard.module';
import { PaymentMethodOpcoModule } from './paymentmethodopco/paymentmethodopco.module';
import { StudentevaluationModule } from './studentevaluation/studentevaluation.module';
import { EvaluationQuestionModule } from './evaluationquestion/evaluationquestion.module';
import { EvaluationQuestionOptionModule } from './evaluationquestionoption/evaluationquestionoption.module';
import { StudentAnswerModule } from './studentanswer/studentanswer.module';
import { StudentAnswerOptionModule } from './studentansweroption/studentansweroption.module';
import { JwtStrategy } from './strategy/strategy.jwt';
import { DocumentsModule } from './documents/documents.module';
import { DocumentTemplate } from './models/model.documenttemplate';
import { DocumentInstance } from './models/model.documentinstance';
import { UploadsModule } from './uploads/uploads.module';
import { UploadedFile } from './models/model.uploadedfile';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cloudinaryConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '24h'),
        },
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        const port = configService.get<number>('database.port');
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.database');

        // Log des informations de connexion (sans le mot de passe)
        console.log('🔗 Database Connection Config:');
        console.log(`   Host: ${host}`);
        console.log(`   Port: ${port}`);
        console.log(`   Username: ${username}`);
        console.log(`   Database: ${database}`);
        console.log(`   Password: ${password ? '***SET***' : '❌ NOT SET'}`);

        if (!host || !username || !password || !database) {
          console.error('❌ Missing required database environment variables!');
          console.error(
            'Required: APP_BD_HOST, APP_BD_USERNAME, APP_BD_PASSWORD, APP_BD_NAME',
          );
        }

        return {
          dialect: 'postgres' as Dialect,
          host,
          port: port || 5432,
          username,
          password,
          database,
          autoLoadModels: true,
          synchronize: false,
          dialectOptions: configService.get('database.dialectOptions'),
          logging: false,
          retry: {
            max: 5,
            timeout: 60000,
          },
        };
      },
    }),
    SequelizeModule.forFeature([
      Users,
      UserRoles,
      TrainingCategory,
      TrainingModel,
      AppInfos,
      Contacts,
      Messages,
      Newsletter,
      PaymentMethodOpco,
      // Student Evaluation Models
      require('./models/model.studentevaluation').Studentevaluation,
      require('./models/model.evaluationquestion').EvaluationQuestion,
      require('./models/model.evaluationquestionoption')
        .EvaluationQuestionOption,
      require('./models/model.studentanswer').StudentAnswer,
      require('./models/model.studentansweroption').StudentAnswerOption,
      DocumentTemplate,
      DocumentInstance,
      UploadedFile,
    ]),
    // Removed RolesModule as roles module is deleted
    // RolesModule,
    UsersModule,
    CmsModule,
    LessonModule,
    LessondocumentModule,
    ModuleDeFormationModule,
    TrainingCategoryModule,
    TrainingsModule,
    TrainingSessionModule,
    StudentSessionModule,
    SessionCoursModule,
    SessionDocumentModule,
    SurveyQuestionModule,
    EventModule,
    ChatModule,
    RepliesChatModule,
    PaymentMethodCpfModule,
    UserInSessionModule,
    PaymentMethodCardModule,
    PaymentMethodOpcoModule,
    // Student Evaluation Modules
    StudentevaluationModule,
    EvaluationQuestionModule,
    EvaluationQuestionOptionModule,
    StudentAnswerModule,
    StudentAnswerOptionModule,
    DocumentsModule,
    UploadsModule,
  ],
  providers: [
    AppService,
    MediasoupService,
    WebrtcGatewayService,
    GoogleDriveService,
    DocsService,
    AllSercices,
    JwtService,
    CryptoService,
    MailService,
    UsersService,
    JwtStrategy,
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
