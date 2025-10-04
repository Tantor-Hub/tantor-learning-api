import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RepliesChat } from 'src/models/model.replieschat';
import { Users } from 'src/models/model.users';
import { Chat } from 'src/models/model.chat';
import { CreateRepliesChatDto } from './dto/create-replieschat.dto';
import { UpdateRepliesChatDto } from './dto/update-replieschat.dto';
import { DeleteRepliesChatDto } from './dto/delete-replieschat.dto';
import {
  IRepliesChat,
  IRepliesChatResponse,
} from 'src/interface/interface.replieschat';
import { RepliesChatStatus } from 'src/models/model.replieschat';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Responder } from 'src/strategy/strategy.responder';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class RepliesChatService {
  constructor(
    @InjectModel(RepliesChat)
    private readonly repliesChatModel: typeof RepliesChat,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
  ) {}

  async create(
    createRepliesChatDto: CreateRepliesChatDto & { id_sender: string },
  ): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat create: Starting ===');
      console.log('Create data:', createRepliesChatDto);

      // Verify sender exists
      const sender = await this.usersModel.findOne({
        where: { id: createRepliesChatDto.id_sender },
      });

      if (!sender) {
        console.log('=== RepliesChat create: Sender not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Sender user not found',
        });
      }

      // Verify chat exists
      const chat = await this.chatModel.findByPk(createRepliesChatDto.id_chat);

      if (!chat) {
        console.log('=== RepliesChat create: Chat not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      const repliesChat = await this.repliesChatModel.create({
        ...createRepliesChatDto,
        status: RepliesChatStatus.ALIVE,
        is_public:
          createRepliesChatDto.is_public !== undefined
            ? createRepliesChatDto.is_public
            : true,
      } as any);

      console.log('=== RepliesChat create: Success ===');
      console.log('Created reply ID:', repliesChat.id);

      return Responder({
        status: HttpStatusCode.Created,
        data: repliesChat,
        customMessage: 'Reply created successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat create: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating reply',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat findAll: Starting ===');

      const replies = await this.repliesChatModel.findAll({
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Chat,
            as: 'chat',
            attributes: [
              'id',
              'subject',
              'content',
              'id_user_sender',
              'id_user_receiver',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log('=== RepliesChat findAll: Success ===');
      console.log('Found replies:', replies.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: replies.length,
          rows: replies,
        },
        customMessage: 'Replies retrieved successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat findAll: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving replies',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat findOne: Starting ===');
      console.log('Reply ID:', id);

      const reply = await this.repliesChatModel.findByPk(id, {
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Chat,
            as: 'chat',
            attributes: [
              'id',
              'subject',
              'content',
              'id_user_sender',
              'id_user_receiver',
            ],
          },
        ],
      });

      if (!reply) {
        console.log('=== RepliesChat findOne: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Reply not found',
        });
      }

      console.log('=== RepliesChat findOne: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: reply,
        customMessage: 'Reply retrieved successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat findOne: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving reply',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findByChat(chatId: string): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat findByChat: Starting ===');
      console.log('Chat ID:', chatId);

      // Verify chat exists
      const chat = await this.chatModel.findByPk(chatId);

      if (!chat) {
        console.log('=== RepliesChat findByChat: Chat not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      const replies = await this.repliesChatModel.findAll({
        where: {
          id_chat: chatId,
          status: RepliesChatStatus.ALIVE,
        },
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log('=== RepliesChat findByChat: Success ===');
      console.log('Found replies for chat:', replies.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: replies.length,
          rows: replies,
        },
        customMessage: 'Chat replies retrieved successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat findByChat: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving chat replies',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findBySender(senderId: string): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat findBySender: Starting ===');
      console.log('Sender ID:', senderId);

      // Verify sender exists
      const sender = await this.usersModel.findOne({
        where: { id: senderId },
      });

      if (!sender) {
        console.log('=== RepliesChat findBySender: Sender not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Sender user not found',
        });
      }

      const replies = await this.repliesChatModel.findAll({
        where: {
          id_sender: senderId,
          status: RepliesChatStatus.ALIVE,
        },
        include: [
          {
            model: Chat,
            as: 'chat',
            attributes: [
              'id',
              'subject',
              'content',
              'id_user_sender',
              'id_user_receiver',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log('=== RepliesChat findBySender: Success ===');
      console.log('Found replies for sender:', replies.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: replies.length,
          rows: replies,
        },
        customMessage: 'Sender replies retrieved successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat findBySender: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving sender replies',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async update(
    updateRepliesChatDto: UpdateRepliesChatDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat update: Starting ===');
      console.log('Update data:', updateRepliesChatDto);

      const reply = await this.repliesChatModel.findByPk(
        updateRepliesChatDto.id,
      );

      if (!reply) {
        console.log('=== RepliesChat update: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Reply not found',
        });
      }

      const { id, ...updateData } = updateRepliesChatDto;
      await reply.update(updateData);

      console.log('=== RepliesChat update: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: reply,
        customMessage: 'Reply updated successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat update: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while updating reply',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async remove(
    deleteRepliesChatDto: DeleteRepliesChatDto,
  ): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat remove: Starting ===');
      console.log('Delete data:', deleteRepliesChatDto);

      const reply = await this.repliesChatModel.findByPk(
        deleteRepliesChatDto.id,
      );

      if (!reply) {
        console.log('=== RepliesChat remove: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Reply not found',
        });
      }

      // Soft delete by changing status to DELETED
      await reply.update({ status: RepliesChatStatus.DELETED });

      console.log('=== RepliesChat remove: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id: reply.id },
        customMessage: 'Reply deleted successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat remove: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while deleting reply',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
