import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionDocumentService } from './sessiondocument.service';
import { SessionDocumentController } from './sessiondocument.controller';
import { SessionDocument } from 'src/models/model.sessiondocument';
import { Users } from 'src/models/model.users';
import { TrainingSession } from 'src/models/model.trainingssession';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([SessionDocument, Users, TrainingSession]),
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
  controllers: [SessionDocumentController],
  providers: [SessionDocumentService, AllSercices, JwtService],
  exports: [SessionDocumentService],
})
export class SessionDocumentModule {}
