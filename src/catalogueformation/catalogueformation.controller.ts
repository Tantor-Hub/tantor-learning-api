import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogueFormationService } from './catalogueformation.service';
import { CreateCatalogueFormationDto } from './dto/create-catalogueformation.dto';
import { CreateStudentCatalogueDto } from './dto/create-student-catalogue.dto';
import { UpdateStudentCatalogueDto } from './dto/update-student-catalogue.dto';
import { CatalogueType } from 'src/interface/interface.catalogueformation';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { CloudinaryService } from 'src/services/service.cloudinary';
import {
  CatalogueFormationApiTags,
  CatalogueFormationCreateApiOperation,
  CatalogueFormationCreateApiResponse,
  CatalogueFormationFindAllApiOperation,
  CatalogueFormationFindAllApiResponse,
  CatalogueFormationFindOneApiOperation,
  CatalogueFormationFindOneApiResponse,
  CatalogueFormationUpdateApiOperation,
  CatalogueFormationUpdateApiResponse,
  CatalogueFormationDeleteApiOperation,
  CatalogueFormationDeleteApiResponse,
  CatalogueFormationUnauthorizedApiResponse,
  CatalogueFormationNotFoundApiResponse,
  CatalogueFormationForbiddenApiResponse,
  CatalogueFormationOnlyAdminUpdateApiResponse,
  CatalogueFormationOnlyAdminDeleteApiResponse,
  CreateCatalogueFormationDto as SwaggerCreateCatalogueFormationDto,
} from 'src/swagger/swagger.catalogueformation';

