import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from 'src/models/model.document';
import { DocumentField } from 'src/models/model.documentfield';
import { DocumentResponse } from 'src/models/model.documentresponse';
import { Users } from 'src/models/model.users';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';
import { JwtModule } from '@nestjs/jwt';
import { GoogleDriveService } from 'src/services/service.googledrive';

@Module({
  imports: [
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
    SequelizeModule.forFeature([
      Document,
      DocumentField,
      DocumentResponse,
      Users,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    JwtAuthGuardAsManagerSystem,
    JwtService,
    AllSercices,
    GoogleDriveService,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
