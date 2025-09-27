import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeModule as StripeClientModule } from '../strategy/strategy.stripe';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payement } from '../models/model.payementbycard';
import { Payementopco } from '../models/model.payementbyopco';
import { JwtService } from '../services/service.jwt';
import { MailService } from '../services/service.mail';
import { AllSercices } from '../services/serices.all';
import { GoogleDriveService } from '../services/service.googledrive';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Users } from '../models/model.users';
import { MediasoupService } from '../services/service.mediasoup';
import { DocsService } from '../services/service.docs';
import { Options } from '../models/model.optionquestionnaires';

@Module({
  imports: [
    StripeClientModule,
    SequelizeModule.forFeature([Payement, Payementopco, Users, Options]),
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
  controllers: [StripeController],
  providers: [
    StripeService,
    JwtService,
    GoogleDriveService,
    AllSercices,
    MailService,
    MediasoupService,
    DocsService,
  ],
})
export class StripeModule {}
