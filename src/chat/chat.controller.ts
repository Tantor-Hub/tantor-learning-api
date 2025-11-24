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
import { TransferChatService } from './transfer-chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { CreateTransferChatDto } from './dto/create-transfer-chat.dto';
import { UpdateTransferChatDto } from './dto/update-transfer-chat.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { CloudinaryService } from 'src/services/service.cloudinary';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly transferChatService: TransferChatService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 107_374_182_400 } }), // 10 files, 100GB each
  )
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new chat message with optional file attachments',
    description: `
# Chat Message Creation with File Upload

This endpoint allows you to create a new chat message with optional file attachments.

## How it works:
1. **Authentication**: Your JWT token is automatically used to identify you as the sender
2. **File Upload**: Upload files using the 'files' field in multipart/form-data
3. **Automatic Processing**: Files are automatically uploaded to Cloudinary and URLs stored in piece_joint
4. **Message Creation**: The chat message is created with all the provided data

## File Upload Details:
- **Maximum Files**: 10 files per message
- **File Size Limit**: 100GB per file
- **🚀 Automatic Optimizations:**
  All file uploads are automatically optimized with:
  - Chunked uploads (500KB chunks) for better reliability
  - Async processing (non-blocking) to prevent timeouts
  - Extended timeouts (10 minutes) for long uploads
  - Keep-alive headers to maintain connections
- **Supported Formats**: 
  - Any file type is allowed

## Example Usage:
\`\`\`bash
curl -X POST /api/chat/create \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "id_user_receiver=[\"user-uuid-1\",\"user-uuid-2\"]" \\
  -F "subject=Meeting Discussion" \\
  -F "content=Please review the attached documents" \\
  -F "files=@document.pdf" \\
  -F "files=@image.jpg"
\`\`\`
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `
# Request Body Schema

## Required Fields:
- **id_user_receiver**: Array of user UUIDs who will receive this message

## Optional Fields:
- **subject**: Subject/title of the message
- **content**: Text content of the message
- **files**: File attachments (up to 10 files, 100GB each - all automatically optimized)

