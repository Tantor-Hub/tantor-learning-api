import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RepliesChat } from 'src/models/model.replieschat';
import { Users } from 'src/models/model.users';
import { Chat } from 'src/models/model.chat';
import { TransferChat } from 'src/models/model.transferechat';
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
    @InjectModel(TransferChat)
    private readonly transferChatModel: typeof TransferChat,
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

      // Validate that exactly one of id_chat or id_transferechat is provided
      if (
        !createRepliesChatDto.id_chat &&
        !createRepliesChatDto.id_transferechat
      ) {
        console.log(
          '=== RepliesChat create: Either id_chat or id_transferechat must be provided ===',
        );
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Either id_chat or id_transferechat must be provided',
        });
      }

      // Validate that both are not provided at the same time
      if (
        createRepliesChatDto.id_chat &&
        createRepliesChatDto.id_transferechat
      ) {
        console.log(
          '=== RepliesChat create: Only one of id_chat or id_transferechat can be provided ===',
        );
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Only one of id_chat or id_transferechat can be provided, not both',
        });
      }

      // Verify chat exists if id_chat is provided
      if (createRepliesChatDto.id_chat) {
        const chat = await this.chatModel.findByPk(
          createRepliesChatDto.id_chat,
        );

        if (!chat) {
          console.log('=== RepliesChat create: Chat not found ===');
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Chat message not found',
          });
        }
      }

      // Verify transfer chat exists if id_transferechat is provided
      if (createRepliesChatDto.id_transferechat) {
        const transferChat = await this.transferChatModel.findByPk(
          createRepliesChatDto.id_transferechat,
        );

        if (!transferChat) {
          console.log('=== RepliesChat create: Transfer chat not found ===');
          return Responder({
            status: HttpStatusCode.NotFound,
            customMessage: 'Transfer chat not found',
          });
        }
      }

      // Ensure one field is null when the other is provided
      const createData: any = {
        ...createRepliesChatDto,
        status: RepliesChatStatus.ALIVE,
        is_public:
          createRepliesChatDto.is_public !== undefined
            ? createRepliesChatDto.is_public
            : true,
      };

      // Explicitly set the other field to null
      if (createRepliesChatDto.id_chat) {
        createData.id_chat = createRepliesChatDto.id_chat;
        createData.id_transferechat = null;
      } else if (createRepliesChatDto.id_transferechat) {
        createData.id_transferechat = createRepliesChatDto.id_transferechat;
        createData.id_chat = null;
      }

      const repliesChat = await this.repliesChatModel.create(createData);

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
        attributes: [
          'id',
          'content',
          'id_sender',
          'id_chat',
          'status',
          'is_public',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
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
        attributes: [
          'id',
          'content',
          'id_sender',
          'id_chat',
          'status',
          'is_public',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
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

      // For chat endpoint, we only filter by id_chat (no need to check id_transferechat)
      // Return all replies (both public and private) for this endpoint
      const replies = await this.repliesChatModel.findAll({
        where: {
          id_chat: chatId, // Filter by the id from the route parameter
          status: RepliesChatStatus.ALIVE,
        } as any,
        attributes: [
          'id',
          'content',
          'id_sender',
          'id_chat',
          'status',
          'is_public',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log('=== RepliesChat findByChat: Success ===');
      console.log('Found replies for chat:', replies.length);
      console.log('Returning all replies (both public and private)');

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
        attributes: [
          'id',
          'content',
          'id_sender',
          'id_chat',
          'status',
          'is_public',
          'createdAt',
          'updatedAt',
        ],
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

  async findByTransferChat(
    transferChatId: string,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== RepliesChat findByTransferChat: Starting ===');
      console.log('Transfer Chat ID:', transferChatId);
      console.log('User ID:', userId);

      // Verify transfer chat exists
      const transferChat = await this.transferChatModel.findByPk(transferChatId);

      if (!transferChat) {
        console.log(
          '=== RepliesChat findByTransferChat: Transfer chat not found ===',
        );
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Transfer chat not found',
        });
      }

      // Check if user is the sender (creator) or one of the receivers
      const userIdString = String(userId);
      const senderIdString = String(transferChat.sender);
      const receiversArray = transferChat.receivers || [];

      const isSender = userIdString === senderIdString;
      const isReceiver = receiversArray.some(
        (receiverId: string) => String(receiverId) === userIdString,
      );

      if (!isSender && !isReceiver) {
        console.log(
          '=== RepliesChat findByTransferChat: Access denied ===',
        );
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            'You do not have access to replies for this transfer chat',
        });
      }

      // First, check what records exist in the database (without filters) for debugging
      const allRepliesForTransfer = await this.repliesChatModel.findAll({
        where: {
          id_transferechat: transferChatId,
        },
        attributes: ['id', 'id_chat', 'id_transferechat', 'status', 'is_public', 'content', 'id_sender'],
        raw: true,
      });
      console.log('=== RepliesChat findByTransferChat: Debug - ALL replies with this id_transferechat ===');
      console.log('Total records found (no filters):', allRepliesForTransfer.length);
      console.log('Records:', JSON.stringify(allRepliesForTransfer, null, 2));

      // Build where clause to get replies where id_transferechat matches the route parameter
      // For transfer chat endpoint, we only filter by id_transferechat (no need to check id_chat)
      // Return all replies (both public and private) for this endpoint
      const whereClause: any = {
        id_transferechat: transferChatId, // Filter by the id from the route parameter
        status: RepliesChatStatus.ALIVE,
      };

      console.log('=== RepliesChat findByTransferChat: Final where clause ===');
      console.log('Where clause:', JSON.stringify(whereClause, null, 2));
      console.log('User role:', isSender ? 'sender' : 'receiver');

      const replies = await this.repliesChatModel.findAll({
        where: whereClause,
        attributes: [
          'id',
          'content',
          'id_sender',
          'id_chat',
          'id_transferechat',
          'status',
          'is_public',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      console.log('=== RepliesChat findByTransferChat: Success ===');
      console.log('Found replies for transfer chat:', replies.length);
      console.log('Returning all replies (both public and private)');

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: replies.length,
          rows: replies,
        },
        customMessage: 'Transfer chat replies retrieved successfully',
      });
    } catch (error) {
      console.error('=== RepliesChat findByTransferChat: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message:
            'Internal server error while retrieving transfer chat replies',
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
      await reply.reload(); // Reload to get the updated data from database

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
