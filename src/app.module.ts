import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import databaseConfig from './config/config.database';
import { Users } from './models/model.users';
import { Roles } from './models/model.roles';
import { HasRoles } from './models/model.userhasroles';
import { RolesModule } from './roles/roles.module';
import { Sequelize } from 'sequelize-typescript';
import { UsersModule } from './users/users.module';
import { FormationsModule } from './formations/formations.module';
import { CategoriesModule } from './categories/categories.module';
import { Categories } from './models/model.categoriesformations';
import { Formations } from './models/model.formations';
import { Thematiques } from './models/model.groupeformations';
import { SessionsModule } from './sessions/sessions.module';
import { SessionSuivi } from './models/model.suivisession';
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
import { StagiaireHasSession } from './models/model.stagiairehassession';
import { StagiaireHasSessionSeances } from './models/model.stagiairesessionhasseances';
import { log } from 'node:console';
import { Contacts } from './models/model.contactform';
import { MailService } from './services/service.mail';
import { Messages } from './models/model.messages';
import { Planings } from './models/model.planings';
import { CoursService } from './cours/cours.service';
import { CoursModule } from './cours/cours.module';
import { Documents } from './models/model.documents';
import { Cours } from './models/model.sessionshascours';
import { Listcours } from './models/model.cours';
import { SeanceSessions } from './models/model.courshasseances';
import { FormateurHasSession } from './models/model.formateurhassession';
import { HomeworksSession } from './models/model.homework';
import { StagiaireHasHomeWork } from './models/model.stagiairehashomeworks';
import { Newsletter } from './models/model.newsletter';
import { UploadDocument } from './models/model.documentsession';
import { ApresFormationDocs } from './models/model.apresformation';
import { PendantFormationDocs } from './models/model.pendantformation';
import { AvantFormationDocs } from './models/model.avantformation';
import { Chapitre } from './models/model.chapitres';
import { Evaluation } from './models/model.evaluation';
import { Question } from './models/model.quiz';
import { Option } from './models/model.optionsquiz';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
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
        logging: false
      }),
    }),
    SequelizeModule.forFeature([
      Users,
      Evaluation,
      Question,
      Option,
      Roles,
      HasRoles,
      Categories,
      Formations,
      Planings,
      Thematiques,
      SessionSuivi,
      AppInfos,
      StagiaireHasSession,
      StagiaireHasSessionSeances,
      Contacts,
      Messages,
      Newsletter,
      Cours,
      Chapitre,
      Listcours,
      Documents,
      SeanceSessions,
      FormateurHasSession,
      HomeworksSession,
      StagiaireHasSession,
      StagiaireHasSessionSeances,
      StagiaireHasHomeWork,
      UploadDocument,
      AvantFormationDocs,
      PendantFormationDocs,
      ApresFormationDocs
    ]),
    RolesModule,
    UsersModule,
    FormationsModule,
    CategoriesModule,
    SessionsModule,
    CmsModule,
    CoursModule
  ],
  providers: [AppService, MediasoupService, WebrtcGatewayService, GoogleDriveService, DocsService, CmsService, AllSercices, JwtService, NestJwtService, CryptoService, MailService, CoursService, UsersService, RolesService],
  controllers: [AppController],
})

export class AppModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) { }

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      this.sequelize.sync({ alter: true, force: false, })
        .then(_ => {
          console.log('[Database] Connexion réussie', this.sequelize.getDatabaseName());
          // const connectionUri = this.sequelize.options['url'] || this.sequelize.options.host;
          // const models = Object.keys(this.sequelize.models);
          // console.log(`[ URL ] ${connectionUri} [ Database ] : `, this.sequelize.getDatabaseName());
        })
        .catch(err => log("[ DB Error ]", err))
    } catch (error) {
      console.error('[ Database ] Échec de connexion : ', error.message);
    }
  }
}
