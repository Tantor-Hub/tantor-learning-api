import { Module } from '@nestjs/common';
import { SecretaryController } from './secretary.controller';
import { SecretaryService } from './secretary.service';
import { PaymentMethodCpfModule } from '../paymentmethodcpf/paymentmethodcpf.module';
import { PaymentMethodOpcoModule } from '../paymentmethodopco/paymentmethodopco.module';
import { MailService } from '../services/service.mail';
import { GoogleDriveService } from '../services/service.googledrive';
import { AllSercices } from '../services/serices.all';
import { JwtService } from '../services/service.jwt';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { Users } from '../models/model.users';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PaymentMethodCpfModule,
    PaymentMethodOpcoModule,
    SequelizeModule.forFeature([Users]),
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
  controllers: [SecretaryController],
  providers: [
    SecretaryService,
    MailService,
    GoogleDriveService,
    AllSercices,
    JwtService,
    JwtAuthGuardAsSecretary,
  ],
  exports: [SecretaryService],
})
export class SecretaryModule {}
