import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';

@Module({
  imports: [SequelizeModule.forFeature([Chat, Users])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
