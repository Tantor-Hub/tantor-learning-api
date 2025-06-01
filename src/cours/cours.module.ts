import { Module } from '@nestjs/common';
import { AllSercices } from 'src/services/serices.all';
import { CoursController } from './cours.controller';
import { CmsService } from 'src/cms/cms.service';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from 'src/services/service.crypto';
import { JwtModule } from '@nestjs/jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { UsersService } from 'src/users/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppInfos } from 'src/models/model.appinfos';
import { Users } from 'src/models/model.users';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { HomeworksSession } from 'src/models/model.homework';
import { Messages } from 'src/models/model.messages';
import { StagiaireHasSessionSeances } from 'src/models/model.stagiairesessionhasseances';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { Contacts } from 'src/models/model.contactform';
import { Planings } from 'src/models/model.planings';
import { JwtService } from 'src/services/service.jwt';
import { CoursService } from './cours.service';
import { Cours } from 'src/models/model.sessionshascours';
import { Listcours } from 'src/models/model.cours';
import { SessionSuivi } from 'src/models/model.suivisession';
import { FormateurHasSession } from 'src/models/model.formateurhassession';

@Module({
    imports: [
        SequelizeModule.forFeature([AppInfos, Users, Roles, HasRoles, StagiaireHasSession, HomeworksSession, Messages, StagiaireHasSessionSeances, SeanceSessions, StagiaireHasHomeWork, Contacts, Planings, Cours, Listcours, SessionSuivi, FormateurHasSession ]),
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
        })
    ],
    controllers: [CoursController],
    providers: [AllSercices, CmsService, MailService, CryptoService, JwtService, GoogleDriveService, UsersService, CoursService],
})
export class CoursModule { }
