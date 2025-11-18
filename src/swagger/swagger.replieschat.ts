import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RepliesChatStatus } from 'src/models/model.replieschat';

export const RepliesChatSwagger = {
  // Create Reply
  create: () => [
    ApiOperation({
      summary: 'Create a new reply to a chat message',
      description:
        'Creates a new reply to an existing chat message with content and sender information.',
    }),
    ApiBody({
      description: 'Reply data',
      schema: {
        type: 'object',
        required: ['content', 'id_sender', 'id_chat'],
        properties: {
          content: {
            type: 'string',
            description: 'Content of the reply message',
            example: 'Thank you for your message. I will get back to you soon.',
          },
          id_sender: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the sender',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          id_chat: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the chat message being replied to',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          is_public: {
            type: 'boolean',
            description:
              'Whether the reply is public (visible to all receivers) or private (only to sender)',
            example: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Reply created successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Reply created successfully' },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              content: {
                type: 'string',
                example:
                  'Thank you for your message. I will get back to you soon.',
              },
              id_sender: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              id_chat: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              status: {
                type: 'string',
                enum: Object.values(RepliesChatStatus),
                example: 'alive',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:00:00.000Z',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid data or user/chat not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Sender user not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],

  // Get All Replies
  findAll: () => [
    ApiOperation({
      summary: 'Get all replies',
      description:
        'Retrieves all replies with sender and chat information. Only accessible by supervisors.',
    }),
    ApiResponse({
      status: 200,
      description: 'Replies retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: {
            type: 'string',
            example: 'Replies retrieved successfully',
          },
          data: {
            type: 'object',
            properties: {
              length: { type: 'number', example: 2 },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440000',
                    },
                    content: {
                      type: 'string',
                      example:
                        'Thank you for your message. I will get back to you soon.',
                    },
                    id_sender: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440001',
                    },
                    id_chat: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440002',
                    },
                    status: {
                      type: 'string',
                      enum: Object.values(RepliesChatStatus),
                      example: 'alive',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    sender: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440001',
                        },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        email: {
                          type: 'string',
                          example: 'john.doe@example.com',
                        },
                        avatar: {
                          type: 'string',
                          nullable: true,
                          example: 'https://example.com/avatar.jpg',
                        },
                      },
                    },
                    chat: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440002',
                        },
                        subject: {
                          type: 'string',
                          example: 'Meeting Discussion',
                        },
                        content: {
                          type: 'string',
                          example:
                            "Hello everyone, let's discuss the project updates.",
                        },
                        id_user_sender: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440003',
                        },
                        id_user_receiver: {
                          type: 'array',
                          items: { type: 'string', format: 'uuid' },
                          example: ['550e8400-e29b-41d4-a716-446655440001'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ],

  // Get Reply by ID
  findOne: () => [
    ApiOperation({
      summary: 'Get a reply by ID',
      description:
        'Retrieves a specific reply by its UUID with sender and chat information.',
    }),
    ApiParam({
      name: 'id',
      description: 'Reply UUID',
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Reply retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Reply retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              content: {
                type: 'string',
                example:
                  'Thank you for your message. I will get back to you soon.',
              },
              id_sender: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              id_chat: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              status: {
                type: 'string',
                enum: Object.values(RepliesChatStatus),
                example: 'alive',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:00:00.000Z',
              },
              sender: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440001',
                  },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  avatar: {
                    type: 'string',
                    nullable: true,
                    example: 'https://example.com/avatar.jpg',
                  },
                },
              },
              chat: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440002',
                  },
                  subject: { type: 'string', example: 'Meeting Discussion' },
                  content: {
                    type: 'string',
                    example:
                      "Hello everyone, let's discuss the project updates.",
                  },
                  id_user_sender: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440003',
                  },
                  id_user_receiver: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                    example: ['550e8400-e29b-41d4-a716-446655440001'],
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Reply not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Reply not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],

  // Get Replies by Chat
  findByChat: () => [
    ApiOperation({
      summary: 'Get all replies for a specific chat message',
      description:
        'Retrieves all replies for a specific chat message, ordered by creation date.',
    }),
    ApiParam({
      name: 'chatId',
      description: 'Chat message UUID',
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440002',
    }),
    ApiResponse({
      status: 200,
      description: 'Chat replies retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: {
            type: 'string',
            example: 'Chat replies retrieved successfully',
          },
          data: {
            type: 'object',
            properties: {
              length: { type: 'number', example: 1 },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440000',
                    },
                    content: {
                      type: 'string',
                      example:
                        'Thank you for your message. I will get back to you soon.',
                    },
                    id_sender: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440001',
                    },
                    id_chat: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440002',
                    },
                    status: {
                      type: 'string',
                      enum: Object.values(RepliesChatStatus),
                      example: 'alive',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    sender: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440001',
                        },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        email: {
                          type: 'string',
                          example: 'john.doe@example.com',
                        },
                        avatar: {
                          type: 'string',
                          nullable: true,
                          example: 'https://example.com/avatar.jpg',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Chat message not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Chat message not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],

  // Get Replies by Sender
  findBySender: () => [
    ApiOperation({
      summary: 'Get all replies from a specific sender',
      description: 'Retrieves all replies sent by a specific user.',
    }),
    ApiParam({
      name: 'senderId',
      description: 'Sender user UUID',
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    ApiResponse({
      status: 200,
      description: 'Sender replies retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: {
            type: 'string',
            example: 'Sender replies retrieved successfully',
          },
          data: {
            type: 'object',
            properties: {
              length: { type: 'number', example: 1 },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440000',
                    },
                    content: {
                      type: 'string',
                      example:
                        'Thank you for your message. I will get back to you soon.',
                    },
                    id_sender: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440001',
                    },
                    id_chat: {
                      type: 'string',
                      format: 'uuid',
                      example: '550e8400-e29b-41d4-a716-446655440002',
                    },
                    status: {
                      type: 'string',
                      enum: Object.values(RepliesChatStatus),
                      example: 'alive',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-01-25T10:00:00.000Z',
                    },
                    chat: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440002',
                        },
                        subject: {
                          type: 'string',
                          example: 'Meeting Discussion',
                        },
                        content: {
                          type: 'string',
                          example:
                            "Hello everyone, let's discuss the project updates.",
                        },
                        id_user_sender: {
                          type: 'string',
                          format: 'uuid',
                          example: '550e8400-e29b-41d4-a716-446655440003',
                        },
                        id_user_receiver: {
                          type: 'array',
                          items: { type: 'string', format: 'uuid' },
                          example: ['550e8400-e29b-41d4-a716-446655440001'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Sender user not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Sender user not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],

  // Update Reply
  update: () => [
    ApiOperation({
      summary: 'Update a reply',
      description: 'Updates an existing reply. Can update content and status.',
    }),
    ApiBody({
      description: 'Reply update data',
      schema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the reply to update',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          content: {
            type: 'string',
            description: 'Updated content of the reply',
            example: 'Updated reply content.',
          },
          status: {
            type: 'string',
            enum: Object.values(RepliesChatStatus),
            description: 'Status of the reply',
            example: 'alive',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Reply updated successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Reply updated successfully' },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              content: { type: 'string', example: 'Updated reply content.' },
              id_sender: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              id_chat: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440002',
              },
              status: {
                type: 'string',
                enum: Object.values(RepliesChatStatus),
                example: 'alive',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T11:00:00.000Z',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Reply not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Reply not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],

  // Delete Reply
  delete: () => [
    ApiOperation({
      summary: 'Delete a reply (soft delete)',
      description: 'Performs a soft delete by changing the status to deleted.',
    }),
    ApiBody({
      description: 'Reply deletion data',
      schema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the reply to delete',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Reply deleted successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Reply deleted successfully' },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Reply not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Reply not found' },
          data: { type: 'null', example: null },
        },
      },
    }),
  ],
};
