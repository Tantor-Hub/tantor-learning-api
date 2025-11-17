import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal, fn, col } from 'sequelize';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';
import { TransferChat } from 'src/models/model.transferechat';
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
    @InjectModel(TransferChat)
    private readonly transferChatModel: typeof TransferChat,
  ) {}

  /**
   * Format chat response to include only required fields
   */
  private formatChatResponse(chat: any, userId?: string): any {
    const chatData = chat.toJSON ? chat.toJSON() : chat;
    const readerArray = chatData.reader || [];
    const receiversArray = chatData.id_user_receiver || [];
    const senderId = chatData.id_user_sender;

    let isOpened = false;
    let role: 'sender' | 'receiver' | null = null;

    if (userId) {
      const userIdString = String(userId);
      const senderIdString = String(senderId);

      // Determine if user is sender or receiver
      if (userIdString === senderIdString) {
        role = 'sender';
        // If current user is the sender: isOpened = true if ALL receivers are in reader array
        if (receiversArray.length === 0) {
          // No receivers, consider it as opened
          isOpened = true;
        } else {
          // Check if all receivers are in the reader array
          const allReceiversRead = receiversArray.every(
            (receiverId: string) => {
              const receiverIdString = String(receiverId);
              return readerArray.some(
                (readerId: string) => String(readerId) === receiverIdString,
              );
            },
          );
          isOpened = allReceiversRead;
        }
      } else {
        // Check if user is in receivers array
        const isReceiver = receiversArray.some(
          (receiverId: string) => String(receiverId) === userIdString,
        );
        if (isReceiver) {
          role = 'receiver';
          // If current user is a receiver: isOpened = true if current user is in reader array
          isOpened = readerArray.some(
            (readerId: string) => String(readerId) === userIdString,
          );
        }
      }
    }

    return {
      id: chatData.id,
      subject: chatData.subject,
      createdAt: chatData.createdAt,
      sender: chatData.sender
        ? {
            firstName: chatData.sender.firstName,
            lastName: chatData.sender.lastName,
            email: chatData.sender.email,
          }
        : null,
      isOpened,
      role, // 'sender' or 'receiver' indicating the user's role in this message
    };
  }

  async create(
    createChatDto: CreateChatDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      console.log('=== Chat create: Starting ===');
      console.log('Create data:', createChatDto);
      console.log('User ID from token:', userId);

      // Verify sender exists
      const sender = await this.usersModel.findOne({
        where: { id: userId },
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
        where: { id: createChatDto.id_user_receiver },
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
        id_user_sender: userId, // Set sender ID from JWT token
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

  async findAll(userId?: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findAll: Starting ===');

      const chats = await this.chatModel.findAll({
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Format chats with simplified response
      const chatsWithReadStatus = chats.map((chat) =>
        this.formatChatResponse(chat, userId),
      );

      console.log('=== Chat findAll: Success ===');
      console.log('Found chats:', chats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: chatsWithReadStatus.length,
          rows: chatsWithReadStatus,
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

  async findOne(id: string, userId?: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findOne: Starting ===');
      console.log('Chat ID:', id, 'User ID:', userId);

      const chat = await this.chatModel.findByPk(id, {
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
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

      // If userId is provided, add user to reader array if not already present
      if (userId) {
        try {
          const currentReaders = chat.reader || [];
          console.log(
            '=== Chat findOne: Current readers before update ===',
            JSON.stringify(currentReaders),
          );
          console.log('=== Chat findOne: User ID to add ===', userId);

          // Check if user is already in the reader array (handle both string and UUID comparisons)
          const isUserInReaders = currentReaders.some(
            (readerId: string) => String(readerId) === String(userId),
          );

          if (!isUserInReaders) {
            // Create a new array instead of mutating the existing one
            const updatedReaders = [...currentReaders, userId];
            console.log(
              '=== Chat findOne: Updated readers array ===',
              JSON.stringify(updatedReaders),
            );

            // Update using the same method as markAsRead
            await chat.update({ reader: updatedReaders });
            await chat.reload(); // Reload to get updated data

            console.log('=== Chat findOne: Chat updated and reloaded ===');
            console.log(
              '=== Chat findOne: Reader array after update ===',
              JSON.stringify(chat.reader),
            );
          } else {
            console.log('=== Chat findOne: User already in reader array ===');
          }
        } catch (updateError) {
          console.error(
            '=== Chat findOne: Error updating reader array ===',
            updateError,
          );
          console.error('=== Chat findOne: Error details ===', {
            message: updateError.message,
            stack: updateError.stack,
          });
          // Continue even if update fails - don't break the response
        }
      } else {
        console.log('=== Chat findOne: No userId provided ===');
      }

      // Add isOpened field to response
      const chatData = chat.toJSON();
      const readerArray = chatData.reader || [];
      // Use same string comparison logic as when checking/updating
      const isOpened = userId
        ? readerArray.some(
            (readerId: string) => String(readerId) === String(userId),
          )
        : false;

      console.log('=== Chat findOne: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          ...chatData,
          isOpened,
        },
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
        } as any,
        include: [
          {
            model: Users,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Format chats with simplified response
      const chatsWithReadStatus = chats.map((chat) =>
        this.formatChatResponse(chat, userId),
      );

      console.log('=== Chat findByUser: Success ===');
      console.log('Found chats for user:', chatsWithReadStatus.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: chatsWithReadStatus.length,
          rows: chatsWithReadStatus,
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

  async findDeletedByUser(userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findDeletedByUser: Starting ===');
      console.log('User ID:', userId);

      // First, get all deleted chats sent by the user
      const allDeletedChats = await this.chatModel.findAll({
        where: {
          status: ChatStatus.DELETED,
          id_user_sender: userId,
        },
        include: [
          {
            model: this.usersModel,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Filter out chats where user is in dontshowme array and format response
      const filteredChats = allDeletedChats
        .filter((chat) => {
          const dontshowme = chat.dontshowme || [];
          return !dontshowme.includes(userId);
        })
        .map((chat) => this.formatChatResponse(chat, userId));

      console.log('=== Chat findDeletedByUser: Success ===');
      console.log('Found deleted chats sent by user:', filteredChats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: filteredChats.length,
          rows: filteredChats,
        },
        customMessage: 'Deleted messages sent by user retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findDeletedByUser: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message:
            'Internal server error while retrieving deleted messages sent by user',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findSentByUser(userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findSentByUser: Starting ===');
      console.log('User ID:', userId);

      // First, get all non-deleted chats sent by the user
      const allSentChats = await this.chatModel.findAll({
        where: {
          id_user_sender: userId,
          status: { [Op.ne]: ChatStatus.DELETED },
        },
        include: [
          {
            model: this.usersModel,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Filter out chats where user is in dontshowme array and format response
      const filteredChats = allSentChats
        .filter((chat) => {
          const dontshowme = chat.dontshowme || [];
          return !dontshowme.includes(userId);
        })
        .map((chat) => this.formatChatResponse(chat, userId));

      console.log('=== Chat findSentByUser: Success ===');
      console.log('Found sent chats for user:', filteredChats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: filteredChats.length,
          rows: filteredChats,
        },
        customMessage: 'Sent messages retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findSentByUser: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving sent messages',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async findReceivedByUser(userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat findReceivedByUser: Starting ===');
      console.log('User ID:', userId);

      // First, get all non-deleted chats where user is a receiver
      const allReceivedChats = await this.chatModel.findAll({
        where: {
          id_user_receiver: { [Op.contains]: [userId] },
          status: { [Op.ne]: ChatStatus.DELETED },
        },
        include: [
          {
            model: this.usersModel,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Filter out chats where user is in dontshowme array and format response
      const filteredChats = allReceivedChats
        .filter((chat) => {
          const dontshowme = chat.dontshowme || [];
          return !dontshowme.includes(userId);
        })
        .map((chat) => this.formatChatResponse(chat, userId));

      // Get all transferred chats where user is a receiver
      const transferredChats = await this.transferChatModel.findAll({
        where: {
          receivers: { [Op.contains]: [userId] },
        },
        include: [
          {
            model: this.chatModel,
            as: 'chat',
            where: {
              status: { [Op.ne]: ChatStatus.DELETED },
            },
            include: [
              {
                model: this.usersModel,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
            required: true,
          },
          {
            model: this.usersModel,
            as: 'senderUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Format transferred chats and filter out those where user is in dontshowme
      const formattedTransferredChats = transferredChats
        .filter((transfer) => {
          const transferData = transfer.toJSON ? transfer.toJSON() : transfer;
          // Use transfer chat's dontshowme array instead of original chat's dontshowme
          const dontshowme = transferData.dontshowme || [];
          return !dontshowme.includes(userId);
        })
        .map((transfer) => {
          const chat = transfer.chat;
          if (!chat) return null;
          
          // Format the chat similar to regular received chats
          const chatData = chat.toJSON ? chat.toJSON() : chat;
          const transferData = transfer.toJSON ? transfer.toJSON() : transfer;
          
          // Use transfer chat's reader array instead of original chat's reader array
          const readerArray = transferData.reader || [];
          const userIdString = String(userId);
          
          // For transferred chats, user is always a receiver
          const isOpened = readerArray.some(
            (readerId: string) => String(readerId) === userIdString,
          );

          return {
            id: chatData.id,
            subject: chatData.subject,
            createdAt: transfer.createdAt || chatData.createdAt, // Use transfer date
            sender: chatData.sender
              ? {
                  firstName: chatData.sender.firstName,
                  lastName: chatData.sender.lastName,
                  email: chatData.sender.email,
                }
              : null,
            transferSender: transfer.senderUser
              ? {
                  firstName: transfer.senderUser.firstName,
                  lastName: transfer.senderUser.lastName,
                  email: transfer.senderUser.email,
                }
              : null,
            isOpened,
            role: 'receiver' as const,
            isTransferred: true, // Flag to indicate this is a transferred chat
            transferId: transferData.id, // Include transfer ID for reference
          };
        })
        .filter((chat) => chat !== null);

      // Combine regular received chats and transferred chats
      const allChats = [...filteredChats, ...formattedTransferredChats];

      // Sort by createdAt descending (most recent first)
      allChats.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      console.log('=== Chat findReceivedByUser: Success ===');
      console.log('Found received chats for user:', filteredChats.length);
      console.log('Found transferred chats for user:', formattedTransferredChats.length);
      console.log('Total chats:', allChats.length);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: allChats.length,
          rows: allChats,
        },
        customMessage: 'Received messages retrieved successfully',
      });
    } catch (error) {
      console.error('=== Chat findReceivedByUser: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while retrieving received messages',
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

      // Check if chat is deleted
      if (chat.status === ChatStatus.DELETED) {
        console.log('=== Chat update: Cannot modify deleted chat ===');
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage:
            'Cannot modify deleted chat messages. Please restore the chat first.',
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

  async remove(deleteChatDto: DeleteChatDto, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat remove: Starting ===');
      console.log('Delete data:', deleteChatDto);
      console.log('User ID:', userId);

      const chat = await this.chatModel.findByPk(deleteChatDto.id);

      if (!chat) {
        console.log('=== Chat remove: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      // Check if user is the sender
      if (chat.id_user_sender === userId) {
        // If user is the sender, change status to DELETED
        await chat.update({ status: ChatStatus.DELETED });
        console.log('=== Chat remove: Sender deleted, status set to DELETED ===');
      } else if (Array.isArray(chat.id_user_receiver) && chat.id_user_receiver.includes(userId)) {
        // If user is a receiver, add their ID to dontshowme array
        const currentDontShowMe = Array.isArray(chat.dontshowme) ? chat.dontshowme : [];
        
        // Only add if not already in the array
        if (!currentDontShowMe.includes(userId)) {
          const updatedDontShowMe = [...currentDontShowMe, userId];
          await chat.update({ dontshowme: updatedDontShowMe });
          console.log('=== Chat remove: Receiver deleted, added to dontshowme ===');
        } else {
          console.log('=== Chat remove: Receiver already in dontshowme ===');
        }
      } else {
        console.log('=== Chat remove: User is neither sender nor receiver ===');
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage: 'You do not have permission to delete this chat message',
        });
      }

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

  async restore(chatId: string): Promise<ResponseServer> {
    try {
      console.log('=== Chat restore: Starting ===');
      console.log('Chat ID:', chatId);

      const chat = await this.chatModel.findByPk(chatId);

      if (!chat) {
        console.log('=== Chat restore: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat message not found',
        });
      }

      // Check if chat is actually deleted
      if (chat.status !== ChatStatus.DELETED) {
        console.log('=== Chat restore: Chat is not deleted ===');
        return Responder({
          status: HttpStatusCode.BadRequest,
          customMessage: 'Chat message is not deleted and cannot be restored',
        });
      }

      // Restore by changing status back to ALIVE
      await chat.update({ status: ChatStatus.ALIVE });

      console.log('=== Chat restore: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id: chat.id },
        customMessage: 'Chat message restored successfully',
      });
    } catch (error) {
      console.error('=== Chat restore: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while restoring chat message',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async cleanupDeletedChats(): Promise<ResponseServer> {
    try {
      console.log('=== Chat cleanupDeletedChats: Starting ===');

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      console.log(
        'Cleaning up chats deleted before:',
        thirtyDaysAgo.toISOString(),
      );

      // Find all chats with DELETED status that were updated more than 30 days ago
      const deletedChats = await this.chatModel.findAll({
        where: {
          status: ChatStatus.DELETED,
          updatedAt: {
            [Op.lt]: thirtyDaysAgo,
          },
        },
      });

      console.log('Found deleted chats to cleanup:', deletedChats.length);

      if (deletedChats.length === 0) {
        console.log('=== Chat cleanupDeletedChats: No chats to cleanup ===');
        return Responder({
          status: HttpStatusCode.Ok,
          data: { cleanedCount: 0 },
          customMessage: 'No deleted chats found for cleanup',
        });
      }

      // Get IDs for logging
      const chatIds = deletedChats.map((chat) => chat.id);

      // Permanently delete the chats
      await this.chatModel.destroy({
        where: {
          id: {
            [Op.in]: chatIds,
          },
        },
      });

      console.log('=== Chat cleanupDeletedChats: Success ===');
      console.log('Permanently deleted chats:', chatIds);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          cleanedCount: deletedChats.length,
          deletedChatIds: chatIds,
        },
        customMessage: `Successfully cleaned up ${deletedChats.length} deleted chat messages`,
      });
    } catch (error) {
      console.error('=== Chat cleanupDeletedChats: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message:
            'Internal server error while cleaning up deleted chat messages',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
