import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatStatus } from 'src/models/model.chat';

export const ChatSwagger = {
  // Create Chat
  create: () => [
    ApiOperation({ 
      summary: 'Create a new chat message',
      description: 'Creates a new chat message with sender, receivers, and optional content and attachments.'
    }),
    ApiBody({
      description: 'Chat message data',
      schema: {
        type: 'object',
        required: ['id_user_sender', 'id_user_receiver'],
        properties: {
          id_user_sender: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the sender',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          id_user_receiver: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description: 'Array of receiver UUIDs',
            example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']
          },
          subject: {
            type: 'string',
            description: 'Subject of the chat message',
            example: 'Meeting Discussion'
          },
          content: {
            type: 'string',
            description: 'Content of the chat message',
            example: 'Hello everyone, let\'s discuss the project updates.'
          },
          piece_joint: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of attachment file paths',
            example: ['/uploads/file1.pdf', '/uploads/image1.jpg']
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Chat message created successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Chat message created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              id_user_sender: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
              id_user_receiver: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003']
              },
              subject: { type: 'string', example: 'Meeting Discussion' },
              content: { type: 'string', example: 'Hello everyone, let\'s discuss the project updates.' },
              reader: { type: 'array', items: { type: 'string' }, example: [] },
              status: { type: 'string', enum: Object.values(ChatStatus), example: 'alive' },
              dontshowme: { type: 'array', items: { type: 'string' }, example: [] },
              piece_joint: { type: 'array', items: { type: 'string' }, example: ['/uploads/file1.pdf'] },
              createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid data or users not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 400 },
          message: { type: 'string', example: 'One or more receiver users not found' },
          data: { type: 'null', example: null }
        }
      }
    })
  ],

  // Get All Chats
  findAll: () => [
    ApiOperation({ 
      summary: 'Get all chat messages',
      description: 'Retrieves all chat messages with sender information. Only accessible by supervisors.'
    }),
    ApiResponse({
      status: 200,
      description: 'Chat messages retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat messages retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              length: { type: 'number', example: 2 },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
                    id_user_sender: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
                    id_user_receiver: { 
                      type: 'array', 
                      items: { type: 'string', format: 'uuid' },
                      example: ['550e8400-e29b-41d4-a716-446655440002']
                    },
                    subject: { type: 'string', example: 'Meeting Discussion' },
                    content: { type: 'string', example: 'Hello everyone, let\'s discuss the project updates.' },
                    reader: { 
                      type: 'array', 
                      items: { type: 'string', format: 'uuid' },
                      example: ['550e8400-e29b-41d4-a716-446655440002']
                    },
                    status: { type: 'string', enum: Object.values(ChatStatus), example: 'alive' },
                    dontshowme: { type: 'array', items: { type: 'string' }, example: [] },
                    piece_joint: { type: 'array', items: { type: 'string' }, example: ['/uploads/file1.pdf'] },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
                    sender: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        fs_name: { type: 'string', example: 'John' },
                        ls_name: { type: 'string', example: 'Doe' },
                        email: { type: 'string', example: 'john.doe@example.com' },
                        uuid: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  ],

  // Get Chat by ID
  findOne: () => [
    ApiOperation({ 
      summary: 'Get a chat message by ID',
      description: 'Retrieves a specific chat message by its UUID with sender information.'
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Chat message UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiResponse({
      status: 200,
      description: 'Chat message retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat message retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              id_user_sender: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
              id_user_receiver: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              subject: { type: 'string', example: 'Meeting Discussion' },
              content: { type: 'string', example: 'Hello everyone, let\'s discuss the project updates.' },
              reader: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              status: { type: 'string', enum: Object.values(ChatStatus), example: 'alive' },
              dontshowme: { type: 'array', items: { type: 'string' }, example: [] },
              piece_joint: { type: 'array', items: { type: 'string' }, example: ['/uploads/file1.pdf'] },
              createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              sender: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  fs_name: { type: 'string', example: 'John' },
                  ls_name: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  uuid: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Chat message not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Chat message not found' },
          data: { type: 'null', example: null }
        }
      }
    })
  ],

  // Get Chats by User
  findByUser: () => [
    ApiOperation({ 
      summary: 'Get chat messages for a specific user',
      description: 'Retrieves all chat messages where the user is either sender or receiver.'
    }),
    ApiParam({ 
      name: 'userId', 
      description: 'User UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440001'
    }),
    ApiResponse({
      status: 200,
      description: 'User chat messages retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'User chat messages retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              length: { type: 'number', example: 1 },
              rows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
                    id_user_sender: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
                    id_user_receiver: { 
                      type: 'array', 
                      items: { type: 'string', format: 'uuid' },
                      example: ['550e8400-e29b-41d4-a716-446655440002']
                    },
                    subject: { type: 'string', example: 'Meeting Discussion' },
                    content: { type: 'string', example: 'Hello everyone, let\'s discuss the project updates.' },
                    reader: { 
                      type: 'array', 
                      items: { type: 'string', format: 'uuid' },
                      example: ['550e8400-e29b-41d4-a716-446655440002']
                    },
                    status: { type: 'string', enum: Object.values(ChatStatus), example: 'alive' },
                    dontshowme: { type: 'array', items: { type: 'string' }, example: [] },
                    piece_joint: { type: 'array', items: { type: 'string' }, example: ['/uploads/file1.pdf'] },
                    createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
                    sender: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        fs_name: { type: 'string', example: 'John' },
                        ls_name: { type: 'string', example: 'Doe' },
                        email: { type: 'string', example: 'john.doe@example.com' },
                        uuid: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  ],

  // Update Chat
  update: () => [
    ApiOperation({ 
      summary: 'Update a chat message',
      description: 'Updates an existing chat message. Can update subject, content, readers, status, hidden users, and attachments.'
    }),
    ApiBody({
      description: 'Chat message update data',
      schema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the chat message to update',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          subject: {
            type: 'string',
            description: 'Updated subject of the chat message',
            example: 'Updated Meeting Discussion'
          },
          content: {
            type: 'string',
            description: 'Updated content of the chat message',
            example: 'Updated content for the discussion.'
          },
          reader: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description: 'Array of user UUIDs who have read the message',
            example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']
          },
          status: {
            type: 'string',
            enum: Object.values(ChatStatus),
            description: 'Status of the chat message',
            example: 'alive'
          },
          dontshowme: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description: 'Array of user UUIDs who hide this message',
            example: ['550e8400-e29b-41d4-a716-446655440003']
          },
          piece_joint: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of attachment file paths',
            example: ['/uploads/file1.pdf', '/uploads/image1.jpg']
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Chat message updated successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat message updated successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              id_user_sender: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
              id_user_receiver: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              subject: { type: 'string', example: 'Updated Meeting Discussion' },
              content: { type: 'string', example: 'Updated content for the discussion.' },
              reader: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              status: { type: 'string', enum: Object.values(ChatStatus), example: 'alive' },
              dontshowme: { type: 'array', items: { type: 'string' }, example: [] },
              piece_joint: { type: 'array', items: { type: 'string' }, example: ['/uploads/file1.pdf'] },
              createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T11:00:00.000Z' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Chat message not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Chat message not found' },
          data: { type: 'null', example: null }
        }
      }
    })
  ],

  // Mark as Read
  markAsRead: () => [
    ApiOperation({ 
      summary: 'Mark a chat message as read by a user',
      description: 'Adds a user to the readers list of a chat message.'
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Chat message UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiParam({ 
      name: 'userId', 
      description: 'User UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440002'
    }),
    ApiResponse({
      status: 200,
      description: 'Chat message marked as read',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat message marked as read' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              reader: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T11:00:00.000Z' }
            }
          }
        }
      }
    })
  ],

  // Hide Message
  hideMessage: () => [
    ApiOperation({ 
      summary: 'Hide a chat message for a user',
      description: 'Adds a user to the dontshowme list of a chat message.'
    }),
    ApiParam({ 
      name: 'id', 
      description: 'Chat message UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    ApiParam({ 
      name: 'userId', 
      description: 'User UUID', 
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440002'
    }),
    ApiResponse({
      status: 200,
      description: 'Chat message hidden successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat message hidden successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              dontshowme: { 
                type: 'array', 
                items: { type: 'string', format: 'uuid' },
                example: ['550e8400-e29b-41d4-a716-446655440002']
              },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T11:00:00.000Z' }
            }
          }
        }
      }
    })
  ],

  // Delete Chat
  delete: () => [
    ApiOperation({ 
      summary: 'Delete a chat message (soft delete)',
      description: 'Performs a soft delete by changing the status to deleted.'
    }),
    ApiBody({
      description: 'Chat message deletion data',
      schema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of the chat message to delete',
            example: '550e8400-e29b-41d4-a716-446655440000'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Chat message deleted successfully',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Chat message deleted successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Chat message not found',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Chat message not found' },
          data: { type: 'null', example: null }
        }
      }
    })
  ]
};
