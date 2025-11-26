import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TransferChat } from 'src/models/model.transferechat';
import { Chat } from 'src/models/model.chat';
import { Users } from 'src/models/model.users';
import { RepliesChat } from 'src/models/model.replieschat';
import { RepliesChatStatus } from 'src/models/model.replieschat';
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
    @InjectModel(RepliesChat)
    private readonly repliesChatModel: typeof RepliesChat,
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
        console.log(
          '=== TransferChat create: User cannot transfer this chat ===',
        );
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
        reader: [],
        dontshowme: [],
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
            include: [
              {
                model: Users,
                as: 'sender',
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
              },
            ],
          },
          {
            model: Users,
            as: 'senderUser',
            attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
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

        // If user is in the receivers array, add them to the reader array if not already present
        // This is similar to how regular chat works - when a user opens the transfer chat, mark them as having read it
        if (isReceiver) {
          try {
            const currentReaders = transfer.reader || [];
            console.log(
              '=== TransferChat findOne: Current readers before update ===',
              JSON.stringify(currentReaders),
            );
            console.log('=== TransferChat findOne: User ID to add ===', userId);

            // Check if user is already in the reader array (handle both string and UUID comparisons)
            const isUserInReaders = currentReaders.some(
              (readerId: string) => String(readerId) === String(userId),
            );

            if (!isUserInReaders) {
              // Create a new array instead of mutating the existing one
              const updatedReaders = [...currentReaders, userId];
              console.log(
                '=== TransferChat findOne: Updated readers array ===',
                JSON.stringify(updatedReaders),
              );

              // Update using the same method as markAsRead
              await transfer.update({ reader: updatedReaders });
              await transfer.reload({
                include: [
                  {
                    model: Chat,
                    as: 'chat',
                    include: [
                      {
                        model: Users,
                        as: 'sender',
                        attributes: [
                          'id',
                          'firstName',
                          'lastName',
                          'email',
                          'avatar',
                        ],
                      },
                    ],
                  },
                  {
                    model: Users,
                    as: 'senderUser',
                    attributes: [
                      'id',
                      'firstName',
                      'lastName',
                      'email',
                      'avatar',
                    ],
                  },
                ],
              });

              console.log('=== TransferChat findOne: Transfer updated and reloaded ===');
              console.log(
                '=== TransferChat findOne: Reader array after update ===',
                JSON.stringify(transfer.reader),
              );
            } else {
              console.log(
                '=== TransferChat findOne: User already in reader array ===',
              );
            }
          } catch (readerUpdateError) {
            console.error(
              '=== TransferChat findOne: Error updating reader array ===',
              readerUpdateError,
            );
            console.error('=== TransferChat findOne: Error details ===', {
              message: readerUpdateError.message,
              stack: readerUpdateError.stack,
            });
            // Continue even if update fails - don't break the response
          }
        }
      }

      // Add isOpened field to response
      // Get the updated transfer data after potential reader update
      const transferData = transfer.toJSON ? transfer.toJSON() : transfer;
      const readerArray = transferData.reader || [];
      const receiversArray = transferData.receivers || [];
      const userIdString = userId ? String(userId) : null;

      // Use same string comparison logic as when checking/updating
      // isOpened is true if the user is in the reader array
      const isOpened = userIdString
        ? readerArray.some(
            (readerId: string) => String(readerId) === String(userIdString),
          )
        : false;

      // Format the chat object to include only specific fields
      const chatData = transferData.chat
        ? transferData.chat.toJSON
          ? transferData.chat.toJSON()
          : transferData.chat
        : null;
      const formattedChat = chatData
        ? {
            subject: chatData.subject,
            content: chatData.content,
            piece_joint: chatData.piece_joint || [],
            sender: chatData.sender
              ? {
                  id: chatData.sender.id,
                  firstName: chatData.sender.firstName,
                  lastName: chatData.sender.lastName,
                  email: chatData.sender.email,
                  avatar: chatData.sender.avatar,
                }
              : null,
            createdAt: chatData.createdAt,
            updatedAt: chatData.updatedAt,
          }
        : null;

      // Format the senderUser object
      const senderUserData = transferData.senderUser
        ? transferData.senderUser.toJSON
          ? transferData.senderUser.toJSON()
          : transferData.senderUser
        : null;
      const formattedSenderUser = senderUserData
        ? {
            id: senderUserData.id,
            firstName: senderUserData.firstName,
            lastName: senderUserData.lastName,
            email: senderUserData.email,
            avatar: senderUserData.avatar,
          }
        : null;

      // Get replies for this transfer chat
      // Ensure we only get replies where id_transferechat matches and id_chat is null
      const whereClause: any = {
        id_transferechat: id,
        id_chat: null, // Explicitly ensure id_chat is null for transfer chat replies
        status: RepliesChatStatus.ALIVE,
      };

      // If user is a receiver (not the sender), only show public replies
      if (userId) {
        const userIdString = String(userId);
        const senderIdString = String(transferData.sender);
        const receiversArray = transferData.receivers || [];
        const isSender = userIdString === senderIdString;
        const isReceiver = receiversArray.some(
          (receiverId: string) => String(receiverId) === userIdString,
        );

        if (isReceiver && !isSender) {
          whereClause.is_public = true;
        }
      }

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

      // Format replies to include sender with avatar
      const formattedReplies = replies.map((reply) => {
        const replyData = reply.toJSON ? reply.toJSON() : reply;
        return {
          ...replyData,
          sender: replyData.sender
            ? {
                id: replyData.sender.id,
                firstName: replyData.sender.firstName,
                lastName: replyData.sender.lastName,
                email: replyData.sender.email,
                avatar: replyData.sender.avatar,
              }
            : null,
        };
      });

      console.log('=== TransferChat findOne: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          id: transferData.id,
          id_chat: transferData.id_chat,
          sender: transferData.sender,
          receivers: transferData.receivers || [],
          reader: transferData.reader || [],
          dontshowme: transferData.dontshowme || [],
          isOpened,
          isTransferred: true,
          chat: formattedChat,
          senderUser: formattedSenderUser,
          replies: formattedReplies,
          createdAt: transferData.createdAt,
          updatedAt: transferData.updatedAt,
        },
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

  async markAsRead(id: string, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat markAsRead: Starting ===');
      console.log('Transfer ID:', id, 'User ID:', userId);

      const transfer = await this.transferChatModel.findByPk(id);

      if (!transfer) {
        console.log('=== TransferChat markAsRead: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat transfer not found',
        });
      }

      // Add user to reader array (same as regular chats - no receiver check)
      const currentReaders = (transfer as any).reader || [];
      if (!currentReaders.includes(userId)) {
        const updatedReaders = [...currentReaders, userId];
        await transfer.update({ reader: updatedReaders } as any);
        await transfer.reload();
      }

      console.log('=== TransferChat markAsRead: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: transfer,
        customMessage: 'Chat transfer marked as read',
      });
    } catch (error) {
      console.error('=== TransferChat markAsRead: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while marking chat transfer as read',
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async hideMessage(id: string, userId: string): Promise<ResponseServer> {
    try {
      console.log('=== TransferChat hideMessage: Starting ===');
      console.log('Transfer ID:', id, 'User ID:', userId);

      const transfer = await this.transferChatModel.findByPk(id);

      if (!transfer) {
        console.log('=== TransferChat hideMessage: Not found ===');
        return Responder({
          status: HttpStatusCode.NotFound,
          customMessage: 'Chat transfer not found',
        });
      }

      const currentHidden = (transfer as any).dontshowme || [];
      if (!currentHidden.includes(userId)) {
        const updatedHidden = [...currentHidden, userId];
        await transfer.update({ dontshowme: updatedHidden } as any);
        await transfer.reload();
      }

      console.log('=== TransferChat hideMessage: Success ===');

      return Responder({
        status: HttpStatusCode.Ok,
        data: transfer,
        customMessage: 'Chat transfer hidden successfully',
      });
    } catch (error) {
      console.error('=== TransferChat hideMessage: ERROR ===');
      console.error('Error:', error);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while hiding chat transfer',
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

      const userIdString = String(userId);
      const senderIdString = String(transfer.sender);
      const receiversArray = transfer.receivers || [];

      // Check if user is the sender
      if (userIdString === senderIdString) {
        // If user is the sender, delete the transfer (destroy)
        await transfer.destroy();
        console.log(
          '=== TransferChat remove: Sender deleted, transfer destroyed ===',
        );
      } else if (
        Array.isArray(receiversArray) &&
        receiversArray.some(
          (receiverId: string) => String(receiverId) === userIdString,
        )
      ) {
        // If user is a receiver, add their ID to dontshowme array
        const currentDontShowMe = Array.isArray((transfer as any).dontshowme)
          ? (transfer as any).dontshowme
          : [];

        // Only add if not already in the array
        if (!currentDontShowMe.includes(userId)) {
          const updatedDontShowMe = [...currentDontShowMe, userId];
          await transfer.update({ dontshowme: updatedDontShowMe } as any);
          await transfer.reload();
          console.log(
            '=== TransferChat remove: Receiver deleted, added to dontshowme ===',
          );
        } else {
          console.log(
            '=== TransferChat remove: Receiver already in dontshowme ===',
          );
        }
      } else {
        console.log(
          '=== TransferChat remove: User is neither sender nor receiver ===',
        );
        return Responder({
          status: HttpStatusCode.Forbidden,
          customMessage:
            'You do not have permission to delete this chat transfer',
        });
      }

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
