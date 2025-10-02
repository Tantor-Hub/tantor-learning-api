import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { GoogleDriveService } from 'src/services/service.googledrive';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new chat message',
    description:
      'Creates a new chat message with sender, receivers, and optional content and attachments. Sender ID is automatically extracted from JWT token.',
  })
  @ApiBody({
    description: 'Chat message data',
    schema: {
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
          description: 'Subject of the chat message',
          example: 'Meeting Discussion',
        },
        content: {
          type: 'string',
          description: 'Content of the chat message',
          example: "Hello everyone, let's discuss the project updates.",
        },
        piece_joint: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of attachment file paths',
          example: ['/uploads/file1.pdf', '/uploads/image1.jpg'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chat message created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Chat message created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            id_user_sender: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            id_user_receiver: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: [
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
              ],
            },
            subject: { type: 'string', example: 'Meeting Discussion' },
            content: {
              type: 'string',
              example: "Hello everyone, let's discuss the project updates.",
            },
            reader: { type: 'array', items: { type: 'string' }, example: [] },
            status: {
              type: 'string',
              enum: ['alive', 'deleted'],
              example: 'alive',
            },
            dontshowme: {
              type: 'array',
              items: { type: 'string' },
              example: [],
            },
            piece_joint: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/file1.pdf'],
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
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or users not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'One or more receiver users not found',
        },
        data: { type: 'null', example: null },
      },
    },
  })
  create(@Body() createChatDto: CreateChatDto, @Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.create(createChatDto, userId);
  }

  @Post('create-with-files')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 50 * 1024 * 1024 } }),
  ) // 10 files, 50MB each
  @ApiOperation({
    summary: 'Create a new chat message with file attachments',
    description:
      'Creates a new chat message with file attachments. Files are uploaded to Cloudinary and automatically organized by type: Images to /images, videos to /videos, audio to /audio, documents to /documents, archives to /archives, code files to /code, and other files to /files. URLs are stored in the piece_joint field. Sender ID is automatically extracted from JWT token.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Chat message with file attachments',
    schema: {
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
          description: 'Subject of the chat message',
          example: 'Meeting Discussion with Attachments',
        },
        content: {
          type: 'string',
          description: 'Content of the chat message',
          example: 'Hello everyone, please review the attached documents.',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: 'File attachment',
          },
          description:
            'File attachments (max 10 files, 50MB each). Supported types: PDF, DOC, DOCX, TXT, images, videos, audio, archives',
          maxItems: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chat message with files created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Chat message with files created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            id_user_sender: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            id_user_receiver: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: [
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
              ],
            },
            subject: {
              type: 'string',
              example: 'Meeting Discussion with Attachments',
            },
            content: {
              type: 'string',
              example: 'Hello everyone, please review the attached documents.',
            },
            reader: { type: 'array', items: { type: 'string' }, example: [] },
            status: {
              type: 'string',
              enum: ['alive', 'deleted'],
              example: 'alive',
            },
            dontshowme: {
              type: 'array',
              items: { type: 'string' },
              example: [],
            },
            piece_joint: {
              type: 'array',
              items: { type: 'string' },
              description: 'Cloudinary URLs of uploaded files',
              example: [
                'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
                'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/images/image.jpg',
                'https://res.cloudinary.com/your-cloud/video/upload/v1234567890/__tantorLearning/videos/video.mp4',
                'https://res.cloudinary.com/your-cloud/video/upload/v1234567890/__tantorLearning/audio/audio.mp3',
                'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/archives/archive.zip',
              ],
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
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid data, users not found, or file validation failed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'File type not allowed or file size exceeds limit',
        },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        data: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example:
                'Internal server error while creating chat message with files',
            },
            errorType: { type: 'string', example: 'SequelizeDatabaseError' },
            errorMessage: { type: 'string', example: 'Error message' },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-25T10:00:00.000Z',
            },
          },
        },
      },
    },
  })
  async createWithFiles(
    @Body() createChatDto: CreateChatDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const userId = req.user.id_user; // Extract user ID from JWT token

    try {
      // Validate files if provided
      if (files && files.length > 0) {
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

        // Validate each file
        for (const file of files) {
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
              status: 400,
              message: `File type ${file.mimetype} is not allowed`,
              data: null,
            };
          }

          // Validate file size (50MB limit)
          const maxSize = 50 * 1024 * 1024; // 50MB
          if (file.size > maxSize) {
            return {
              status: 400,
              message: `File ${file.originalname} size exceeds 50MB limit`,
              data: null,
            };
          }
        }

        // Upload files to Cloudinary
        const uploadedFiles: string[] = [];
        for (const file of files) {
          const uploadResult =
            await this.googleDriveService.uploadBufferFile(file);
          if (uploadResult) {
            uploadedFiles.push(uploadResult.link);
          } else {
            return {
              status: 500,
              message: `Failed to upload file ${file.originalname}`,
              data: null,
            };
          }
        }

        // Add uploaded file links to the DTO
        createChatDto.piece_joint = uploadedFiles;
      }

      return this.chatService.create(createChatDto, userId);
    } catch (error) {
      console.error('Error creating chat with files:', error);
      return {
        status: 500,
        message: 'Internal server error while creating chat message with files',
        data: {
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all chat messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat messages retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
              subject: 'Meeting Discussion',
              content: "Hello everyone, let's discuss the project updates.",
              reader: ['550e8400-e29b-41d4-a716-446655440002'],
              status: 'alive',
              dontshowme: [],
              piece_joint: ['/uploads/file1.pdf'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
                uuid: '550e8400-e29b-41d4-a716-446655440001',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving chat messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findAll() {
    return this.chatService.findAll();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get chat messages for the authenticated user',
    description:
      'Retrieves all chat messages where the authenticated user is either sender or receiver. User ID is automatically extracted from JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'User chat messages retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
              subject: 'Meeting Discussion',
              content: "Hello everyone, let's discuss the project updates.",
              reader: ['550e8400-e29b-41d4-a716-446655440002'],
              status: 'alive',
              dontshowme: [],
              piece_joint: ['/uploads/file1.pdf'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
                uuid: '550e8400-e29b-41d4-a716-446655440001',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving user chat messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findByUser(@Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat message by ID' })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
          subject: 'Meeting Discussion',
          content: "Hello everyone, let's discuss the project updates.",
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          sender: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat message not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat message not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a chat message' })
  @ApiResponse({
    status: 200,
    description: 'Chat message updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
          subject: 'Updated Meeting Discussion',
          content: 'Updated content for the discussion.',
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat message not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat message not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while updating chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  update(@Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark a chat message as read by the authenticated user',
    description:
      'Marks a chat message as read by the authenticated user. User ID is automatically extracted from JWT token.',
  })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message marked as read',
    schema: {
      example: {
        status: 200,
        message: 'Chat message marked as read',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          updatedAt: '2025-01-25T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat message not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat message not found',
        data: null,
      },
    },
  })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.markAsRead(id, userId);
  }

  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Hide a chat message for the authenticated user',
    description:
      'Hides a chat message for the authenticated user. User ID is automatically extracted from JWT token.',
  })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message hidden successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message hidden successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          dontshowme: ['550e8400-e29b-41d4-a716-446655440002'],
          updatedAt: '2025-01-25T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat message not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat message not found',
        data: null,
      },
    },
  })
  hideMessage(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.hideMessage(id, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a chat message (soft delete)',
    description: 'Performs a soft delete by changing the status to deleted.',
  })
  @ApiBody({
    description: 'Chat message deletion data',
    schema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of the chat message to delete',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat message deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat message deleted successfully',
        },
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
  })
  @ApiResponse({
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
  })
  remove(@Body() deleteChatDto: DeleteChatDto) {
    return this.chatService.remove(deleteChatDto);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Restore a deleted chat message',
    description:
      'Restores a deleted chat message by changing its status back to alive. Only deleted chats can be restored.',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat message UUID to restore',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat message restored successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat message restored successfully',
        },
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: 'Chat message is not deleted',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Chat message is not deleted and cannot be restored',
        },
        data: { type: 'null', example: null },
      },
    },
  })
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.restore(id);
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Cleanup deleted chat messages (Admin only)',
    description:
      'Permanently deletes chat messages that have been in deleted status for more than 30 days. This operation cannot be undone. Only accessible by secretaries and administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted chat messages cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Successfully cleaned up 5 deleted chat messages',
        },
        data: {
          type: 'object',
          properties: {
            cleanedCount: {
              type: 'number',
              description: 'Number of chat messages permanently deleted',
              example: 5,
            },
            deletedChatIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of permanently deleted chat message IDs',
              example: [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
                '550e8400-e29b-41d4-a716-446655440004',
                '550e8400-e29b-41d4-a716-446655440005',
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'No deleted chats found for cleanup',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'No deleted chats found for cleanup',
        },
        data: {
          type: 'object',
          properties: {
            cleanedCount: {
              type: 'number',
              description: 'Number of chat messages permanently deleted',
              example: 0,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Insufficient permissions',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example:
            "La clé d'authentification fournie n'a pas les droits recquis pour accéder à ces ressources",
        },
        data: { type: 'null', example: null },
      },
    },
  })
  cleanupDeletedChats() {
    return this.chatService.cleanupDeletedChats();
  }
}
