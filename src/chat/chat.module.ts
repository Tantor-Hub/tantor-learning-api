import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TransferChatService } from './transfer-chat.service';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';
import { RepliesChat } from 'src/models/model.replieschat';
import { TransferChat } from 'src/models/model.transferechat';
import { RepliesChatService } from '../replieschat/replieschat.service';
import { JwtService } from 'src/services/service.jwt';
import { AllSercices } from 'src/services/serices.all';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { ChatCleanupService } from 'src/services/service.chatcleanup';

@Module({
  imports: [
    SequelizeModule.forFeature([Chat, Users, RepliesChat, TransferChat]),
    ConfigModule,
    ScheduleModule.forRoot(),
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
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    RepliesChatService,
    TransferChatService,
    JwtService,
    AllSercices,
    GoogleDriveService,
    ChatCleanupService,
  ],
  exports: [ChatService, ChatGateway, ChatCleanupService],
})
export class ChatModule {}
