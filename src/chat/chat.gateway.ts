import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from 'src/services/service.jwt';
import { ChatService } from './chat.service';
import { RepliesChatService } from '../replieschat/replieschat.service';
import { Users } from 'src/models/model.users';
import { Chat } from 'src/models/model.chat';
import { RepliesChat } from 'src/models/model.replieschat';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { Readable } from 'stream';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    uuid: string;
    email: string;
    fs_name: string;
    ls_name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false, // Set to false when using wildcard origin
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly repliesChatService: RepliesChatService,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyTokenWithRound(token);
      if (!payload) {
        client.disconnect();
        return;
      }

      // Check for user ID in token (id_user is the primary field, uuid_user is for backward compatibility)
      const userId = payload.id_user;
      if (!userId) {
        client.disconnect();
        return;
      }

      const user = await Users.findByPk(userId);

      if (!user) {
        client.disconnect();
        return;
      }

      client.user = {
        id: user.id,
        uuid: user.id,
        email: user.email,
        fs_name: user.firstName || '',
        ls_name: user.lastName || '',
      };

      this.connectedUsers.set(user.id, client.id);

      // Join user to their personal room
      client.join(`user_${user.id}`);

      console.log(`User ${user.email} connected to chat gateway`);

      // Notify user about their connection
      client.emit('connected', {
        message: 'Connected to chat gateway',
        user: client.user,
      });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user.uuid);
      console.log(`User ${client.user.email} disconnected from chat gateway`);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      // Verify user has access to this chat
      const chat = await Chat.findByPk(data.chatId);
      if (!chat) {
        client.emit('error', { message: 'Chat not found' });
        return;
      }

      // Check if user is sender or receiver
      const isSender = chat.id_user_sender === client.user.uuid;
      const isReceiver = chat.id_user_receiver.includes(client.user.uuid);

      if (!isSender && !isReceiver) {
        client.emit('error', { message: 'Access denied to this chat' });
        return;
      }

      // Join the chat room
      client.join(`chat_${data.chatId}`);

      client.emit('joined_chat', {
        message: `Joined chat ${data.chatId}`,
        chatId: data.chatId,
      });

      console.log(`User ${client.user.email} joined chat ${data.chatId}`);
    } catch (error) {
      console.error('Join chat error:', error);
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    client.leave(`chat_${data.chatId}`);

    client.emit('left_chat', {
      message: `Left chat ${data.chatId}`,
      chatId: data.chatId,
    });

    console.log(`User ${client.user.email} left chat ${data.chatId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: {
      id_user_receiver: string[];
      subject?: string;
      content?: string;
      piece_joint?: string[];
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      const createChatDto = {
        id_user_receiver: data.id_user_receiver,
        subject: data.subject,
        content: data.content,
        piece_joint: data.piece_joint,
      };

      const result = await this.chatService.create(
        createChatDto,
        client.user.uuid,
      );

      if (result.status === 201) {
        const chat = result.data;

        // Emit to all receivers
        data.id_user_receiver.forEach((receiverId) => {
          this.server.to(`user_${receiverId}`).emit('new_message', {
            type: 'chat',
            data: chat,
            sender: client.user,
          });
        });

        // Emit to sender
        client.emit('message_sent', {
          type: 'chat',
          data: chat,
        });

        console.log(
          `Message sent by ${client.user.email} to ${data.id_user_receiver.length} receivers`,
        );
      } else {
        client.emit('error', {
          message: result.message || 'Failed to send message',
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('send_message_with_files')
  async handleSendMessageWithFiles(
    @MessageBody()
    data: {
      id_user_receiver: string[];
      subject?: string;
      content?: string;
      files?: Array<{
        name: string;
        type: string;
        data: string; // base64 encoded file data
        size: number;
      }>;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      let uploadedFiles: string[] = [];

      // Process files if provided
      if (data.files && data.files.length > 0) {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/zip',
          'application/x-rar-compressed',
          'video/mp4',
          'video/avi',
          'video/mov',
          'audio/mp3',
          'audio/wav',
          'audio/mpeg',
        ];

        // Validate and upload each file
        for (const fileData of data.files) {
          // Validate file type
          if (!allowedMimeTypes.includes(fileData.type)) {
            client.emit('error', {
              message: `File type ${fileData.type} is not allowed`,
            });
            return;
          }

          // Validate file size (100GB limit)
          const maxSize = 100 * 1024 * 1024 * 1024; // 100GB
          if (fileData.size > maxSize) {
            client.emit('error', {
              message: `File ${fileData.name} size exceeds 100GB limit`,
            });
            return;
          }

          // Log file size for monitoring
          console.log(`Uploading file via WebSocket: ${fileData.name} (${(fileData.size / 1024 / 1024).toFixed(2)}MB), using optimized chunked async upload`);

          // Convert base64 to buffer
          const buffer = Buffer.from(fileData.data, 'base64');
          const file: Express.Multer.File = {
            fieldname: 'file',
            originalname: fileData.name,
            encoding: '7bit',
            mimetype: fileData.type,
            size: fileData.size,
            buffer: buffer,
            stream: Readable.from(buffer),
            destination: '',
            filename: '',
            path: '',
          };

          // Upload to Cloudinary
          const uploadResult = await this.cloudinaryService.uploadBufferFile(
            file,
            { useAsync: false },
          );
          if (uploadResult) {
            uploadedFiles.push(uploadResult.link);
          } else {
            client.emit('error', {
              message: `Failed to upload file ${fileData.name}`,
            });
            return;
          }
        }
      }

      const createChatDto = {
        id_user_receiver: data.id_user_receiver,
        subject: data.subject,
        content: data.content,
        piece_joint: uploadedFiles,
      };

      const result = await this.chatService.create(
        createChatDto,
        client.user.uuid,
      );

      if (result.status === 201) {
        const chat = result.data;

        // Emit to all receivers
        data.id_user_receiver.forEach((receiverId) => {
          this.server.to(`user_${receiverId}`).emit('new_message', {
            type: 'chat',
            data: chat,
            sender: client.user,
          });
        });

        // Emit to sender
        client.emit('message_sent', {
          type: 'chat',
          data: chat,
        });

        console.log(
          `Message with ${uploadedFiles.length} files sent by ${client.user.email} to ${data.id_user_receiver.length} receivers`,
        );
      } else {
        client.emit('error', {
          message: result.message || 'Failed to send message with files',
        });
      }
    } catch (error) {
      console.error('Send message with files error:', error);
      client.emit('error', { message: 'Failed to send message with files' });
    }
  }

  @SubscribeMessage('send_reply')
  async handleSendReply(
    @MessageBody()
    data: {
      id_chat: string;
      content: string;
      is_public?: boolean;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      const createReplyDto = {
        id_sender: client.user.uuid,
        id_chat: data.id_chat,
        content: data.content,
        is_public: data.is_public !== undefined ? data.is_public : true,
      };

      const result = await this.repliesChatService.create(createReplyDto);

      if (result.status === 201) {
        const reply = result.data;

        // Get the original chat to determine who should receive the reply
        const chat = await Chat.findByPk(data.id_chat);
        if (chat) {
          if (data.is_public === false) {
            // Private reply - only send to sender
            client.emit('reply_received', {
              type: 'reply',
              data: reply,
              sender: client.user,
              is_private: true,
            });
          } else {
            // Public reply - send to all chat participants
            const allParticipants = [
              chat.id_user_sender,
              ...chat.id_user_receiver,
            ];

            allParticipants.forEach((participantId) => {
              this.server.to(`user_${participantId}`).emit('reply_received', {
                type: 'reply',
                data: reply,
                sender: client.user,
                is_private: false,
              });
            });
          }
        }

        // Emit to sender
        client.emit('reply_sent', {
          type: 'reply',
          data: reply,
        });

        console.log(
          `Reply sent by ${client.user.email} to chat ${data.id_chat} (public: ${data.is_public !== false})`,
        );
      } else {
        client.emit('error', {
          message: result.message || 'Failed to send reply',
        });
      }
    } catch (error) {
      console.error('Send reply error:', error);
      client.emit('error', { message: 'Failed to send reply' });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      const result = await this.chatService.markAsRead(
        data.chatId,
        client.user.uuid,
      );

      if (result.status === 200) {
        // Notify other participants that the message was read
        const chat = await Chat.findByPk(data.chatId);
        if (chat) {
          const allParticipants = [
            chat.id_user_sender,
            ...chat.id_user_receiver,
          ];

          allParticipants.forEach((participantId) => {
            if (client.user && participantId !== client.user.uuid) {
              this.server.to(`user_${participantId}`).emit('message_read', {
                chatId: data.chatId,
                readBy: client.user,
                timestamp: new Date().toISOString(),
              });
            }
          });
        }

        client.emit('marked_as_read', {
          chatId: data.chatId,
          message: 'Message marked as read',
        });
      } else {
        client.emit('error', {
          message: result.message || 'Failed to mark as read',
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      client.emit('error', { message: 'Failed to mark as read' });
    }
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.user) {
      client.emit('error', { message: 'User not authenticated' });
      return;
    }

    const onlineUsers = Array.from(this.connectedUsers.keys());
    client.emit('online_users', {
      users: onlineUsers,
      count: onlineUsers.length,
    });
  }

  // Helper method to get user by socket ID
  private getUserBySocketId(socketId: string): string | undefined {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  // Helper method to emit to specific user
  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Helper method to emit to multiple users
  public emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
  }
}
