import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const WebSocketSwagger = {
  // WebSocket Events Documentation
  events: {
    // Client to Server Events
    clientToServer: {
      join_chat: {
        summary: 'Join a chat room',
        description: 'Join a specific chat room to receive real-time messages',
        body: {
          type: 'object',
          required: ['chatId'],
          properties: {
            chatId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the chat room to join',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
        responses: {
          joined_chat: {
            description: 'Successfully joined the chat room',
            data: {
              message: 'Joined chat {chatId}',
              chatId: 'string',
            },
          },
          error: {
            description: 'Error joining chat room',
            data: {
              message: 'Access denied to this chat',
            },
          },
        },
      },

      leave_chat: {
        summary: 'Leave a chat room',
        description: 'Leave a specific chat room',
        body: {
          type: 'object',
          required: ['chatId'],
          properties: {
            chatId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the chat room to leave',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
        responses: {
          left_chat: {
            description: 'Successfully left the chat room',
            data: {
              message: 'Left chat {chatId}',
              chatId: 'string',
            },
          },
        },
      },

      send_message: {
        summary: 'Send a chat message',
        description: 'Send a new chat message to specified receivers',
        body: {
          type: 'object',
          required: ['id_user_receiver'],
          properties: {
            id_user_receiver: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of receiver UUIDs',
              example: [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
              ],
            },
            subject: {
              type: 'string',
              description: 'Subject of the message (optional)',
              example: 'Meeting Discussion',
            },
            content: {
              type: 'string',
              description: 'Content of the message (optional)',
              example: "Hello everyone, let's discuss the project updates.",
            },
            piece_joint: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of file URLs (optional)',
              example: [
                'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/document.pdf',
              ],
            },
          },
        },
        responses: {
          message_sent: {
            description: 'Message sent successfully',
            data: {
              type: 'chat',
              data: {
                id: 'string',
                id_user_sender: 'string',
                id_user_receiver: ['string'],
                subject: 'string',
                content: 'string',
                piece_joint: ['string'],
                createdAt: 'string',
              },
            },
          },
          new_message: {
            description: 'New message received (sent to receivers)',
            data: {
              type: 'chat',
              data: {
                id: 'string',
                id_user_sender: 'string',
                id_user_receiver: ['string'],
                subject: 'string',
                content: 'string',
                piece_joint: ['string'],
                createdAt: 'string',
              },
              sender: {
                id: 'string',
                uuid: 'string',
                email: 'string',
                fs_name: 'string',
                ls_name: 'string',
              },
            },
          },
        },
      },

      send_message_with_files: {
        summary: 'Send a chat message with file attachments',
        description:
          'Send a new chat message with file attachments. Files are base64 encoded and uploaded to Cloudinary.',
        body: {
          type: 'object',
          required: ['id_user_receiver'],
          properties: {
            id_user_receiver: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of receiver UUIDs',
              example: [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
              ],
            },
            subject: {
              type: 'string',
              description: 'Subject of the message (optional)',
              example: 'Meeting Discussion with Attachments',
            },
            content: {
              type: 'string',
              description: 'Content of the message (optional)',
              example: 'Hello everyone, please review the attached documents.',
            },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Original file name',
                    example: 'document.pdf',
                  },
                  type: {
                    type: 'string',
                    description: 'MIME type of the file',
                    example: 'application/pdf',
                  },
                  size: {
                    type: 'number',
                    description: 'File size in bytes',
                    example: 1024000,
                  },
                  data: {
                    type: 'string',
                    description: 'Base64 encoded file data',
                    example:
                      'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDIgMCBSCj4+Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoK...',
                  },
                },
              },
              description:
                'Array of file attachments (max 10 files, 50MB each)',
              maxItems: 10,
            },
          },
        },
        responses: {
          message_sent: {
            description: 'Message with files sent successfully',
            data: {
              type: 'chat',
              data: {
                id: 'string',
                id_user_sender: 'string',
                id_user_receiver: ['string'],
                subject: 'string',
                content: 'string',
                piece_joint: ['string'], // Cloudinary URLs
                createdAt: 'string',
              },
            },
          },
          new_message: {
            description: 'New message with files received (sent to receivers)',
            data: {
              type: 'chat',
              data: {
                id: 'string',
                id_user_sender: 'string',
                id_user_receiver: ['string'],
                subject: 'string',
                content: 'string',
                piece_joint: ['string'], // Cloudinary URLs
                createdAt: 'string',
              },
              sender: {
                id: 'string',
                uuid: 'string',
                email: 'string',
                fs_name: 'string',
                ls_name: 'string',
              },
            },
          },
        },
      },

      send_reply: {
        summary: 'Send a reply to a chat message',
        description: 'Send a reply to an existing chat message',
        body: {
          type: 'object',
          required: ['id_chat', 'content'],
          properties: {
            id_chat: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the chat message to reply to',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            content: {
              type: 'string',
              description: 'Content of the reply',
              example:
                'Thank you for your message. I will get back to you soon.',
            },
            is_public: {
              type: 'boolean',
              description:
                'Whether the reply is public (visible to all) or private (only to sender)',
              example: true,
              default: true,
            },
          },
        },
        responses: {
          reply_sent: {
            description: 'Reply sent successfully',
            data: {
              type: 'reply',
              data: {
                id: 'string',
                id_sender: 'string',
                id_chat: 'string',
                content: 'string',
                is_public: 'boolean',
                createdAt: 'string',
              },
            },
          },
          reply_received: {
            description: 'Reply received (sent to chat participants)',
            data: {
              type: 'reply',
              data: {
                id: 'string',
                id_sender: 'string',
                id_chat: 'string',
                content: 'string',
                is_public: 'boolean',
                createdAt: 'string',
              },
              sender: {
                id: 'string',
                uuid: 'string',
                email: 'string',
                fs_name: 'string',
                ls_name: 'string',
              },
              is_private: 'boolean',
            },
          },
        },
      },

      mark_as_read: {
        summary: 'Mark a chat message as read',
        description: 'Mark a specific chat message as read by the current user',
        body: {
          type: 'object',
          required: ['chatId'],
          properties: {
            chatId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the chat message to mark as read',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
        responses: {
          marked_as_read: {
            description: 'Message marked as read successfully',
            data: {
              chatId: 'string',
              message: 'Message marked as read',
            },
          },
          message_read: {
            description:
              'Message read notification (sent to other participants)',
            data: {
              chatId: 'string',
              readBy: {
                id: 'string',
                uuid: 'string',
                email: 'string',
                fs_name: 'string',
                ls_name: 'string',
              },
              timestamp: 'string',
            },
          },
        },
      },

      get_online_users: {
        summary: 'Get list of online users',
        description: 'Get a list of currently online users',
        body: {
          type: 'object',
          properties: {},
        },
        responses: {
          online_users: {
            description: 'List of online users',
            data: {
              users: ['string'], // Array of user UUIDs
              count: 'number',
            },
          },
        },
      },
    },

    // Server to Client Events
    serverToClient: {
      connected: {
        summary: 'Connection established',
        description:
          'Emitted when a user successfully connects and authenticates',
        data: {
          message: 'Connected to chat gateway',
          user: {
            id: 'string',
            uuid: 'string',
            email: 'string',
            fs_name: 'string',
            ls_name: 'string',
          },
        },
      },

      error: {
        summary: 'Error occurred',
        description: 'Emitted when an error occurs during any operation',
        data: {
          message: 'Error description',
        },
      },

      new_message: {
        summary: 'New message received',
        description: 'Emitted when a new message is received',
        data: {
          type: 'chat',
          data: {
            id: 'string',
            id_user_sender: 'string',
            id_user_receiver: ['string'],
            subject: 'string',
            content: 'string',
            piece_joint: ['string'],
            createdAt: 'string',
          },
          sender: {
            id: 'string',
            uuid: 'string',
            email: 'string',
            fs_name: 'string',
            ls_name: 'string',
          },
        },
      },

      message_sent: {
        summary: 'Message sent confirmation',
        description: 'Emitted to confirm that a message was sent successfully',
        data: {
          type: 'chat',
          data: {
            id: 'string',
            id_user_sender: 'string',
            id_user_receiver: ['string'],
            subject: 'string',
            content: 'string',
            piece_joint: ['string'],
            createdAt: 'string',
          },
        },
      },

      reply_received: {
        summary: 'Reply received',
        description: 'Emitted when a reply is received',
        data: {
          type: 'reply',
          data: {
            id: 'string',
            id_sender: 'string',
            id_chat: 'string',
            content: 'string',
            is_public: 'boolean',
            createdAt: 'string',
          },
          sender: {
            id: 'string',
            uuid: 'string',
            email: 'string',
            fs_name: 'string',
            ls_name: 'string',
          },
          is_private: 'boolean',
        },
      },

      reply_sent: {
        summary: 'Reply sent confirmation',
        description: 'Emitted to confirm that a reply was sent successfully',
        data: {
          type: 'reply',
          data: {
            id: 'string',
            id_sender: 'string',
            id_chat: 'string',
            content: 'string',
            is_public: 'boolean',
            createdAt: 'string',
          },
        },
      },

      joined_chat: {
        summary: 'Joined chat room',
        description: 'Emitted when successfully joined a chat room',
        data: {
          message: 'Joined chat {chatId}',
          chatId: 'string',
        },
      },

      left_chat: {
        summary: 'Left chat room',
        description: 'Emitted when successfully left a chat room',
        data: {
          message: 'Left chat {chatId}',
          chatId: 'string',
        },
      },

      message_read: {
        summary: 'Message read notification',
        description: 'Emitted when another user reads a message',
        data: {
          chatId: 'string',
          readBy: {
            id: 'string',
            uuid: 'string',
            email: 'string',
            fs_name: 'string',
            ls_name: 'string',
          },
          timestamp: 'string',
        },
      },

      marked_as_read: {
        summary: 'Message marked as read',
        description: 'Emitted to confirm that a message was marked as read',
        data: {
          chatId: 'string',
          message: 'Message marked as read',
        },
      },

      online_users: {
        summary: 'Online users list',
        description: 'Emitted with the list of currently online users',
        data: {
          users: ['string'], // Array of user UUIDs
          count: 'number',
        },
      },
    },
  },

  // WebSocket Connection Information
  connection: {
    url: 'ws://localhost:3000/chat',
    namespace: '/chat',
    authentication: {
      type: 'JWT',
      method: 'handshake',
      description:
        'JWT token must be provided in the handshake auth object or Authorization header',
    },
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: false, // Set to false when using wildcard origin
    },
  },

  // File Upload Information
  fileUpload: {
    supportedTypes: [
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
    ],
    limits: {
      maxFiles: 10,
      maxFileSize: '50MB',
      maxTotalSize: '500MB',
    },
    storage: {
      provider: 'Cloudinary',
      folder: '__tantorLearning',
      description:
        'Files are automatically uploaded to Cloudinary and URLs are stored in the piece_joint field',
    },
  },
};
