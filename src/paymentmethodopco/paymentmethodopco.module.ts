import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentMethodOpcoService } from './paymentmethodopco.service';
import { PaymentMethodOpcoController } from './paymentmethodopco.controller';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentMethodOpco,
      PaymentMethodCpf,
      PaymentMethodCard,
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
  controllers: [PaymentMethodOpcoController],
  providers: [PaymentMethodOpcoService, AllSercices, JwtService],
  exports: [PaymentMethodOpcoService],
})
export class PaymentMethodOpcoModule {}
