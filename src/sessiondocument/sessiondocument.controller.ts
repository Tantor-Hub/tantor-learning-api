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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionDocumentService } from './sessiondocument.service';
import { CreateSessionDocumentDto } from './dto/create-sessiondocument.dto';
import { UpdateSessionDocumentDto } from './dto/update-sessiondocument.dto';
import { UpdateSessionDocumentSecretaryDto } from './dto/update-sessiondocument-secretary.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { GoogleDriveService } from 'src/services/service.googledrive';

@ApiTags('Session Documents')
@ApiBearerAuth()
@Controller('sessiondocument')
@UseGuards(JwtAuthGuard)
export class SessionDocumentController {
  constructor(
    private readonly sessionDocumentService: SessionDocumentService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsStudent)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 50_000_000 } }),
  )
  @ApiOperation({
    summary: 'Create a new session document with file upload (Student only)',
    description: `Upload a document file and associate it with a training session. 
      The file will be stored in Cloudinary and the secure URL will be saved as piece_jointe.
      
      **Authorization:**
      - Only students can create session documents
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      - Required fields: document (file), type, id_session, categories
      
      **Supported File Types:**
      - Documents: PDF, DOC, DOCX, TXT
      - Images: JPEG, PNG, GIF, WebP
      - Maximum file size: 50MB
      
      **Important Notes:**
      - Student ID is automatically extracted from the JWT token
      - Status is automatically set to 'pending'
      - Each student can only have ONE document of each type per session
      
      **Example cURL:**
      \`\`\`bash
      curl -X POST "http://localhost:3000/sessiondocument/create" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "document=@/path/to/your/id-card.pdf" \\
        -F "type=Identity Card" \\
        -F "id_session=550e8400-e29b-41d4-a716-446655440001" \\
        -F "categories=before"
      \`\`\`
      
      **Example JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('document', fileInput.files[0]);
      formData.append('type', 'Identity Card');
      formData.append('id_session', '550e8400-e29b-41d4-a716-446655440001');
      formData.append('categories', 'before');
      
      const response = await fetch('/api/sessiondocument/create', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: formData
      });
      
      const result = await response.json();
      \`\`\`
      
      **Example with React/TypeScript:**
      \`\`\`typescript
      const handleFileUpload = async (file: File, sessionId: string, documentType: string) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', documentType);
        formData.append('id_session', sessionId);
        formData.append('categories', 'before');
        
        try {
          const response = await fetch('/api/sessiondocument/create', {
            method: 'POST',
            headers: {
              'Authorization': \`Bearer \${token}\`
            },
            body: formData
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.data || error.message || 'Failed to upload document');
          }
          
          const result = await response.json();
          console.log('Document created:', result.data);
          return result.data;
        } catch (error) {
          console.error('Error uploading document:', error);
          throw error;
        }
      };
      \`\`\``,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create session document with file upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload. Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, WebP. Maximum size: 50MB.',
        },
        type: {
          type: 'string',
          description:
            'Type of the session document (e.g., "Identity Card", "Passport")',
          example: 'Identity Card',
        },
        id_session: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the training session',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        categories: {
          type: 'string',
          enum: ['before', 'during', 'after'],
          description: 'Category of the document',
          example: 'before',
        },
      },
      required: ['document', 'type', 'id_session', 'categories'],
    },
    examples: {
      pdfDocument: {
        summary: 'Upload PDF document',
        description: 'Example of uploading a PDF document for a session',
        value: {
          document: '[Binary file data - PDF document]',
          type: 'Identity Card',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
        },
      },
      imageDocument: {
        summary: 'Upload image document',
        description: 'Example of uploading an image document for a session',
        value: {
          document: '[Binary file data - JPEG/PNG image]',
          type: 'Passport',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session document created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Session document created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
          status: 'pending',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `Bad Request - Validation errors or business logic violations.

**Possible 400 Error Scenarios:**

1. **Validation Errors:**
   - Missing required fields (document file, type, id_session, categories)
   - Missing or invalid file upload
   - Invalid file type (must be PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, or WebP)
   - File size exceeds 50MB limit
   - Invalid UUID format for id_session
   - Invalid enum value for categories (must be 'before', 'during', or 'after')

2. **Business Logic Errors:**
   - Student not found (user from token doesn't exist in database)
   - Training session not found (provided id_session doesn't exist)
   - Duplicate document type (a document of the same type already exists for this student and session)

**Note:** Check the error message in the response to identify the specific validation issue.`,
    schema: {
      examples: {
        missingFields: {
          summary: 'Missing required fields',
          description:
            'This error occurs when required fields are missing or empty',
          value: {
            status: 400,
            message: [
              'type should not be empty',
              'id_session must be a UUID',
              'categories must be one of the following values: before, during, after',
            ],
          },
        },
        invalidUUID: {
          summary: 'Invalid UUID format',
          description: 'The id_session must be a valid UUID format',
          value: {
            status: 400,
            message: 'id_session must be a UUID',
          },
        },
        invalidEnum: {
          summary: 'Invalid categories value',
          description:
            'The categories field must be exactly one of: before, during, after',
          value: {
            status: 400,
            message:
              'categories must be one of the following values: before, during, after',
          },
        },
        noFile: {
          summary: 'No file uploaded',
          description: 'The document file is required',
          value: {
            status: 400,
            data: 'Document file is required',
          },
        },
        invalidFileType: {
          summary: 'Invalid file type',
          description:
            'The uploaded file type is not in the allowed list of file types',
          value: {
            status: 400,
            data: 'File type application/zip is not allowed. Allowed types: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, WebP',
          },
        },
        fileTooLarge: {
          summary: 'File too large',
          description: 'The uploaded file exceeds the 50MB size limit',
          value: {
            status: 400,
            data: 'File size exceeds 50MB limit',
          },
        },
        uploadFailed: {
          summary: 'Upload failed',
          description: 'Failed to upload the file to Cloudinary storage',
          value: {
            status: 500,
            data: 'Failed to upload document to cloud storage',
          },
        },
        studentNotFound: {
          summary: 'Student not found',
          description:
            'The student ID from the JWT token was not found in the database',
          value: {
            status: 400,
            message: 'Student not found',
          },
        },
        sessionNotFound: {
          summary: 'Training session not found',
          description: 'The provided id_session does not exist in the database',
          value: {
            status: 400,
            message: 'Training session not found',
          },
        },
        duplicateType: {
          summary: 'Duplicate document type',
          description:
            'A document of this type already exists for this student and session. Each student can only have one document of each type per session.',
          value: {
            status: 400,
            message:
              'A document of type "Identity Card" already exists for this session',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createSessionDocumentDto: CreateSessionDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('Creating session document for user:', user.id_user);
      // Validate that a file was uploaded
      if (!file) {
        return {
          status: 400,
          data: 'Document file is required',
        };
      }

      // Validate file type
      const allowedMimeTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          status: 400,
          data: `File type ${file.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, WebP`,
        };
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return {
          status: 400,
          data: 'File size exceeds 50MB limit',
        };
      }

      // Upload file to Cloudinary
      const uploadResult = await this.googleDriveService.uploadBufferFile(file);
      if (!uploadResult) {
        return {
          status: 500,
          data: 'Failed to upload document to cloud storage',
        };
      }

      // Create session document with uploaded file info
      const documentData = {
        ...createSessionDocumentDto,
        piece_jointe: uploadResult.link,
      };

      return this.sessionDocumentService.create(documentData, user);
    } catch (error) {
      console.error('Error creating session document:', error);
      return {
        status: 500,
        data: 'Error creating session document',
      };
    }
  }

  @Get('getall')
  @ApiOperation({ summary: 'Get all session documents' })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe:
              'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
            status: 'pending',
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440000',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.sessionDocumentService.findAll();
  }

  @Get('secretary/getall')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Get all session documents (Secretary only)',
    description: `Get all session documents in the system. Secretaries can view all documents submitted by students.
    
**Optional Filters:**
- **status**: Filter by document status (pending, rejected, validated)
- **sessionId**: Filter by training session ID (UUID)

**Examples:**
- GET /api/sessiondocument/secretary/getall - Get all documents
- GET /api/sessiondocument/secretary/getall?status=pending - Get only pending documents
- GET /api/sessiondocument/secretary/getall?status=validated - Get only validated documents
- GET /api/sessiondocument/secretary/getall?sessionId={uuid} - Get documents for a specific session
- GET /api/sessiondocument/secretary/getall?status=pending&sessionId={uuid} - Combine both filters

**Response includes:**
- Document details (type, status, piece_jointe, comment, categories)
- Student information (id, firstName, lastName, email)
- Training session information (id, title)`,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'rejected', 'validated'],
    description:
      'Optional status filter. If not provided, returns all documents regardless of status.',
    example: 'pending',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    type: String,
    format: 'uuid',
    description:
      'Optional training session ID filter. If not provided, returns documents from all sessions.',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      examples: {
        allDocuments: {
          summary: 'All documents (no category filter)',
          description:
            'Returns all documents when no category parameter is provided',
          value: {
            status: 200,
            message: 'Session documents retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                type: 'Identity Card',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'before',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
                status: 'pending',
                comment: null,
                student: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                type: 'Passport',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'during',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/passport.pdf',
                status: 'validated',
                comment: 'Document verified successfully.',
                student: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T11:00:00.000Z',
                updatedAt: '2025-01-15T11:00:00.000Z',
              },
            ],
          },
        },
        filteredByStatus: {
          summary: 'Filtered by status',
          description: 'Returns only documents matching the specified status',
          value: {
            status: 200,
            message: 'Session documents retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                type: 'Identity Card',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'before',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
                status: 'pending',
                comment: null,
                student: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
            ],
          },
        },
        filteredBySession: {
          summary: 'Filtered by session ID',
          description:
            'Returns only documents for the specified training session',
          value: {
            status: 200,
            message: 'Session documents retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                type: 'Identity Card',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'before',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
                status: 'pending',
                comment: null,
                student: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async findAllForSecretary(
    @Query('status') status?: 'pending' | 'rejected' | 'validated',
    @Query('sessionId') sessionId?: string,
  ) {
    return this.sessionDocumentService.findAllForSecretary(status, sessionId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get session documents by student ID' })
  @ApiParam({
    name: 'studentId',
    description: 'Student UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe:
              'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
            status: 'pending',
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              title: 'Advanced React Development',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findByStudentId(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.sessionDocumentService.findByStudentId(studentId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get session documents by training session ID' })
  @ApiParam({
    name: 'sessionId',
    description: 'Training session UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session documents retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            type: 'Identity Card',
            id_student: '550e8400-e29b-41d4-a716-446655440000',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            categories: 'before',
            piece_jointe:
              'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
            status: 'pending',
            student: {
              uuid: '550e8400-e29b-41d4-a716-446655440000',
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  async findBySessionId(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.sessionDocumentService.findBySessionId(sessionId);
  }

  @Get('student/session/:sessionId')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiOperation({
    summary: 'Get student session documents by training session ID',
    description: `Get all session documents for the authenticated student in a specific training session.
    
**Optional Filter:**
- If no category parameter is provided, returns all documents for the session
- If category parameter is provided ('before', 'during', or 'after'), filters documents by that category

**Examples:**
- GET /api/sessiondocument/student/session/{sessionId} - Get all documents
- GET /api/sessiondocument/student/session/{sessionId}?category=before - Get only 'before' documents
- GET /api/sessiondocument/student/session/{sessionId}?category=during - Get only 'during' documents
- GET /api/sessiondocument/student/session/{sessionId}?category=after - Get only 'after' documents`,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Training session UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['before', 'during', 'after'],
    description:
      'Optional category filter. If not provided, returns all documents.',
    example: 'before',
  })
  @ApiResponse({
    status: 200,
    description: 'Session documents retrieved successfully',
    schema: {
      examples: {
        allDocuments: {
          summary: 'All documents (no category filter)',
          description:
            'Returns all documents when no category parameter is provided',
          value: {
            status: 200,
            message: 'Session documents retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                type: 'Identity Card',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'before',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
                status: 'pending',
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440003',
                type: 'Passport',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'during',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/passport.pdf',
                status: 'validated',
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T11:00:00.000Z',
                updatedAt: '2025-01-15T11:00:00.000Z',
              },
            ],
          },
        },
        filteredDocuments: {
          summary: 'Filtered by category',
          description: 'Returns only documents matching the specified category',
          value: {
            status: 200,
            message: 'Session documents retrieved successfully',
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                type: 'Identity Card',
                id_student: '550e8400-e29b-41d4-a716-446655440000',
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                categories: 'before',
                piece_jointe:
                  'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
                status: 'pending',
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'Advanced React Development',
                },
                createdAt: '2025-01-15T10:30:00.000Z',
                updatedAt: '2025-01-15T10:30:00.000Z',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async findStudentDocumentsBySessionId(
    @User() user: IJwtSignin,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Query('category') category?: 'before' | 'during' | 'after',
  ) {
    return this.sessionDocumentService.findByStudentAndSessionId(
      user.id_user,
      sessionId,
      category,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Session document retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
          status: 'pending',
          student: {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Advanced React Development',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionDocumentService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiBody({
    type: UpdateSessionDocumentDto,
    examples: {
      updateStatus: {
        summary: 'Update document status',
        value: {
          status: 'validated',
        },
      },
      updateAll: {
        summary: 'Update all fields',
        value: {
          type: 'Passport',
          categories: 'during',
          piece_jointe:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/passport.pdf',
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session document updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Passport',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'during',
          piece_jointe:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/passport.pdf',
          status: 'validated',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-16T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Training session not found, or document type already exists for this session',
    schema: {
      examples: {
        sessionNotFound: {
          value: {
            status: 400,
            message: 'Training session not found',
          },
        },
        duplicateType: {
          value: {
            status: 400,
            message:
              'A document of type "Passport" already exists for this session',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async update(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSessionDocumentDto: UpdateSessionDocumentDto,
  ) {
    return this.sessionDocumentService.update(
      user,
      id,
      updateSessionDocumentDto,
    );
  }

  @Patch('secretary/update/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Update session document status and comment (Secretary only)',
    description: `Secretaries can update the status and/or add comments to session documents.
    
**Allowed Updates:**
- **status**: Update the document status (pending, rejected, validated)
- **comment**: Add or update a comment/note about the document

**Use Cases:**
- Validate a document: Set status to 'validated' and optionally add a comment
- Reject a document: Set status to 'rejected' and add a comment explaining why
- Add notes: Update comment without changing status
- Reset status: Change status back to 'pending' if needed

**Note:** This endpoint only allows updating status and comment fields. Other fields cannot be modified by secretaries.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiBody({
    type: UpdateSessionDocumentSecretaryDto,
    examples: {
      validateDocument: {
        summary: 'Validate a document',
        description: 'Approve a document and add a comment',
        value: {
          status: 'validated',
          comment:
            'Document verified successfully. All information is correct and matches the requirements.',
        },
      },
      rejectDocument: {
        summary: 'Reject a document',
        description: 'Reject a document with explanation',
        value: {
          status: 'rejected',
          comment:
            'Document is unclear. Please resubmit with a clearer scan. The image quality is too low to verify the information.',
        },
      },
      addCommentOnly: {
        summary: 'Add comment without changing status',
        description: 'Add a note without changing the current status',
        value: {
          comment: 'Document received. Review in progress.',
        },
      },
      updateStatusOnly: {
        summary: 'Update status only',
        description: 'Change status without adding a comment',
        value: {
          status: 'validated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session document updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'Identity Card',
          id_student: '550e8400-e29b-41d4-a716-446655440000',
          id_session: '550e8400-e29b-41d4-a716-446655440001',
          categories: 'before',
          piece_jointe:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/id-card.pdf',
          status: 'validated',
          comment:
            'Document verified successfully. All information is correct.',
          student: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          trainingSession: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Advanced React Development',
          },
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-16T14:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status value',
    schema: {
      example: {
        status: 400,
        message:
          'status must be one of the following values: pending, rejected, validated',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async updateBySecretary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSecretaryDto: UpdateSessionDocumentSecretaryDto,
  ) {
    return this.sessionDocumentService.updateBySecretary(
      id,
      updateSecretaryDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete session document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Session document UUID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiResponse({
    status: 200,
    description: 'Session document deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Session document deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Session document not found',
    schema: {
      example: {
        status: 404,
        message: 'Session document not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        status: 401,
        message: 'Unauthorized',
      },
    },
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionDocumentService.remove(id);
  }
}
