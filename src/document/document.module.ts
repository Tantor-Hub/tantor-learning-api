import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Documents } from 'src/models/model.documents';
import { Users } from 'src/models/model.users';
import { Lesson } from 'src/models/model.lesson';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';

@Module({
  imports: [
    SequelizeModule.forFeature([Documents, Users, Lesson]),
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
  controllers: [DocumentController],
  providers: [DocumentService, JwtService, AllSercices],
  exports: [DocumentService],
})
export class DocumentModule {}
