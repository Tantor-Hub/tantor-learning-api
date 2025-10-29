import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { UploadedFile } from '../models/model.uploadedfile';
import { Users } from '../models/model.users';
import { JwtService } from '../services/service.jwt';
import { ConfigService } from '@nestjs/config';
import { AllSercices } from '../services/serices.all';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';

@Module({
  imports: [
    SequelizeModule.forFeature([UploadedFile, Users]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
            ),
            false,
          );
        }
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    JwtService,
    ConfigService,
    AllSercices,
    JwtAuthGuardAsSecretary,
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
