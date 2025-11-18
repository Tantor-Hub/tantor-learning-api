import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RepliesChatService } from './replieschat.service';
import { RepliesChatController } from './replieschat.controller';
import { RepliesChat } from 'src/models/model.replieschat';
import { Users } from 'src/models/model.users';
import { Chat } from 'src/models/model.chat';
import { TransferChat } from 'src/models/model.transferechat';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';

@Module({
  imports: [
    SequelizeModule.forFeature([RepliesChat, Users, Chat, TransferChat]),
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
  controllers: [RepliesChatController],
  providers: [RepliesChatService, JwtService, AllSercices],
  exports: [RepliesChatService],
})
export class RepliesChatModule {}
