import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentMethodCardService } from './paymentmethodcard.service';
import { PaymentMethodCardController } from './paymentmethodcard.controller';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';
import { MailService } from '../services/service.mail';
import { GoogleDriveService } from '../services/service.googledrive';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentMethodCard,
      PaymentMethodCpf,
      PaymentMethodOpco,
      TrainingSession,
      Training,
      Users,
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('APPJWTTOKEN', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>('APPJWTMAXLIFE', '24h'),
        },
      }),
    }),
  ],
  controllers: [PaymentMethodCardController],
  providers: [
    PaymentMethodCardService,
    AllSercices,
    JwtService,
    MailService,
    GoogleDriveService,
  ],
  exports: [PaymentMethodCardService],
})
export class PaymentMethodCardModule {}
