import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentMethodCpfService } from './paymentmethodcpf.service';
import { PaymentMethodCpfController } from './paymentmethodcpf.controller';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';
import { MailService } from '../services/service.mail';
import { CloudinaryService } from '../services/service.cloudinary';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentMethodCpf,
      PaymentMethodCard,
      PaymentMethodOpco,
      TrainingSession,
      Users,
      UserInSession,
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
  controllers: [PaymentMethodCpfController],
  providers: [
    PaymentMethodCpfService,
    AllSercices,
    JwtService,
    MailService,
    CloudinaryService,
  ],
  exports: [PaymentMethodCpfService],
})
export class PaymentMethodCpfModule {}
