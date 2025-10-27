import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TrainingCategoryService } from './trainingcategory.service';
import { TrainingCategoryController } from './trainingcategory.controller';
import { TrainingCategory } from 'src/models/model.trainingcategory';
import { Training } from 'src/models/model.trainings';
import { Users } from 'src/models/model.users';
import { AllSercices } from 'src/services/serices.all';
import { JwtService } from 'src/services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([TrainingCategory, Training, Users]),
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
  controllers: [TrainingCategoryController],
  providers: [TrainingCategoryService, AllSercices, JwtService],
  exports: [TrainingCategoryService],
})
export class TrainingCategoryModule {}
