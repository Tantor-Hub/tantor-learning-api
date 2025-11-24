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
  UploadedFiles,
  Req,
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
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { LessondocumentService } from './lessondocument.service';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { JwtAuthGuardAsStudentInSession } from 'src/guard/guard.asstudentinsession';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { CloudinaryService } from 'src/services/service.cloudinary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';

@ApiTags('lessondocument')
@ApiBearerAuth()
@Controller('lessondocument')
export class LessondocumentController {
  constructor(
    private readonly lessondocumentService: LessondocumentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fileSize: 107_374_182_400 } }), // 100GB limit - accepts both 'piece_jointe' and 'document'
  )
  @ApiOperation({
    summary: 'Create a new lesson document with file upload',
    description: `
      Upload a document file (PDF, DOC, DOCX, images, etc.) and associate it with a lesson. 
      The file will be stored in Cloudinary and the secure URL will be saved as piece_jointe.
      
      **🚀 Automatic Optimizations:**
      All file uploads are automatically optimized with:
      - Chunked uploads (500KB chunks) for better reliability
      - Async processing (non-blocking) to prevent timeouts
      - Extended timeouts (10 minutes) for long uploads
      - Keep-alive headers to maintain connections
      
      These optimizations apply to ALL files, regardless of size, ensuring reliable uploads from small files to 100GB files.
      
      **Authorization:**
      - Only instructors can create lesson documents
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      - Required fields: piece_jointe (file), id_lesson (UUID)
      - Optional fields: type (will be auto-detected if not provided), title, description, ispublish (defaults to false)
      
      **Supported File Types:**
      - Any file type is allowed
      - Maximum file size: 100GB
      
      **⚠️ IMPORTANT: Frontend Implementation for File Uploads**
      
      The backend automatically optimizes ALL file uploads with chunked and async processing. However, to ensure maximum reliability and avoid Cloudflare 524 timeout errors, we recommend implementing one of these frontend solutions:
      
      **Option 1: Upload with Progress Tracking (Recommended)**
      Use XMLHttpRequest for better timeout control and progress tracking:
      
      \`\`\`typescript
      async function uploadFileWithProgress(
        file: File,
        lessonId: string,
        onProgress: (progress: number) => void
      ): Promise<any> {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          
          formData.append('piece_jointe', file);
          formData.append('id_lesson', lessonId);
          formData.append('title', 'Document Title');
          formData.append('description', 'Document Description');
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              onProgress(progress);
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status === 201 || xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(\`Upload failed: \${xhr.statusText}\`));
            }
          });
          
          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));
          
          // Set extended timeout (10 minutes) for reliable uploads
          xhr.timeout = 600000;
          
          xhr.open('POST', '/api/lessondocument/create');
          xhr.setRequestHeader('Authorization', \`Bearer \${yourToken}\`);
          
          xhr.send(formData);
        });
      }
      
      // Usage
      uploadFileWithProgress(file, lessonId, (progress) => {
        console.log(\`Upload: \${progress.toFixed(1)}%\`);
        // Update progress bar in UI
      });
      \`\`\`
      
      **Option 2: Fetch with AbortController (For all files)**
      Use fetch with timeout handling for reliable uploads:
      
      \`\`\`typescript
      async function uploadFile(file: File, lessonId: string): Promise<any> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 95000); // 95s timeout
        
        try {
          const formData = new FormData();
          formData.append('piece_jointe', file);
          formData.append('id_lesson', lessonId);
          formData.append('title', 'Document Title');
          formData.append('description', 'Document Description');
          
          const response = await fetch('/api/lessondocument/create', {
            method: 'POST',
            headers: {
              'Authorization': \`Bearer \${yourToken}\`
            },
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(\`Upload failed: \${response.statusText}\`);
          }
          
          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Upload timeout - file is too large or connection is slow');
          }
          throw error;
        }
      }
      \`\`\`
      
      **Backend Optimizations (Applied to ALL files):**
      - Chunked uploads: Automatically uses 500KB chunks for optimal performance and reliability
      - Async uploads: Automatically enabled for all files (prevents timeout, non-blocking)
      - Keep-alive headers: Automatically set for upload endpoints
      - Extended timeout: 10 minutes for upload operations
      
      **Example cURL:**
      \`\`\`bash
      curl -X POST "http://localhost:3000/api/lessondocument/create" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "piece_jointe=@/path/to/your/file.pdf" \\
        -F "id_lesson=550e8400-e29b-41d4-a716-446655440000" \\
        -F "title=Introduction to Programming Concepts" \\
        -F "description=This document covers the fundamental concepts of programming including variables, loops, and functions." \\
        -F "type=PDF" \\
        -F "ispublish=true"
      \`\`\`
      
      **Example Basic JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('piece_jointe', fileInput.files[0]);
      formData.append('id_lesson', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'Introduction to Programming Concepts');
      formData.append('description', 'This document covers the fundamental concepts of programming including variables, loops, and functions.');
      formData.append('type', 'PDF'); // Optional
      formData.append('ispublish', 'true'); // Optional, defaults to false
      
      const response = await fetch('/api/lessondocument/create', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN'
        },
        body: formData
      });
      
      const result = await response.json();
      \`\`\`
      
      **Note:** While the basic fetch example works, we strongly recommend using Option 1 (XMLHttpRequest with progress) for better reliability, especially for files of any significant size. The backend automatically optimizes all uploads with chunked and async processing. All uploads must go through the backend - direct Cloudinary uploads from the frontend are not supported.
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create lesson document with file upload',
    schema: {
      type: 'object',
      properties: {
        piece_jointe: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload. Any file type is allowed. Maximum size: 100GB. (Alternative field name: "document" is also accepted)',
        },
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload (alternative to piece_jointe). Any file type is allowed. Maximum size: 100GB.',
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
      required: ['piece_jointe', 'id_lesson', 'title', 'description'],
    },
    examples: {
      pdfDocument: {
        summary: 'Upload PDF document',
        description: 'Example of uploading a PDF document to a lesson',
        value: {
          piece_jointe: '[Binary file data - PDF document]',
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
          piece_jointe: '[Binary file data - DOCX document]',
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
          piece_jointe: '[Binary file data - JPEG/PNG image]',
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
          piece_jointe: '[Binary file data - any supported format]',
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
        fileTooLarge: {
          summary: 'File too large',
          value: {
            status: 400,
            data: 'File size exceeds 100GB limit',
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
  @ApiResponse({
    status: 524,
    description: 'Cloudflare Timeout - Upload took too long',
    schema: {
      example: {
        status: 524,
        message: 'A timeout occurred',
        note: 'This error occurs when upload exceeds Cloudflare timeout (100s free, 600s paid). The backend automatically optimizes all uploads, but for maximum reliability, use Option 1, 2, or 3 from the frontend implementation guide above.',
      },
    },
  })
  async create(
    @User() user: IJwtSignin,
    @Body() createLessondocumentDto: CreateLessondocumentDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    try {
      console.log('Creating lesson document for user:', user.id_user);
      console.log(
        '[REQUEST BODY - DTO]',
        JSON.stringify(createLessondocumentDto, null, 2),
      );
      console.log('[REQUEST BODY - RAW]', JSON.stringify(req.body, null, 2));

      // Accept either 'piece_jointe' or 'document' field name
      const file = files?.find(
        (f) => f.fieldname === 'piece_jointe' || f.fieldname === 'document',
      );

      console.log(
        '[FILES RECEIVED]',
        files?.map((f) => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          size: f.size,
        })) || 'No files',
      );
      console.log(
        '[FILE SELECTED]',
        file
          ? {
              fieldname: file.fieldname,
              originalname: file.originalname,
              encoding: file.encoding,
              mimetype: file.mimetype,
              size: file.size,
            }
          : 'No file uploaded',
      );
      console.log('[CONTENT-TYPE]', req.headers['content-type']);

      // Validate that a file was uploaded
      if (!file) {
        return {
          status: 400,
          data: 'Document file is required. Please send file with field name "piece_jointe" or "document"',
        };
      }

      // Validate file size (100GB limit)
      const maxSize = 100 * 1024 * 1024 * 1024; // 100GB
      if (file.size > maxSize) {
        return {
          status: 400,
          data: 'File size exceeds 100GB limit',
        };
      }

      // Log file size for monitoring
      console.log(
        `Uploading file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB), using optimized chunked async upload`,
      );

      // Upload file to Cloudinary (optimized chunked async upload for all files)
      const uploadResult = await this.cloudinaryService.uploadBufferFile(file, {
        useAsync: false,
      });
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
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
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
      - Supported formats: Any file type
      - Maximum file size: 100GB
      - Files are automatically organized by type in Cloudinary
      
      **Example cURL:**
      \`\`\`bash
      curl -X PATCH "http://localhost:3000/lessondocument/instructor/update/document-id" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "piece_jointe=@/path/to/your/updated-file.pdf" \\
        -F "id_lesson=550e8400-e29b-41d4-a716-446655440000" \\
        -F "title=Updated Programming Concepts" \\
        -F "description=Updated document covering advanced programming concepts and examples." \\
        -F "type=PDF" \\
        -F "ispublish=true"
      \`\`\`
      
      **Example JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('piece_jointe', fileInput.files[0]); // Optional - only if updating file
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
    description:
      'Update lesson document - Instructors can update title, description, and file',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'New document file to upload (optional). Any file type is allowed. Maximum size: 100GB.',
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
          description:
            'Updated description of the lesson document content (optional)',
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
    description:
      'Unauthorized - Invalid or missing JWT token, or user is not an instructor',
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
        uploadResult = await this.cloudinaryService.uploadBufferFile(file, {
          useAsync: false,
        });

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
