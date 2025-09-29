import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { IChat, IChatResponse } from 'src/interface/interface.chat';
import { ChatStatus } from 'src/models/model.chat';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Responder } from 'src/strategy/strategy.responder';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<ResponseServer> {
    try {
      console.log('=== Chat create: Starting ===');
      console.log('Create data:', createChatDto);

      // Verify sender exists
      const sender = await this.usersModel.findOne({
        where: { uuid: createChatDto.id_user_sender },
      });

      if (!sender) {
        console.log('=== Chat create: Sender not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Sender user not found',
        });
      }

      // Verify all receivers exist
      const receivers = await this.usersModel.findAll({
        where: { uuid: createChatDto.id_user_receiver },
      });

      if (receivers.length !== createChatDto.id_user_receiver.length) {
        console.log('=== Chat create: Some receivers not found ===');
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'One or more receiver users not found',
        });
      }

      const chat = await this.chatModel.create({
        ...createChatDto,
        status: ChatStatus.ALIVE,
        reader: [],
        dontshowme: [],
      } as any);

      console.log('=== Chat create: Success ===');
      console.log('Created chat ID:', chat.id);

      return Responder({
        status: HttpStatusCode.Created,
        data: chat,
        customMessage: 'Chat message created successfully',
      });
    } catch (error) {
      console.error('=== Chat create: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log('=== Chat findAll: Starting ===');

      const chats = await this.chatModel.findAll({
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'fs_name', 'ls_name', 'email', 'uuid'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log('=== Chat findAll: Success ===');
      console.log('Found chats:', chats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: chats.length,
          rows: chats,
        },
        customMessage: 'Chat messages retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findAll: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving chat messages',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findOne: Starting ===');
      console.log('Chat ID:', id);

      const chat = await this.chatModel.findByPk(id, {
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'fs_name', 'ls_name', 'email', 'uuid'],
          },
        ],
      });

      if (!chat) {
        console.log('=== Chat findOne: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      console.log('=== Chat findOne: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: chat,
        customMessage: 'Chat message retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findOne: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findByUser(userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findByUser: Starting ===');
      console.log('User ID:', userId);

      const chats = await this.chatModel.findAll({
        where: {
          [Op.or]: [
            { id_user_sender: userId },
            { id_user_receiver: { [Op.contains]: [userId] } },
          ],
          status: ChatStatus.ALIVE,
        },
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'fs_name', 'ls_name', 'email', 'uuid'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log('=== Chat findByUser: Success ===');
      console.log('Found chats for user:', chats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: chats.length,
          rows: chats,
        },
        customMessage: 'User chat messages retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findByUser: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving user chat messages',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async update(updateChatDto: UpdateChatDto): Promise<ResponseServer> {
    try {
      console.log('=== Chat update: Starting ===');
      console.log('Update data:', updateChatDto);

      const chat = await this.chatModel.findByPk(updateChatDto.id);

      if (!chat) {
        console.log('=== Chat update: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      const { id, ...updateData } = updateChatDto;
      await chat.update(updateData);

      console.log('=== Chat update: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: chat,
        customMessage: 'Chat message updated successfully',
      });
    } catch (error) {
      console.error('=== Chat update: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while updating chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async markAsRead(chatId: string, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat markAsRead: Starting ===');
      console.log('Chat ID:', chatId, 'User ID:', userId);

      const chat = await this.chatModel.findByPk(chatId);

      if (!chat) {
        console.log('=== Chat markAsRead: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      const currentReaders = chat.reader || [];
      if (!currentReaders.includes(userId)) {
        currentReaders.push(userId);
        await chat.update({ reader: currentReaders });
      }

      console.log('=== Chat markAsRead: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: chat,
        customMessage: 'Chat message marked as read',
      });
    } catch (error) {
      console.error('=== Chat markAsRead: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while marking chat as read',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async hideMessage(chatId: string, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat hideMessage: Starting ===');
      console.log('Chat ID:', chatId, 'User ID:', userId);

      const chat = await this.chatModel.findByPk(chatId);

      if (!chat) {
        console.log('=== Chat hideMessage: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      const currentHidden = chat.dontshowme || [];
      if (!currentHidden.includes(userId)) {
        currentHidden.push(userId);
        await chat.update({ dontshowme: currentHidden });
      }

      console.log('=== Chat hideMessage: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: chat,
        customMessage: 'Chat message hidden successfully',
      });
    } catch (error) {
      console.error('=== Chat hideMessage: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while hiding chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async remove(deleteChatDto: DeleteChatDto): Promise<ResponseServer> {
    try {
      console.log('=== Chat remove: Starting ===');
      console.log('Delete data:', deleteChatDto);

      const chat = await this.chatModel.findByPk(deleteChatDto.id);

      if (!chat) {
        console.log('=== Chat remove: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      // Soft delete by changing status to DELETED
      await chat.update({ status: ChatStatus.DELETED });

      console.log('=== Chat remove: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id: chat.id },
        customMessage: 'Chat message deleted successfully',
      });
    } catch (error) {
      console.error('=== Chat remove: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while deleting chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