@ApiTags('Catalogue Formation')
@Controller('catalogueformation')
export class CatalogueFormationController {
  constructor(
    private readonly catalogueFormationService: CatalogueFormationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
  @ApiOperation({
    summary: 'Create a new catalogue formation with file upload (Admin only)',
    description: `
      Upload a document file and create a new catalogue formation entry. 
      The file will be stored in Cloudinary and the secure URL will be saved as piece_jointe.
      
      **Authorization:**
      - Only admins can create catalogue formations
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      - Required fields: type, title
      - Optional fields: document (file), description
      
      **🚀 Automatic Optimizations:**
      All file uploads are automatically optimized with:
      - Chunked uploads (500KB chunks) for better reliability
      - Async processing (non-blocking) to prevent timeouts
      - Extended timeouts (10 minutes) for long uploads
      - Keep-alive headers to maintain connections
      
      **Supported File Types:**
      - Any file type is allowed
      - Maximum file size: 100GB
      
      **Example cURL:**
      \`\`\`bash
      curl -X POST "http://localhost:3000/catalogueformation" \\
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
        -F "document=@/path/to/your/file.pdf" \\
        -F "type=admin" \\
        -F "title=Advanced JavaScript Training" \\
        -F "description=Comprehensive training on advanced JavaScript concepts"
      \`\`\`
      
      **Example JavaScript/TypeScript:**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('document', fileInput.files[0]); // Optional
      formData.append('type', 'admin');
      formData.append('title', 'Advanced JavaScript Training');
      formData.append('description', 'Comprehensive training on advanced JavaScript concepts');
      
      const response = await fetch('/catalogueformation', {
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
    description: 'Create catalogue formation with optional file upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload (optional). Any file type is allowed. Maximum size: 100GB. All uploads are automatically optimized with chunked and async processing.',
        },
        type: {
          type: 'string',
          enum: ['user', 'student', 'instructor', 'secretary', 'admin'],
          description: 'Type of the catalogue formation',
          example: 'admin',
        },
        title: {
          type: 'string',
          description: 'Title of the catalogue formation',
          example: 'Advanced JavaScript Training',
        },
        description: {
          type: 'string',
          description: 'Description of the catalogue formation',
          example: 'Comprehensive training on advanced JavaScript concepts',
        },
      },
      required: ['type', 'title'],
    },
    examples: {
      withDocument: {
        summary: 'Create catalogue formation with document',
        description:
          'Example of uploading a document file with catalogue formation',
        value: {
          document: '[Binary file data - PDF document]',
          type: 'admin',
          title: 'Advanced JavaScript Training',
          description: 'Comprehensive training on advanced JavaScript concepts',
        },
      },
      withoutDocument: {
        summary: 'Create catalogue formation without document',
        description:
          'Example of creating catalogue formation without file upload',
        value: {
          type: 'instructor',
          title: 'Basic Programming Course',
          description: 'Introduction to programming fundamentals',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Catalogue formation created successfully.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'admin',
        title: 'Advanced JavaScript Training',
        description: 'Comprehensive training on advanced JavaScript concepts',
        piece_jointe:
          'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
        createdBy: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-01-25T10:00:00.000Z',
        updatedAt: '2025-01-25T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or file',
    schema: {
      examples: {
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
      },
    },
  })
  async create(
    @Body() createDto: CreateCatalogueFormationDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      let pieceJointe: string | undefined = undefined;

      // Handle file upload if provided
      if (file) {
        console.log(
          'File uploaded:',
          file.originalname,
          'Type:',
          file.mimetype,
        );

        // Log file size for monitoring
        console.log(`Uploading file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB), using optimized chunked async upload`);

        // Validate file size (100GB limit)
        const maxSize = 100 * 1024 * 1024 * 1024; // 100GB
        if (file.size > maxSize) {
          return {
            status: 400,
            data: 'File size exceeds 100GB limit',
          };
        }

        // Upload file to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadBufferFile(
          file,
          { useAsync: false },
        );

        if (!uploadResult) {
          console.error('Upload failed: uploadResult is null');
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage',
          };
        }

        if (!uploadResult.link) {
          console.error(
            'Upload failed: uploadResult.link is missing',
            uploadResult,
          );
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage - no link returned',
          };
        }

        pieceJointe = uploadResult.link;
        console.log('File uploaded successfully, piece_jointe:', pieceJointe);
      } else {
        console.log('No file uploaded');
      }

      // Create catalogue formation with uploaded file info
      // If file was uploaded, use the uploaded link; otherwise preserve DTO value
      const catalogueData: CreateCatalogueFormationDto = {
        type: createDto.type,
        title: createDto.title,
      };

      // Only include description if it has a value
      if (createDto.description) {
        catalogueData.description = createDto.description;
      }

      // Only set piece_jointe if we have a value (from file upload or DTO)
      if (pieceJointe) {
        catalogueData.piece_jointe = pieceJointe;
      } else if (createDto.piece_jointe) {
        catalogueData.piece_jointe = createDto.piece_jointe;
      }
      // If neither exists, piece_jointe will remain undefined and Sequelize will handle it

      console.log('Creating catalogue formation with data:', {
        type: catalogueData.type,
        title: catalogueData.title,
        description: catalogueData.description,
        piece_jointe: catalogueData.piece_jointe || '(not set)',
      });

      const userId = req.user.id_user;
      return this.catalogueFormationService.create(catalogueData, userId);
    } catch (error) {
      console.error('Error in catalogue formation creation:', error);
      return {
        status: 500,
        data: 'Internal server error during catalogue formation creation',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all catalogue formations (Admin only)',
    description:
      'Retrieve all catalogue formations. This is the main endpoint for getting all catalogue formations. Only admins can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formations retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formations retrieved successfully',
        data: {
          catalogueformations: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              type: 'admin',
              title: 'Advanced JavaScript Training',
              description:
                'Comprehensive training on advanced JavaScript concepts',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            },
          ],
          total: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAll() {
    console.log('Fetching all catalogue formations from controller');
    return this.catalogueFormationService.findAll();
  }

  @Get('getall')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all catalogue formations (Admin only) - Alternative route',
    description:
      'Retrieve all catalogue formations. Alternative endpoint for getting all catalogue formations. Only admins can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formations retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formations retrieved successfully',
        data: {
          catalogueformations: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              type: 'admin',
              title: 'Advanced JavaScript Training',
              description:
                'Comprehensive training on advanced JavaScript concepts',
              piece_jointe:
                'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
              createdBy: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              creator: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            },
          ],
          total: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAllAlt() {
    console.log(
      'Fetching all catalogue formations from controller (getall route)',
    );
    return this.catalogueFormationService.findAll();
  }

  @Get('student')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalogue formation for students',
    description:
      'Retrieve the catalogue formation specific to students. Each role can only have one catalogue formation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Student catalogue formation retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formation for student retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'student',
          title: 'Student Training Program',
          description: 'Comprehensive training program for students',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
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
    status: 404,
    description: 'Catalogue formation for students not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findStudentCatalogue() {
    console.log('Fetching student catalogue formation');
    return this.catalogueFormationService.findOneByType('student');
  }

  @Get('secretary')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalogue formation for secretaries',
    description:
      'Retrieve the catalogue formation specific to secretaries. Each role can only have one catalogue formation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Secretary catalogue formation retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formation for secretary retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'secretary',
          title: 'Secretary Training Program',
          description: 'Comprehensive training program for secretaries',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
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
    status: 404,
    description: 'Catalogue formation for secretaries not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findSecretaryCatalogue() {
    console.log('Fetching secretary catalogue formation');
    return this.catalogueFormationService.findOneByType('secretary');
  }

  @Get('instructor')
  @UseGuards(JwtAuthGuardAsInstructor)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalogue formation for instructors',
    description:
      'Retrieve the catalogue formation specific to instructors. Each role can only have one catalogue formation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor catalogue formation retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formation for instructor retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'instructor',
          title: 'Instructor Training Program',
          description: 'Comprehensive training program for instructors',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
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
    status: 404,
    description: 'Catalogue formation for instructors not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Instructor access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findInstructorCatalogue() {
    console.log('Fetching instructor catalogue formation');
    return this.catalogueFormationService.findOneByType('instructor');
  }

  @Get('admin')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalogue formation for admins',
    description:
      'Retrieve the catalogue formation specific to admins. Each role can only have one catalogue formation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin catalogue formation retrieved successfully.',
    schema: {
      example: {
        status: 200,
        message: 'Catalogue formation for admin retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'admin',
          title: 'Admin Training Program',
          description: 'Comprehensive training program for admins',
          piece_jointe:
            'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          createdBy: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
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
    status: 404,
    description: 'Catalogue formation for admins not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAdminCatalogue() {
    console.log('Fetching admin catalogue formation');
    return this.catalogueFormationService.findOneByType('admin');
  }

  @Post('student')
  @UseGuards(JwtAuthGuardAsSecretary)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a student type catalogue formation (Secretary only)',
    description: `
      Create a new student type catalogue formation with an associated training ID.
      Only secretaries can create student catalogues.
      
      **Authorization:**
      - Only secretaries can create student catalogue formations
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      - Required fields: title, id_training
      - Optional fields: document (file), description
      
      **Supported File Types:**
      - Documents: PDF, DOC, DOCX, TXT
      - Images: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
      - Presentations: PPT, PPTX
      - Spreadsheets: XLS, XLSX
      - Maximum file size: 100MB
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create student catalogue formation with optional file upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload (optional). Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX. Maximum size: 100MB.',
        },
        title: {
          type: 'string',
          description: 'Title of the catalogue',
          example: 'Student Training Catalogue',
        },
        id_training: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the training associated with this catalogue',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        description: {
          type: 'string',
          description: 'Description of the catalogue',
          example: 'Comprehensive training program for students',
        },
      },
      required: ['title', 'id_training'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student catalogue formation created successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Student catalogue formation created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', example: 'student' },
            title: { type: 'string', example: 'Student Training Catalogue' },
            description: {
              type: 'string',
              example: 'Comprehensive training program for students',
            },
            id_training: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            piece_jointe: { type: 'string' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or missing required fields',
    schema: {
      examples: {
        invalidFileType: {
          summary: 'Invalid file type',
          value: {
            status: 400,
            data: 'File type application/zip is not allowed. Allowed types: Documents (PDF, DOC, DOCX, TXT, PPT, XLS), Images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)',
          },
        },
        fileTooLarge: {
          summary: 'File too large',
          value: {
            status: 400,
            data: 'File size exceeds 100MB limit',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A student catalogue already exists.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example:
            'Un catalogue de formation de type "student" existe déjà. Chaque type de catalogue ne peut exister qu\'une seule fois.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async createStudentCatalogue(
    @Body() createDto: CreateStudentCatalogueDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      let pieceJointe: string | undefined = undefined;

      // Handle file upload if provided
      if (file) {
        console.log(
          'File uploaded:',
          file.originalname,
          'Type:',
          file.mimetype,
          'Size:',
          file.size,
        );

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
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return {
            status: 400,
            data: `File type ${file.mimetype} is not allowed. Allowed types: Documents (PDF, DOC, DOCX, TXT, PPT, XLS), Images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)`,
          };
        }

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          return {
            status: 400,
            data: 'File size exceeds 100MB limit',
          };
        }

        // Upload file to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadBufferFile(
          file,
          { useAsync: false },
        );

        if (!uploadResult) {
          console.error('Upload failed: uploadResult is null');
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage',
          };
        }

        if (!uploadResult.link) {
          console.error(
            'Upload failed: uploadResult.link is missing',
            uploadResult,
          );
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage - no link returned',
          };
        }

        pieceJointe = uploadResult.link;
        console.log('File uploaded successfully, piece_jointe:', pieceJointe);
      } else {
        console.log('No file uploaded');
      }

      // Create catalogue formation with uploaded file info
      const catalogueData: CreateStudentCatalogueDto = {
        title: createDto.title,
        id_training: createDto.id_training,
      };

      // Only include description if it has a value
      if (createDto.description) {
        catalogueData.description = createDto.description;
      }

      // Use uploaded file link if available, otherwise use DTO value
      if (pieceJointe) {
        catalogueData.piece_jointe = pieceJointe;
      } else if (createDto.piece_jointe) {
        catalogueData.piece_jointe = createDto.piece_jointe;
      }

      console.log('Creating student catalogue formation with data:', {
        title: catalogueData.title,
        id_training: catalogueData.id_training,
        description: catalogueData.description,
        piece_jointe: catalogueData.piece_jointe || '(not set)',
      });

      const userId = req.user.id_user;
      const catalogue = await this.catalogueFormationService.createStudentCatalogue(
        catalogueData,
        userId,
      );
      return {
        status: 201,
        message: 'Student catalogue formation created successfully',
        data: catalogue,
      };
    } catch (error) {
      console.error('Error creating student catalogue formation:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      return {
        status: 500,
        data: 'Internal server error during student catalogue formation creation',
      };
    }
  }

  @Patch('student/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 107_374_182_400 } }), // 100GB limit
  )
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID of the catalogue formation to update',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiOperation({
    summary: 'Update student type catalogue formation (Secretary only)',
    description: `
      Update the existing student type catalogue formation by ID.
      Only secretaries can update student catalogues.
      
      **Authorization:**
      - Only secretaries can update student catalogue formations
      - Bearer token required
      
      **Request Format:**
      - Content-Type: multipart/form-data
      
      **URL Parameters:**
      - id (required): UUID of the catalogue formation to update
      
      **Request Body:**
      All fields are optional. Only provided fields will be updated.
      - document (optional): File to upload (up to 100MB). If provided, will update piece_jointe with the uploaded file URL.
      - title (optional): Title of the catalogue
      - id_training (optional): UUID of the training to associate with this catalogue
      - description (optional): Description of the catalogue
      - piece_jointe (optional): Cloudinary URL for an attached document (if no file is uploaded)
      
      **Supported File Types:**
      - Documents: PDF, DOC, DOCX, TXT
      - Images: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
      - Presentations: PPT, PPTX
      - Spreadsheets: XLS, XLSX
      - Maximum file size: 100MB
      
      **Note:** The catalogue must be of type "student" to be updated.
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update student catalogue formation with optional file upload',
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description:
            'Document file to upload (optional). Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX. Maximum size: 100MB. If provided, will update piece_jointe.',
        },
        title: {
          type: 'string',
          description: 'Title of the catalogue',
          example: 'Student Training Catalogue',
        },
        id_training: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the training associated with this catalogue',
          example: '550e8400-e29b-41d4-a716-446655440001',
        },
        description: {
          type: 'string',
          description: 'Description of the catalogue',
          example: 'Comprehensive training program for students',
        },
        piece_jointe: {
          type: 'string',
          description:
            'Cloudinary URL for an attached document (optional, only used if no file is uploaded)',
          example:
            'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Student catalogue formation updated successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student catalogue formation updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', example: 'student' },
            title: { type: 'string', example: 'Student Training Catalogue' },
            description: {
              type: 'string',
              example: 'Comprehensive training program for students',
            },
            id_training: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440002',
            },
            piece_jointe: { type: 'string' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
    schema: {
      examples: {
        invalidFileType: {
          summary: 'Invalid file type',
          value: {
            status: 400,
            data: 'File type application/zip is not allowed. Allowed types: Documents (PDF, DOC, DOCX, TXT, PPT, XLS), Images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)',
          },
        },
        fileTooLarge: {
          summary: 'File too large',
          value: {
            status: 400,
            data: 'File size exceeds 100MB limit',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Catalogue is not of type "student".',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: {
          type: 'string',
          example: 'Ce catalogue n\'est pas de type "student".',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Catalogue does not exist.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Catalogue de formation non trouvé.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async updateStudentCatalogue(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentCatalogueDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      let pieceJointe: string | undefined = undefined;

      // Handle file upload if provided
      if (file) {
        console.log(
          'File uploaded:',
          file.originalname,
          'Type:',
          file.mimetype,
          'Size:',
          file.size,
        );

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
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return {
            status: 400,
            data: `File type ${file.mimetype} is not allowed. Allowed types: Documents (PDF, DOC, DOCX, TXT, PPT, XLS), Images (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)`,
          };
        }

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
          return {
            status: 400,
            data: 'File size exceeds 100MB limit',
          };
        }

        // Upload file to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadBufferFile(
          file,
          { useAsync: false },
        );

        if (!uploadResult) {
          console.error('Upload failed: uploadResult is null');
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage',
          };
        }

        if (!uploadResult.link) {
          console.error(
            'Upload failed: uploadResult.link is missing',
            uploadResult,
          );
          return {
            status: 500,
            data: 'Failed to upload document to cloud storage - no link returned',
          };
        }

        pieceJointe = uploadResult.link;
        console.log('File uploaded successfully, piece_jointe:', pieceJointe);
      } else {
        console.log('No file uploaded');
      }

      // Prepare update data
      const updateData: UpdateStudentCatalogueDto = {};

      if (updateDto.title !== undefined) updateData.title = updateDto.title;
      if (updateDto.description !== undefined)
        updateData.description = updateDto.description;
      if (updateDto.id_training !== undefined)
        updateData.id_training = updateDto.id_training;

      // Use uploaded file link if available, otherwise use DTO value
      if (pieceJointe) {
        updateData.piece_jointe = pieceJointe;
      } else if (updateDto.piece_jointe !== undefined) {
        updateData.piece_jointe = updateDto.piece_jointe;
      }

      console.log('Updating student catalogue formation with data:', {
        id,
        ...updateData,
        piece_jointe: updateData.piece_jointe || '(not set)',
      });

      const catalogue = await this.catalogueFormationService.updateStudentCatalogue(
        id,
        updateData,
      );
      return {
        status: 200,
        message: 'Student catalogue formation updated successfully',
        data: catalogue,
      };
    } catch (error) {
      console.error('Error updating student catalogue formation:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      return {
        status: 500,
        data: 'Internal server error during student catalogue formation update',
      };
    }
  }

  @Get('secretary/all')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all student type catalogue formations (Secretary only)',
    description: `
      Retrieve all student type catalogue formations. Secretaries can see student catalogues.
      
      **Authorization:**
      - Only secretaries can access this endpoint
      - Bearer token required
      
      **Note:** This endpoint returns only catalogues of type "student".
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Student catalogue formations retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student catalogue formations retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              type: { type: 'string', example: 'student' },
              title: { type: 'string' },
              description: { type: 'string' },
              id_training: { type: 'string', format: 'uuid' },
              piece_jointe: { type: 'string' },
              createdBy: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              creator: {
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
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAllForSecretary() {
    const catalogues = await this.catalogueFormationService.findByType(
      CatalogueType.STUDENT,
    );
    return {
      status: 200,
      message: 'Student catalogue formations retrieved successfully',
      data: catalogues,
    };
  }

  @Get('training/:trainingId')
  @ApiOperation({
    summary: 'Get catalogue formations by training ID (Public)',
    description: `
      Retrieve all catalogue formations of type "Student" associated with a specific training ID.
      This endpoint is public and does not require authentication.
      Only returns catalogueformations with type "student".
      
      **Parameters:**
      - trainingId (path parameter): UUID of the training
    `,
  })
  @ApiParam({
    name: 'trainingId',
    description: 'UUID of the training',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formations found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Catalogue formations retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              type: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              id_training: { type: 'string', format: 'uuid' },
              piece_jointe: { type: 'string' },
              createdBy: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              creator: {
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
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid training ID format.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findByTrainingId(@Param('trainingId', ParseUUIDPipe) trainingId: string) {
    const catalogues = await this.catalogueFormationService.findByTrainingIdAndType(
      trainingId,
      CatalogueType.STUDENT,
    );
    return {
      status: 200,
      message: 'Catalogue formations retrieved successfully',
      data: catalogues,
    };
  }

  @Get('secretary/training/:trainingId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get catalogue formations by training ID (Secretary only)',
    description: `
      Retrieve all catalogue formations associated with a specific training ID.
      Secretaries can access catalogues by training ID.
      
      **Authorization:**
      - Only secretaries can access this endpoint
      - Bearer token required
      
      **Parameters:**
      - trainingId (path parameter): UUID of the training
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formations found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Catalogue formations retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              type: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              id_training: { type: 'string', format: 'uuid' },
              piece_jointe: { type: 'string' },
              createdBy: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              creator: {
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
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid training ID format.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findByTrainingIdForSecretary(@Param('trainingId') trainingId: string) {
    const catalogues = await this.catalogueFormationService.findByTrainingId(
      trainingId,
    );
    return {
      status: 200,
      message: 'Catalogue formations retrieved successfully',
      data: catalogues,
    };
  }

  @Get('secretary/:id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a specific catalogue formation by ID (Secretary only)',
    description: `
      Retrieve a specific catalogue formation by its ID. Secretaries can access any catalogue.
      
      **Authorization:**
      - Only secretaries can access this endpoint
      - Bearer token required
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formation found.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        id_training: { type: 'string', format: 'uuid' },
        piece_jointe: { type: 'string' },
        createdBy: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        creator: {
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
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Catalogue formation not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findOneForSecretary(@Param('id') id: string) {
    const catalogue = await this.catalogueFormationService.findOne(id);
    if (!catalogue) {
      throw new NotFoundException('Catalogue formation not found');
    }
    return catalogue;
  }

  @Delete('student')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete student type catalogue formation (Secretary only)',
    description: `
      Delete the student type catalogue formation.
      Only secretaries can delete student catalogues.
      
      **Authorization:**
      - Only secretaries can delete student catalogue formations
      - Bearer token required
      
      **Note:** This will delete the single student catalogue that exists in the system.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Student catalogue formation deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Student catalogue formation deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Student catalogue does not exist.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example:
            'Catalogue de formation de type "student" non trouvé.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async deleteStudentCatalogue() {
    try {
      // Use the service method that finds by type and returns CatalogueFormation
      const catalogues = await this.catalogueFormationService.findByType(
        CatalogueType.STUDENT,
      );
      
      if (!catalogues || catalogues.length === 0) {
        throw new NotFoundException(
          'Catalogue de formation de type "student" non trouvé.',
        );
      }
      
      // Get the first student catalogue (there should only be one)
      const catalogue = catalogues[0];
      await this.catalogueFormationService.remove(catalogue.id);
      
      return {
        status: 200,
        message: 'Student catalogue formation deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting student catalogue formation:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      return {
        status: 500,
        data: 'Internal server error during student catalogue formation deletion',
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({ summary: 'Get a specific catalogue formation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formation found.',
    type: CatalogueFormation,
  })
  @ApiResponse({ status: 404, description: 'Catalogue formation not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const catalogue = await this.catalogueFormationService.findOne(id);
    if (!catalogue) {
      throw new Error('Catalogue formation not found');
    }
    const userRole = req.user.roles_user[0];

    // Check access: admin can see all, others only their type
    if (userRole === 'admin' || catalogue.type === userRole) {
      return catalogue;
    } else {
      throw new Error('Access denied');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({ summary: 'Update a catalogue formation (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formation updated successfully.',
    type: CatalogueFormation,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Only admin can update.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateCatalogueFormationDto>,
    @Request() req: any,
  ) {
    const catalogue = await this.catalogueFormationService.findOne(id);
    const userRole = req.user.roles_user[0];

    // Only admin can update
    if (userRole !== 'admin') {
      throw new Error('Only admin can update catalogue formations');
    }

    return this.catalogueFormationService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiOperation({ summary: 'Delete a catalogue formation (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Catalogue formation deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Only admin can delete.' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userRole = req.user.roles_user[0];

    // Only admin can delete
    if (userRole !== 'admin') {
      throw new Error('Only admin can delete catalogue formations');
    }

    return this.catalogueFormationService.remove(id);
  }
}
