import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TransferChat } from 'src/models/model.transferechat';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';
import { CreateTransferChatDto } from './dto/create-transfer-chat.dto';
import { UpdateTransferChatDto } from './dto/update-transfer-chat.dto';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Responder } from 'src/strategy/strategy.responder';
import { ResponseServer } from 'src/interface/interface.response';

@Injectable()
export class TransferChatService {
  constructor(
    @InjectModel(TransferChat)
    private readonly transferChatModel: typeof TransferChat,
    @InjectModel(Chat)
    private readonly chatModel: typeof Chat,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {}

  /**
   * Check if user can transfer a chat (must be sender or receiver)
   */
  private async canUserTransferChat(
    chatId: string,
    userId: string,
  ): Promise<{ canTransfer: boolean; chat: Chat | null }> {
    const chat = await this.chatModel.findByPk(chatId);

    if (!chat) {
      return { canTransfer: false, chat: null };
    }

    const userIdString = String(userId);
    const senderIdString = String(chat.id_user_sender);
    const receiversArray = chat.id_user_receiver || [];

    // Check if user is the sender
    if (userIdString === senderIdString) {
      return { canTransfer: true, chat };
    }

    // Check if user is in receivers array
    const isReceiver = receiversArray.some(
      (receiverId: string) => String(receiverId) === userIdString,
    );

    return { canTransfer: isReceiver, chat };
  }

  async create(
    createTransferChatDto: CreateTransferChatDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat create: Starting ===');
      console.log('Transfer data:', createTransferChatDto);
      console.log('User ID:', userId);

      // Check if user can transfer this chat
      const { canTransfer, chat } = await this.canUserTransferChat(
        createTransferChatDto.id_chat,
        userId,
      );

      if (!canTransfer || !chat) {
        console.log('=== TransferChat create: User cannot transfer this chat ===');
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            'You can only transfer chats where you are the sender or one of the receivers',
        });
      }

      // Verify all receivers exist
      const receivers = await this.usersModel.findAll({
        where: { id: createTransferChatDto.receivers },
      });

      if (receivers.length !== createTransferChatDto.receivers.length) {
        console.log('=== TransferChat create: Some receivers not found ===');
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'One or more receiver users not found',
        });
      }

      // Create the transfer record
      const transferChat = await this.transferChatModel.create({
        id_chat: createTransferChatDto.id_chat,
        sender: userId,
        receivers: createTransferChatDto.receivers,
      } as any);

      console.log('=== TransferChat create: Success ===');
      console.log('Created transfer ID:', transferChat.id);

      return Responder({
        status: HttpStatusCode.Created,
        data: transferChat,
        customMessage: 'Chat transfer created successfully',
      });
    } catch (error) {
      console.error('=== TransferChat create: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating chat transfer',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findAll(userId?: string): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat findAll: Starting ===');

      const whereClause: any = {};
      if (userId) {
        // Only show transfers where user is the sender or in receivers
        whereClause[Op.or] = [
          { sender: userId },
          { receivers: { [Op.contains]: [userId] } },
        ];
      }

      const transfers = await this.transferChatModel.findAll({
        where: whereClause as any,
        include: [
          {
            model: Chat,
            as: 'chat',
            attributes: ['id', 'subject', 'content', 'createdAt'],
            include: [
              {
                model: Users,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
          {
            model: Users,
            as: 'senderUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log('=== TransferChat findAll: Success ===');
      console.log('Found transfers:', transfers.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: transfers.length,
          rows: transfers,
        },
        customMessage: 'Chat transfers retrieved successfully',
      });
    } catch (error) {
      console.error('=== TransferChat findAll: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving chat transfers',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findOne(id: string, userId?: string): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat findOne: Starting ===');
      console.log('Transfer ID:', id, 'User ID:', userId);

      const transfer = await this.transferChatModel.findByPk(id, {
        include: [
          {
            model: Chat,
            as: 'chat',
            attributes: ['id', 'subject', 'content', 'createdAt'],
            include: [
              {
                model: Users,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
          {
            model: Users,
            as: 'senderUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!transfer) {
        console.log('=== TransferChat findOne: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat transfer not found',
        });
      }

      // Check if user has access to this transfer
      if (userId) {
        const userIdString = String(userId);
        const senderIdString = String(transfer.sender);
        const receiversArray = transfer.receivers || [];

        const isSender = userIdString === senderIdString;
        const isReceiver = receiversArray.some(
          (receiverId: string) => String(receiverId) === userIdString,
        );

        if (!isSender && !isReceiver) {
          console.log('=== TransferChat findOne: Access denied ===');
          return Responder({
            status: HttpStatusCode.Forbidden,
            customMessage: 'You do not have access to this chat transfer',
          });
        }
      }

      console.log('=== TransferChat findOne: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: transfer,
        customMessage: 'Chat transfer retrieved successfully',
      });
    } catch (error) {
      console.error('=== TransferChat findOne: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving chat transfer',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async update(
    id: string,
    updateTransferChatDto: UpdateTransferChatDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat update: Starting ===');
      console.log('Transfer ID:', id);
      console.log('Update data:', updateTransferChatDto);
      console.log('User ID:', userId);

      const transfer = await this.transferChatModel.findByPk(id);

      if (!transfer) {
        console.log('=== TransferChat update: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat transfer not found',
        });
      }

      // Only the sender can update the transfer
      const userIdString = String(userId);
      const senderIdString = String(transfer.sender);

      if (userIdString !== senderIdString) {
        console.log('=== TransferChat update: Only sender can update ===');
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'Only the sender can update this chat transfer',
        });
      }

      // Verify all receivers exist
      const receivers = await this.usersModel.findAll({
        where: { id: updateTransferChatDto.receivers },
      });

      if (receivers.length !== updateTransferChatDto.receivers.length) {
        console.log('=== TransferChat update: Some receivers not found ===');
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'One or more receiver users not found',
        });
      }

      // Update the receivers array
      await transfer.update({ receivers: updateTransferChatDto.receivers });
      await transfer.reload();

      console.log('=== TransferChat update: Success ===');
      console.log('Updated receivers:', transfer.receivers);

      return Responder({
        status: HttpStatusCode.Ok,
        data: transfer,
        customMessage: 'Chat transfer updated successfully',
      });
    } catch (error) {
      console.error('=== TransferChat update: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while updating chat transfer',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async remove(id: string, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat remove: Starting ===');
      console.log('Transfer ID:', id, 'User ID:', userId);

      const transfer = await this.transferChatModel.findByPk(id);

      if (!transfer) {
        console.log('=== TransferChat remove: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat transfer not found',
        });
      }

      // Only the sender can delete the transfer
      const userIdString = String(userId);
      const senderIdString = String(transfer.sender);

      if (userIdString !== senderIdString) {
        console.log('=== TransferChat remove: Only sender can delete ===');
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'Only the sender can delete this chat transfer',
        });
      }

      await transfer.destroy();

      console.log('=== TransferChat remove: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id: transfer.id },
        customMessage: 'Chat transfer deleted successfully',
      });
    } catch (error) {
      console.error('=== TransferChat remove: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while deleting chat transfer',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

