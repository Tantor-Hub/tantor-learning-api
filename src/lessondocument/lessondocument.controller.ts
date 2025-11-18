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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessondocumentService } from './lessondocument.service';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { GoogleDriveService } from 'src/services/service.googledrive';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';

@ApiTags('lessondocument')
@ApiBearerAuth()
@Controller('lessondocument')
export class LessondocumentController {
  constructor(
    private readonly lessondocumentService: LessondocumentService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 50_000_000 } }),
  )
  @ApiOperation({
    summary: 'Create a new lesson document with file upload',
    description: `
      Upload a document file (PDF, DOC, DOCX, images, etc.) and associate it with a lesson. 
      The file will be stored in Cloudinary and the secure URL will be saved as piece_jointe.
      
      **Authorization:**
      - Only instructors can create lesson documents
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      - Required fields: document (file), id_lesson (UUID)
      - Optional fields: type (will be auto-detected if not provided), title, description, ispublish (defaults to false)
      
      **Supported File Types:**
      - Documents: PDF, DOC, DOCX, TXT
      - Images: JPEG, PNG, GIF
      - Presentations: PPT, PPTX
      - Spreadsheets: XLS, XLSX
      - Maximum file size: 50MB
      
      **Example cURL:**
      \`\`\`bash
      curl -X POST "http://localhost:3000/lessondocument/create" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "document=@/path/to/your/file.pdf" \\
        -F "id_lesson=550e8400-e29b-41d4-a716-446655440000" \\
        -F "title=Introduction to Programming Concepts" \\
        -F "description=This document covers the fundamental concepts of programming including variables, loops, and functions." \\
        -F "type=PDF" \\
        -F "ispublish=true"
      \`\`\`
      
      **Example JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('document', fileInput.files[0]);
      formData.append('id_lesson', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'Introduction to Programming Concepts');
      formData.append('description', 'This document covers the fundamental concepts of programming including variables, loops, and functions.');
      formData.append('type', 'PDF'); // Optional
      formData.append('ispublish', 'true'); // Optional, defaults to false
      
      const response = await fetch('/lessondocument/create', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: formData
      });
      
      const result = await response.json();
      \`\`\`
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create lesson document with file upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload. Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX. Maximum size: 50MB.',
        },
        id_lesson: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the lesson',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        type: {
          type: 'string',
          description:
            'Type of the document (optional - will be auto-detected)',
          example: 'PDF',
        },
        title: {
          type: 'string',
          description: 'Title of the lesson document',
          example: 'Introduction to Programming Concepts',
        },
        description: {
          type: 'string',
          description: 'Description of the lesson document content',
          example:
            'This document covers the fundamental concepts of programming including variables, loops, and functions.',
        },
        ispublish: {
          type: 'boolean',
          description:
            'Whether the lesson document is published and visible to students',
          example: false,
        },
      },
      required: ['document', 'id_lesson', 'title', 'description'],
    },
    examples: {
      pdfDocument: {
        summary: 'Upload PDF document',
        description: 'Example of uploading a PDF document to a lesson',
        value: {
          document: '[Binary file data - PDF document]',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          type: 'PDF',
          title: 'Introduction to Programming Concepts',
          description:
            'This document covers the fundamental concepts of programming including variables, loops, and functions.',
          ispublish: true,
        },
      },
      wordDocument: {
        summary: 'Upload Word document',
        description: 'Example of uploading a Word document to a lesson',
        value: {
          document: '[Binary file data - DOCX document]',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          type: 'DOC',
          title: 'Advanced Programming Techniques',
          description:
            'This document covers advanced programming concepts and best practices.',
          ispublish: false,
        },
      },
      imageDocument: {
        summary: 'Upload image document',
        description: 'Example of uploading an image to a lesson',
        value: {
          document: '[Binary file data - JPEG/PNG image]',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          type: 'IMAGE',
          title: 'Programming Flowchart',
          description:
            'Visual representation of programming logic and flow control.',
          ispublish: true,
        },
      },
      autoDetectType: {
        summary: 'Auto-detect file type',
        description:
          'Example without specifying type - will be auto-detected from file',
        value: {
          document: '[Binary file data - any supported format]',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          title: 'General Learning Material',
          description: 'Educational content for the lesson.',
          ispublish: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson document created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Lesson document created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          file_name: 'lesson-notes.pdf',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          type: 'PDF',
          title: 'Introduction to Programming Concepts',
          description:
            'This document covers the fundamental concepts of programming including variables, loops, and functions.',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or file',
    schema: {
      examples: {
        noFile: {
          summary: 'No file uploaded',
          value: {
            status: 400,
            data: 'Document file is required',
          },
        },
        invalidFileType: {
          summary: 'Invalid file type',
          value: {
            status: 400,
            data: 'File type application/zip is not allowed. Allowed types: PDF, DOC, DOCX, TXT, images, PowerPoint, Excel',
          },
        },
        fileTooLarge: {
          summary: 'File too large',
          value: {
            status: 400,
            data: 'File size exceeds 50MB limit',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Instructor access required',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les instructeurs peuvent accéder à cette ressource',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      examples: {
        uploadError: {
          summary: 'Upload failed',
          value: {
            status: 500,
            data: 'Failed to upload document to cloud storage',
          },
        },
        generalError: {
          summary: 'General error',
          value: {
            status: 500,
            data: 'Internal server error during document upload',
          },
        },
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createLessondocumentDto: CreateLessondocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('Creating lesson document for user:', user.id_user);
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
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        // Videos
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/x-flv',
        'video/webm',
        'video/x-matroska',
        'video/3gpp',
        'video/x-m4v',
        'video/mpeg',
        'video/ogg',
        'video/x-ms-asf',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/flac',
        'audio/aac',
        'audio/ogg',
        'audio/x-ms-wma',
        'audio/mp4',
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
        'application/x-bzip2',
        // Code files
        'text/javascript',
        'text/typescript',
        'text/html',
        'text/css',
        'application/json',
        'text/xml',
        'text/x-python',
        'text/x-java-source',
        'text/x-c',
        'text/x-c++',
        'application/x-php',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          status: 400,
          data: `File type ${file.mimetype} is not allowed. Allowed types: Documents (PDF, DOC, DOCX, TXT, PPT, XLS), Images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF), Videos (MP4, AVI, MOV, WMV, FLV, WebM, MKV, 3GP, M4V, MPG, OGV), Audio (MP3, WAV, FLAC, AAC, OGG, WMA, M4A), Archives (ZIP, RAR, 7Z, TAR, GZ, BZ2), Code files (JS, TS, HTML, CSS, JSON, XML, PY, JAVA, CPP, PHP)`,
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

      // Auto-detect file type from mimetype if not provided
      let fileType = createLessondocumentDto.type;
      if (!fileType) {
        const mimeType = file.mimetype;
        if (mimeType.includes('pdf')) fileType = 'PDF';
        else if (mimeType.includes('word') || mimeType.includes('document'))
          fileType = 'DOC';
        else if (mimeType.includes('text')) fileType = 'TXT';
        else if (mimeType.includes('image')) fileType = 'IMAGE';
        else if (mimeType.includes('video')) fileType = 'VIDEO';
        else if (mimeType.includes('audio')) fileType = 'AUDIO';
        else if (
          mimeType.includes('powerpoint') ||
          mimeType.includes('presentation')
        )
          fileType = 'PPT';
        else if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
          fileType = 'XLS';
        else if (
          mimeType.includes('zip') ||
          mimeType.includes('rar') ||
          mimeType.includes('7z')
        )
          fileType = 'ARCHIVE';
        else if (
          mimeType.includes('javascript') ||
          mimeType.includes('typescript') ||
          mimeType.includes('html') ||
          mimeType.includes('css') ||
          mimeType.includes('json') ||
          mimeType.includes('xml') ||
          mimeType.includes('python') ||
          mimeType.includes('java') ||
          mimeType.includes('c') ||
          mimeType.includes('php')
        )
          fileType = 'CODE';
        else fileType = 'OTHER';
      }

      // Create lesson document with uploaded file info
      const documentData = {
        file_name: file.originalname,
        piece_jointe: uploadResult.link,
        type: fileType,
        title: createLessondocumentDto.title,
        description: createLessondocumentDto.description,
        id_lesson: createLessondocumentDto.id_lesson,
        ispublish: createLessondocumentDto.ispublish ?? false,
      };

      return this.lessondocumentService.create(user, documentData);
    } catch (error) {
      console.error('Error in lesson document creation:', error);
      return {
        status: 500,
        data: 'Internal server error during document upload',
      };
    }
  }

  @Get('getall')
  @ApiOperation({ summary: 'Get all lesson documents' })
  @ApiResponse({
    status: 200,
    description: 'Lesson documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson documents retrieved successfully',
        data: {
          lessondocuments: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              file_name: 'lesson-notes.pdf',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              type: 'PDF',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
          ],
          total: 1,
        },
      },
    },
  })
  findAll() {
    console.log('Fetching all lesson documents from controller');
    return this.lessondocumentService.findAll();
  }

  @Get('debug/user-role')
  @ApiOperation({ summary: 'Debug endpoint to check user role' })
  debugUserRole(@User() user: any) {
    return {
      status: 200,
      data: {
        user_id: user?.id_user || user?.uuid_user,
        user_role: user?.role,
        roles_user: user?.roles_user,
        level_indicator: user?.level_indicator,
        message: 'User role debug information',
      },
    };
  }

  @Get('debug/test-db')
  @ApiOperation({ summary: 'Debug endpoint to test database connection' })
  async testDatabase() {
    try {
      const result = await this.lessondocumentService.findAll();
      return {
        status: 200,
        data: {
          message: 'Database connection successful',
          result: result,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          message: 'Database connection failed',
          error: error.message,
        },
      };
    }
  }

  @Get('debug/test-simple')
  @ApiOperation({ summary: 'Debug endpoint to test simple query' })
  async testSimpleQuery() {
    try {
      // Test simple query without associations
      const result =
        await this.lessondocumentService.lessondocumentModel.findAll({
          attributes: ['id', 'file_name', 'piece_jointe', 'type'],
          limit: 5,
        });
      return {
        status: 200,
        data: {
          message: 'Simple query successful',
          count: result.length,
          result: result,
        },
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          message: 'Simple query failed',
          error: error.message,
        },
      };
    }
  }

  @Get('lesson/:lessonId')
  @ApiOperation({
    summary: 'Get lesson documents by lesson ID',
    description:
      'Retrieve all documents associated with a specific lesson (instructor only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson documents retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson documents retrieved successfully',
        data: {
          lessondocuments: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              file_name: 'lesson-notes.pdf',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              type: 'PDF',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              file_name: 'lesson-slides.pptx',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/def456ghi789',
              type: 'PPT',
              title: 'Programming Presentation Slides',
              description:
                'PowerPoint presentation covering programming fundamentals and examples.',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T11:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
          ],
          total: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Instructor access required',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les instructeurs peuvent accéder à cette ressource',
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
          message: 'Internal server error while fetching lesson documents',
          error: 'Error message',
        },
      },
    },
  })
  findByLessonId(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    console.log('Fetching lesson documents by lesson ID:', lessonId);
    return this.lessondocumentService.findByLessonId(lessonId);
  }

  @Get('student/lesson/:lessonId')
  @UseGuards(JwtAuthGuardAsStudentInSession)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get lesson documents by lesson ID (Student access)',
    description:
      'Retrieves all documents for a specific lesson. Students can access documents related to lessons they are enrolled in.',
  })
  @ApiParam({
    name: 'lessonId',
    description: 'Lesson UUID',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Lesson documents retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            lessondocuments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '550e8400-e29b-41d4-a716-446655440001',
                  },
                  file_name: {
                    type: 'string',
                    example: 'lesson-notes.pdf',
                  },
                  piece_jointe: {
                    type: 'string',
                    example:
                      'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
                  },
                  type: {
                    type: 'string',
                    example: 'PDF',
                  },
                  title: {
                    type: 'string',
                    example: 'Introduction to Programming Concepts',
                  },
                  description: {
                    type: 'string',
                    example:
                      'This document covers the fundamental concepts of programming including variables, loops, and functions.',
                  },
                  ispublish: {
                    type: 'boolean',
                    example: false,
                  },
                  download_url: {
                    type: 'string',
                    example:
                      'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
                  },
                  creator: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: '550e8400-e29b-41d4-a716-446655440002',
                      },
                      firstName: {
                        type: 'string',
                        example: 'John',
                      },
                      lastName: {
                        type: 'string',
                        example: 'Doe',
                      },
                      email: {
                        type: 'string',
                        example: 'john.doe@example.com',
                      },
                    },
                  },
                },
              },
            },
            total: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson not found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les étudiants peuvent accéder à cette ressource',
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
          message: 'Internal server error while fetching lesson documents',
          error: 'Error message',
        },
      },
    },
  })
  async findByLessonIdForStudent(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    console.log(
      'Fetching lesson documents by lesson ID for student:',
      lessonId,
    );
    return this.lessondocumentService.findByLessonIdForStudent(lessonId);
  }

  @Get('instructor/my-documents')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiOperation({
    summary: 'Get lesson documents created by current instructor',
    description:
      'Retrieve all lesson documents created by the currently authenticated instructor',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lesson documents created by instructor retrieved successfully',
    schema: {
      example: {
        status: 200,
        message:
          'Lesson documents created by instructor retrieved successfully',
        data: {
          lessondocuments: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              file_name: 'lesson-notes.pdf',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              type: 'PDF',
              title: 'Introduction to Programming Concepts',
              description:
                'This document covers the fundamental concepts of programming including variables, loops, and functions.',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              download_url:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              file_name: 'lesson-slides.pptx',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/def456ghi789',
              type: 'PPT',
              title: 'Programming Presentation Slides',
              description:
                'PowerPoint presentation covering programming fundamentals and examples.',
              id_lesson: '550e8400-e29b-41d4-a716-446655440000',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T11:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
              download_url:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/def456ghi789',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              lesson: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Introduction to Programming',
                description: 'Basic programming concepts',
              },
            },
          ],
          total: 2,
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Instructor access required',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les instructeurs peuvent accéder à cette ressource',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Creator not found',
    schema: {
      example: {
        status: 404,
        data: 'Creator not found',
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
            'Internal server error while fetching lesson documents by creator',
          error: 'Error message',
        },
      },
    },
  })
  findByCreator(@User() user: IJwtSignin) {
    console.log(
      'Fetching lesson documents created by instructor:',
      user.id_user,
    );
    return this.lessondocumentService.findByCreator(user.id_user);
  }

  @Get('debug/urls')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Debug lesson document URLs',
    description: 'Get raw lesson document data to debug URL issues',
  })
  @ApiResponse({
    status: 200,
    description: 'Raw lesson document data retrieved successfully',
  })
  async debugUrls() {
    return this.lessondocumentService.debugUrls();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson document retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          file_name: 'lesson-notes.pdf',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          type: 'PDF',
          title: 'Introduction to Programming Concepts',
          description:
            'This document covers the fundamental concepts of programming including variables, loops, and functions.',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
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
          message: 'Internal server error while fetching lesson document',
          error: 'Error message',
        },
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    console.log('Fetching lesson document by ID:', id);
    return this.lessondocumentService.findOne(id);
  }

  @Patch('instructor/update/:id')
  @UseGuards(JwtAuthGuardAsInstructor)
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({
    summary: 'Update lesson document (Instructor only)',
    description: `
      Update a lesson document with file upload. **Instructor access required.**
      Instructors can update the title, description, file, and publish status of lesson documents.
      
      **Features:**
      - Upload a new document file (optional)
      - Update document title
      - Update document description
      - Update document publish status (ispublish)
      - Update document metadata (type)
      - Automatic file type detection
      - Cloudinary integration for file storage
      
      **File Upload:**
      - Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX
      - Maximum file size: 50MB
      - Files are automatically organized by type in Cloudinary
      
      **Example cURL:**
      \`\`\`bash
      curl -X PATCH "http://localhost:3000/lessondocument/instructor/update/document-id" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "document=@/path/to/your/updated-file.pdf" \\
        -F "id_lesson=550e8400-e29b-41d4-a716-446655440000" \\
        -F "title=Updated Programming Concepts" \\
        -F "description=Updated document covering advanced programming concepts and examples." \\
        -F "type=PDF" \\
        -F "ispublish=true"
      \`\`\`
      
      **Example JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('document', fileInput.files[0]); // Optional - only if updating file
      formData.append('id_lesson', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'Updated Programming Concepts');
      formData.append('description', 'Updated document covering advanced programming concepts and examples.');
      formData.append('type', 'PDF'); // Optional
      formData.append('ispublish', 'true'); // Optional
      
      const response = await fetch('/lessondocument/instructor/update/document-id', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: formData
      });
      
      const result = await response.json();
      \`\`\`
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update lesson document - Instructors can update title, description, and file',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'New document file to upload (optional). Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX. Maximum size: 50MB.',
        },
        id_lesson: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the lesson',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        title: {
          type: 'string',
          description: 'Updated title of the lesson document (optional)',
          example: 'Updated Programming Concepts',
        },
        description: {
          type: 'string',
          description: 'Updated description of the lesson document content (optional)',
          example:
            'Updated document covering advanced programming concepts and examples.',
        },
        type: {
          type: 'string',
          description:
            'Updated type of the document (optional - will be auto-detected from file if provided)',
          example: 'PDF',
        },
        ispublish: {
          type: 'boolean',
          description:
            'Whether the lesson document is published and visible to students',
          example: false,
        },
      },
      required: [],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson document updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          file_name: 'updated-lesson-notes.pdf',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/updated-abc123def456',
          type: 'PDF',
          title: 'Updated Programming Concepts',
          description:
            'Updated document covering advanced programming concepts and examples.',
          id_lesson: '550e8400-e29b-41d4-a716-446655440000',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:30:00.000Z',
          creator: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
          lesson: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data provided',
    schema: {
      example: {
        status: 400,
        data: 'Invalid lesson document data provided',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token, or user is not an instructor',
    schema: {
      example: {
        status: 401,
        data: 'Seuls les instructeurs peuvent accéder à cette ressource',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the creator of the document',
    schema: {
      example: {
        status: 403,
        data: 'You can only modify lesson documents that you created',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
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
          message: 'Internal server error while updating lesson document',
          error: 'Error message',
        },
      },
    },
  })
  async update(
    @User() user: IJwtSignin,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateLessondocumentDto: UpdateLessondocumentDto,
  ) {
    try {
      console.log('Updating lesson document:', id, 'for user:', user.id_user);

      let uploadResult: any = null;
      let fileType = updateLessondocumentDto.type;

      // Handle file upload if provided
      if (file) {
        console.log('Uploading new file:', file.originalname);

        // Upload file to Cloudinary
        uploadResult = await this.googleDriveService.uploadBufferFile(file);

        if (!uploadResult) {
          return {
            status: 500,
            data: 'Failed to upload file to cloud storage',
          };
        }

        // Auto-detect file type if not provided
        if (!fileType) {
          const fileExtension = file.originalname
            .split('.')
            .pop()
            ?.toLowerCase();
          if (fileExtension && ['pdf'].includes(fileExtension))
            fileType = 'PDF';
          else if (fileExtension && ['doc', 'docx'].includes(fileExtension))
            fileType = 'DOCUMENT';
          else if (fileExtension && ['txt'].includes(fileExtension))
            fileType = 'TEXT';
          else if (
            fileExtension &&
            ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)
          )
            fileType = 'IMAGE';
          else if (
            fileExtension &&
            ['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension)
          )
            fileType = 'VIDEO';
          else if (
            fileExtension &&
            ['mp3', 'wav', 'aac'].includes(fileExtension)
          )
            fileType = 'AUDIO';
          else if (fileExtension && ['ppt', 'pptx'].includes(fileExtension))
            fileType = 'PRESENTATION';
          else if (fileExtension && ['xls', 'xlsx'].includes(fileExtension))
            fileType = 'SPREADSHEET';
          else if (
            fileExtension &&
            ['zip', 'rar', '7z'].includes(fileExtension)
          )
            fileType = 'ARCHIVE';
          else if (
            fileExtension &&
            ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(
              fileExtension,
            )
          )
            fileType = 'CODE';
          else fileType = 'OTHER';
        }
      }

      // Prepare update data
      const updateData: any = {
        ...updateLessondocumentDto,
      };

      // Add file-related data if file was uploaded
      if (file && uploadResult) {
        updateData.file_name = file.originalname;
        updateData.piece_jointe = uploadResult.link;
        updateData.type = fileType;
      }

      return this.lessondocumentService.update(user, id, updateData);
    } catch (error) {
      console.error('Error in lesson document update:', error);
      return {
        status: 500,
        data: 'Internal server error during document update',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete lesson document',
    description:
      'Delete a lesson document. Only the creator of the document can delete it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson document deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Lesson document deleted successfully',
        data: { id: '550e8400-e29b-41d4-a716-446655440001' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the creator can delete the document',
    schema: {
      example: {
        status: 403,
        data: 'You can only delete lesson documents that you created',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson document not found',
    schema: {
      example: {
        status: 404,
        data: 'Lesson document not found',
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
          message: 'Internal server error while deleting lesson document',
          error: 'Error message',
        },
      },
    },
  })
  remove(@User() user: IJwtSignin, @Param('id', ParseUUIDPipe) id: string) {
    return this.lessondocumentService.remove(user, id);
  }
}
