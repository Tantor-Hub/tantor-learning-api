import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sessiondocument } from 'src/models/model.sessiondocument';
import { Users } from 'src/models/model.users';
import { SessiondocumentController } from './sessiondocument.controller';
import { SessiondocumentService } from './sessiondocument.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';

@Module({
  imports: [
    SequelizeModule.forFeature([Sessiondocument, Users]),
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
  controllers: [SessiondocumentController],
  providers: [SessiondocumentService, JwtService, AllSercices],
  exports: [SessiondocumentService],
})
export class SessiondocumentModule {}
