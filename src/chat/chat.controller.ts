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
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 50 * 1024 * 1024 } }),
  ) // 10 files, 50MB each
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
- **File Size Limit**: 50MB per file
- **Supported Formats**: 
  - Documents: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Videos: MP4, AVI, MOV, QuickTime
  - Audio: MP3, WAV, MPEG, OGG
  - Archives: ZIP, RAR, 7Z
  - Data: JSON, CSV, XML

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
- **files**: File attachments (up to 10 files, 50MB each)

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
- **File Size Limit**: 50MB per file
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

  @Get('user/deleted')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get deleted chat messages for the authenticated user',
    description:
      'Retrieves all deleted chat messages where the authenticated user is either sender or receiver. User ID is automatically extracted from JWT token.',
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
              id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
              subject: 'Deleted Message',
              content: 'This message was deleted.',
              reader: ['550e8400-e29b-41d4-a716-446655440002'],
              status: 'deleted',
              dontshowme: [],
              piece_joint: [],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
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
      'Retrieves all chat messages sent by the authenticated user. User ID is automatically extracted from JWT token.',
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
      'Retrieves all chat messages received by the authenticated user. User ID is automatically extracted from JWT token.',
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