## File Upload Instructions:
1. Use \`multipart/form-data\` content type
2. For each file, use the field name \`files\`
3. Files are automatically uploaded to Cloudinary
4. Cloudinary URLs are stored in the \`piece_joint\` field
5. Supported file types: PDF, DOC, DOCX, TXT, images, videos, audio, archives, JSON, CSV, XML

## Example Form Data:
\`\`\`
id_user_receiver: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
subject: "Meeting Discussion"
content: "Please review the attached documents"
files: [file1.pdf, image1.jpg, video1.mp4]
\`\`\`
    `,
    schema: {
      type: 'object',
      required: ['id_user_receiver'],
      properties: {
        id_user_receiver: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
            description: 'UUID of a user who will receive this message',
          },
          description: 'Array of receiver user UUIDs (REQUIRED)',
          example: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
          minItems: 1,
        },
        subject: {
          type: 'string',
          description: 'Subject/title of the chat message (OPTIONAL)',
          example: 'Meeting Discussion',
          maxLength: 255,
        },
        content: {
          type: 'string',
          description: 'Text content of the chat message (OPTIONAL)',
          example: "Hello everyone, let's discuss the project updates.",
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: 'A file attachment',
          },
          description: `
# File Attachments (OPTIONAL)

## Upload Rules:
- **Maximum Files**: 10 files per message
- **File Size Limit**: 100GB per file (all uploads automatically optimized)
- **Field Name**: Use 'files' for each file upload

## Supported File Types:
### Documents:
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)
- PowerPoint (.ppt, .pptx)
- Excel (.xls, .xlsx)

### Images:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

### Videos:
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- QuickTime (.mov)

### Audio:
- MP3 (.mp3)
- WAV (.wav)
- MPEG (.mpeg)
- OGG (.ogg)

### Archives:
- ZIP (.zip)
- RAR (.rar)
- 7Z (.7z)

### Data Files:
- JSON (.json)
- CSV (.csv)
- XML (.xml)

## Processing:
Files are automatically uploaded to Cloudinary and URLs are stored in the \`piece_joint\` field.
          `,
          maxItems: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: `
# Success Response - Chat Message Created

The chat message has been successfully created with all provided data and file attachments.

## Response Structure:
- **status**: HTTP status code (201)
- **message**: Success message
- **data**: The created chat message object

## Key Fields in Response:
- **id**: Unique identifier for the chat message
- **id_user_sender**: UUID of the user who sent the message (from JWT token)
- **id_user_receiver**: Array of UUIDs of users who will receive the message
- **piece_joint**: Array of Cloudinary URLs for uploaded files (if any)
- **status**: Message status ('alive' for active messages)
- **createdAt/updatedAt**: Timestamps

## File URLs:
If files were uploaded, the \`piece_joint\` field will contain Cloudinary URLs where the files are stored.
    `,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 201,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Chat message created successfully',
          description: 'Success message',
        },
        data: {
          type: 'object',
          description: 'The created chat message object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
              description: 'Unique identifier for the chat message',
            },
            id_user_sender: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
              description:
                'UUID of the user who sent the message (automatically set from JWT token)',
            },
            id_user_receiver: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: [
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
              ],
              description:
                'Array of UUIDs of users who will receive this message',
            },
            subject: {
              type: 'string',
              example: 'Meeting Discussion',
              description: 'Subject/title of the message',
            },
            content: {
              type: 'string',
              example: "Hello everyone, let's discuss the project updates.",
              description: 'Text content of the message',
            },
            reader: {
              type: 'array',
              items: { type: 'string' },
              example: [],
              description: 'Array of user UUIDs who have read this message',
            },
            status: {
              type: 'string',
              enum: ['alive', 'deleted'],
              example: 'alive',
              description:
                'Message status (alive = active, deleted = soft deleted)',
            },
            dontshowme: {
              type: 'array',
              items: { type: 'string' },
              example: [],
              description: 'Array of user UUIDs who have hidden this message',
            },
            piece_joint: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Array of Cloudinary URLs for uploaded file attachments',
              example: [
                'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
                'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/images/image.jpg',
                'https://res.cloudinary.com/your-cloud/video/upload/v1234567890/__tantorLearning/videos/video.mp4',
              ],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-25T10:00:00.000Z',
              description: 'Timestamp when the message was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-25T10:00:00.000Z',
              description: 'Timestamp when the message was last updated',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `
# Bad Request - Validation Errors

This error occurs when the request data is invalid or doesn't meet the requirements.

## Common Causes:
1. **Invalid User UUIDs**: One or more receiver UUIDs don't exist
2. **File Validation Failed**: 
   - File type not supported
   - File size exceeds 50MB limit
   - More than 10 files uploaded
3. **Missing Required Fields**: id_user_receiver is missing or empty
4. **Invalid Data Format**: Malformed UUIDs or data

## Example Error Messages:
- "One or more receiver users not found"
- "File type application/octet-stream is not allowed. Supported types: PDF, DOC, DOCX, TXT, images, videos, audio, archives, JSON, CSV, XML"
- "File document.pdf size exceeds 50MB limit"
- "id_user_receiver is required"
    `,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 400,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example:
            'File type application/octet-stream is not allowed. Supported types: PDF, DOC, DOCX, TXT, images, videos, audio, archives, JSON, CSV, XML',
          description: 'Detailed error message explaining what went wrong',
        },
        data: {
          type: 'null',
          example: null,
          description: 'No data returned for error responses',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: `
# Internal Server Error

This error occurs when there's an unexpected server-side issue.

## Common Causes:
1. **Database Connection Issues**: Unable to connect to the database
2. **Cloudinary Upload Failure**: File upload to Cloudinary failed
3. **Server Configuration Issues**: Missing environment variables or configuration
4. **Unexpected Errors**: Unhandled exceptions in the application

## Response Structure:
The error response includes detailed information about what went wrong, including error type and timestamp for debugging purposes.
    `,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 500,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Internal server error while creating chat message',
          description: 'General error message',
        },
        data: {
          type: 'object',
          description: 'Detailed error information for debugging',
          properties: {
            errorType: {
              type: 'string',
              example: 'SequelizeDatabaseError',
              description: 'Type of error that occurred',
            },
            errorMessage: {
              type: 'string',
              example: 'Connection timeout to database',
              description: 'Detailed error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-25T10:00:00.000Z',
              description: 'When the error occurred',
            },
          },
        },
      },
    },
  })
  async create(
    @Body() createChatDto: CreateChatDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const userId = req.user.id_user; // Extract user ID from JWT token

    try {
      // Handle file uploads if provided
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
          'image/svg+xml',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'video/mp4',
          'video/avi',
          'video/mov',
          'video/quicktime',
          'video/x-msvideo',
          'audio/mp3',
          'audio/wav',
          'audio/mpeg',
          'audio/ogg',
          'application/json',
          'text/csv',
          'application/xml',
          'text/xml',
        ];

        // Validate each file
        for (const file of files) {
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
              status: 400,
              message: `File type ${file.mimetype} is not allowed. Supported types: PDF, DOC, DOCX, TXT, images, videos, audio, archives, JSON, CSV, XML`,
              data: null,
            };
          }

          // Validate file size (100GB limit)
          const maxSize = 100 * 1024 * 1024 * 1024; // 100GB
          if (file.size > maxSize) {
            return {
              status: 400,
              message: `File ${file.originalname} size exceeds 100GB limit`,
              data: null,
            };
          }

          // Log file size for monitoring
          console.log(`Uploading file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB), using optimized chunked async upload`);
        }

        // Upload files to Cloudinary
        const uploadedFiles: string[] = [];
        for (const file of files) {
        const uploadResult = await this.cloudinaryService.uploadBufferFile(
          file,
          { useAsync: false },
        );
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
        message: 'Internal server error while creating chat message',
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
  @ApiOperation({
    summary: 'Get all chat messages',
    description:
      'Retrieve all chat messages (both regular and transferred chats). Each message includes an `isOpened` field indicating whether the current authenticated user has read the message, and an `isTransferred` field (true for transfer chats, false for regular chats). If a user ID is provided (from JWT token), transfer chats where the user is involved are also included.',
  })
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
              subject: 'Meeting Discussion',
              createdAt: '2025-01-25T10:00:00.000Z',
              sender: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              isOpened: true,
              role: 'sender',
              isTransferred: false,
            },
          ],
        },
      },
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat messages retrieved successfully',
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
                  id: { type: 'string', format: 'uuid' },
                  subject: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  sender: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                  isOpened: {
                    type: 'boolean',
                    description:
                      'Indicates whether the current authenticated user has opened/read this message. For senders: true if all receivers have read. For receivers: true if the current user has read.',
                  },
                  role: {
                    type: 'string',
                    enum: ['sender', 'receiver'],
                    nullable: true,
                    description:
                      "Indicates the current user's role in this message: 'sender' if the user sent the message, 'receiver' if the user received it",
                    example: 'sender',
                  },
                  isTransferred: {
                    type: 'boolean',
                    description:
                      'Indicates whether this is a transferred chat (true) or a regular chat (false). Transfer chats include additional fields like transferSender and transferId.',
                    example: false,
                  },
                },
              },
            },
          },
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
  findAll(@Request() req: any) {
    const userId = req.user?.id_user; // Extract user ID from JWT token if available
    return this.chatService.findAll(userId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get chat messages for the authenticated user',
    description:
      'Retrieves all chat messages where the authenticated user is either sender or receiver, including both regular chats and transferred chats. User ID is automatically extracted from JWT token. Each message includes an `isOpened` field indicating whether the current user has read the message, and an `isTransferred` field (true for transfer chats, false for regular chats). Transferred chats also include a `transferSender` field and `transferId` field.',
  })
  @ApiResponse({
    status: 200,
    description: 'User chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'User chat messages retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              subject: 'Meeting Discussion',
              createdAt: '2025-01-25T10:00:00.000Z',
              sender: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              isOpened: true,
              role: 'sender',
              isTransferred: false,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              subject: 'Project Update',
              createdAt: '2025-01-25T11:00:00.000Z',
              sender: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
              },
              isOpened: false,
              role: 'receiver',
              isTransferred: false,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              subject: 'Transferred Message',
              createdAt: '2025-01-25T11:00:00.000Z',
              sender: {
                firstName: 'Original',
                lastName: 'Sender',
                email: 'original.sender@example.com',
              },
              transferSender: {
                firstName: 'Transfer',
                lastName: 'Sender',
                email: 'transfer.sender@example.com',
              },
              isOpened: false,
              role: 'receiver',
              isTransferred: true,
              transferId: '550e8400-e29b-41d4-a716-446655440003',
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

  @Get('user/deleted')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get deleted chat messages for the authenticated user',
    description:
      'Retrieves all deleted chat messages where the authenticated user is either sender or receiver. User ID is automatically extracted from JWT token. Each message includes an `isOpened` field indicating whether the current user has read the message.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted user chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Deleted user chat messages retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              subject: 'Deleted Message',
              createdAt: '2025-01-25T10:00:00.000Z',
              sender: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              isOpened: true,
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
          message:
            'Internal server error while retrieving deleted user chat messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findDeletedByUser(@Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.findDeletedByUser(userId);
  }

  @Get('user/sent')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get messages sent by the authenticated user',
    description:
      'Retrieves all chat messages sent by the authenticated user. User ID is automatically extracted from JWT token. Each message includes an `isOpened` field indicating whether the current user has read the message.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sent messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Sent messages retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              subject: 'Meeting Discussion',
              createdAt: '2025-01-25T10:00:00.000Z',
              sender: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              isOpened: true,
              role: 'sender',
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
          message: 'Internal server error while retrieving sent messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findSentByUser(@Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.findSentByUser(userId);
  }

  @Get('user/received')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get messages received by the authenticated user',
    description:
      'Retrieves all chat messages received by the authenticated user, including transferred chats. User ID is automatically extracted from JWT token. Each message includes an `isOpened` field indicating whether the current user has read the message. All chats include an `isTransferred` field (true for transfer chats, false for regular chats). Transferred chats also include a `transferSender` field and `transferId` field.',
  })
  @ApiResponse({
    status: 200,
    description: 'Received messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Received messages retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              subject: 'Meeting Discussion',
              createdAt: '2025-01-25T10:00:00.000Z',
              sender: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              isOpened: true,
              role: 'sender',
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
          message: 'Internal server error while retrieving received messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findReceivedByUser(@Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.findReceivedByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a chat message by ID',
    description:
      'Retrieve a specific chat message by its ID. When an authenticated user opens this message, their ID is automatically added to the `reader` array. The response includes an `isOpened` field indicating whether the current user has read the message.',
  })
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
          reader: [
            '550e8400-e29b-41d4-a716-446655440002',
            '550e8400-e29b-41d4-a716-446655440003',
          ],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          isOpened: true,
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
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token (required due to guard)
    return this.chatService.findOne(id, userId);
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
    description: 'Delete a chat message. If the user is the sender, the status is changed to deleted (hidden from everyone). If the user is a receiver, their ID is added to the dontshowme array (hidden only from that receiver).',
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
    status: 403,
    description: 'Forbidden - You do not have permission to delete this chat message (user is neither sender nor receiver)',
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
  remove(@Body() deleteChatDto: DeleteChatDto, @Request() req: any) {
    const userId = req.user.id_user; // Extract user ID from JWT token
    return this.chatService.remove(deleteChatDto, userId);
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

  // ========== Transfer Chat CRUD Routes ==========

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Transfer a chat to other users',
    description:
      'Transfer a chat message to other users. You can only transfer chats where you are the sender or one of the receivers.',
  })
  @ApiBody({
    description: 'Chat transfer data',
    schema: {
      type: 'object',
      required: ['id_chat', 'receivers'],
      properties: {
        id_chat: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of the chat to transfer',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        receivers: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description:
            'Array of user UUIDs who will receive the transferred chat',
          example: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
          minItems: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chat transfer created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Chat transfer created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            id_chat: { type: 'string', format: 'uuid' },
            sender: { type: 'string', format: 'uuid' },
            receivers: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
            reader: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of user IDs who have read this transferred chat (initialized as empty)',
              example: [],
            },
            dontshowme: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of user IDs who have hidden this transferred chat (initialized as empty)',
              example: [],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or receivers not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You can only transfer chats where you are the sender or one of the receivers',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  createTransfer(
    @Body() createTransferChatDto: CreateTransferChatDto,
    @Request() req: any,
  ) {
    const userId = req.user.id_user;
    return this.transferChatService.create(createTransferChatDto, userId);
  }

  @Get('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all chat transfers',
    description:
      'Retrieve all chat transfers where the authenticated user is the sender or one of the receivers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat transfers retrieved successfully',
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
                  id: { type: 'string', format: 'uuid' },
                  id_chat: { type: 'string', format: 'uuid' },
                  sender: { type: 'string', format: 'uuid' },
                  receivers: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  chat: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      subject: { type: 'string' },
                      content: { type: 'string' },
                    },
                  },
                  senderUser: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  findAllTransfers(@Request() req: any) {
    const userId = req.user.id_user;
    return this.transferChatService.findAll(userId);
  }

  @Get('transfer/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get a chat transfer by ID',
    description:
      'Retrieve a specific chat transfer by its ID. You can only access transfers where you are the sender or one of the receivers.',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat transfer UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfer retrieved successfully. When a receiver opens the transfer, their ID is automatically added to the reader array. The chat object contains selected fields from the original chat message (subject, content, piece_joint, sender, createdAt, updatedAt).',
    schema: {
      example: {
        status: 200,
        message: 'Chat transfer retrieved successfully',
        data: {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          id_chat: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          sender: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          receivers: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
          reader: ['550e8400-e29b-41d4-a716-446655440001'],
          dontshowme: [],
          isOpened: true,
          isTransferred: true,
          chat: {
            subject: 'Meeting Discussion',
            content: "Hello everyone, let's discuss the project updates.",
            piece_joint: ['https://example.com/file.pdf'],
            sender: {
              id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              avatar: 'https://example.com/avatar.jpg',
            },
            createdAt: '2025-11-18T11:40:43.225Z',
            updatedAt: '2025-11-18T11:40:43.225Z',
          },
          senderUser: {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            avatar: 'https://example.com/avatar2.jpg',
          },
          replies: [
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              content: 'Thank you for transferring this message.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_transferechat: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              status: 'alive',
              is_public: true,
              createdAt: '2025-11-18T11:45:43.225Z',
              updatedAt: '2025-11-18T11:45:43.225Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                avatar: 'https://example.com/avatar.jpg',
              },
            },
          ],
          createdAt: '2025-11-18T11:40:43.225Z',
          updatedAt: '2025-11-18T11:40:43.225Z',
        },
      },
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat transfer retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            id_chat: { type: 'string', format: 'uuid' },
            sender: { type: 'string', format: 'uuid' },
            receivers: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
            reader: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of user IDs who have read this transferred chat',
              example: ['550e8400-e29b-41d4-a716-446655440001'],
            },
            dontshowme: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of user IDs who have hidden this transferred chat',
              example: [],
            },
            isOpened: {
              type: 'boolean',
              description: 'Whether the current authenticated user has read this transferred chat',
              example: true,
            },
            isTransferred: {
              type: 'boolean',
              description: 'Indicates that this is a transferred chat (always true for transfer chat responses)',
              example: true,
            },
            chat: {
              type: 'object',
              description: 'The original chat that was transferred (simplified chat object with selected fields)',
              properties: {
                subject: {
                  type: 'string',
                  nullable: true,
                  description: 'Subject/title of the chat message',
                },
                content: {
                  type: 'string',
                  nullable: true,
                  description: 'Text content of the chat message',
                },
                piece_joint: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of file attachment URLs',
                },
                sender: {
                  type: 'object',
                  description: 'User information of the original chat sender',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    avatar: { type: 'string', nullable: true },
                  },
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            senderUser: {
              type: 'object',
              description: 'User information of the person who transferred the chat',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                avatar: { type: 'string', nullable: true },
              },
            },
            replies: {
              type: 'array',
              description: 'Array of replies to this transfer chat. If user is a receiver (not sender), only public replies are shown.',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  content: { type: 'string' },
                  id_sender: { type: 'string', format: 'uuid' },
                  id_transferechat: { type: 'string', format: 'uuid' },
                  status: { type: 'string', enum: ['alive', 'archive', 'deleted'] },
                  is_public: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  sender: {
                    type: 'object',
                    description: 'User information of the reply sender',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                      avatar: { type: 'string', nullable: true },
                    },
                  },
                },
              },
              example: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440003',
                  content: 'Thank you for transferring this message.',
                  id_sender: '550e8400-e29b-41d4-a716-446655440001',
                  id_transferechat: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                  status: 'alive',
                  is_public: true,
                  createdAt: '2025-11-18T11:45:43.225Z',
                  updatedAt: '2025-11-18T11:45:43.225Z',
                  sender: {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    avatar: 'https://example.com/avatar.jpg',
                  },
                },
              ],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this chat transfer',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat transfer not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  findOneTransfer(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user;
    return this.transferChatService.findOne(id, userId);
  }

  @Patch('transfer/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update a chat transfer',
    description:
      'Update a chat transfer by adding or removing people from the receivers list. Only the sender of the transfer can update it. Pass the updated receivers array in the body (this will replace the existing list).',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat transfer UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description:
      'Updated receivers array (add or remove people from the receiving list)',
    schema: {
      type: 'object',
      required: ['receivers'],
      properties: {
        receivers: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description:
            'Updated array of receiver UUIDs. This will replace the existing receivers list. Include all users who should receive the transfer.',
          example: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
          ],
          minItems: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfer updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat transfer updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            id_chat: { type: 'string', format: 'uuid' },
            sender: { type: 'string', format: 'uuid' },
            receivers: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or receivers not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the sender can update this chat transfer',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat transfer not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  updateTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransferChatDto: UpdateTransferChatDto,
    @Request() req: any,
  ) {
    const userId = req.user.id_user;
    return this.transferChatService.update(id, updateTransferChatDto, userId);
  }

  @Delete('transfer/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a chat transfer',
    description:
      'Delete a chat transfer. If the user is the sender, the transfer is permanently deleted. If the user is a receiver, their ID is added to the dontshowme array (hidden only from that receiver).',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat transfer UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Chat transfer deleted successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have permission to delete this chat transfer (user is neither sender nor receiver)',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat transfer not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  removeTransfer(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user;
    return this.transferChatService.remove(id, userId);
  }

  @Patch('transfer/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark a chat transfer as read by the authenticated user',
    description:
      'Marks a chat transfer as read by the authenticated user. User ID is automatically extracted from JWT token.',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat transfer UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfer marked as read',
    schema: {
      example: {
        status: 200,
        message: 'Chat transfer marked as read',
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
    description: 'Chat transfer not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat transfer not found',
        data: null,
      },
    },
  })
  markTransferAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const userId = req.user.id_user;
    return this.transferChatService.markAsRead(id, userId);
  }

  @Patch('transfer/:id/hide')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Hide a chat transfer for the authenticated user',
    description:
      'Hides a chat transfer for the authenticated user. User ID is automatically extracted from JWT token.',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat transfer UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat transfer hidden successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat transfer hidden successfully',
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
    description: 'Chat transfer not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat transfer not found',
        data: null,
      },
    },
  })
  hideTransfer(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user.id_user;
    return this.transferChatService.hideMessage(id, userId);
  }
}
