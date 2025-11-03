import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogueFormationService } from './catalogueformation.service';
import { CreateCatalogueFormationDto } from './dto/create-catalogueformation.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsInstructor } from 'src/guard/guard.asinstructor';
import { CatalogueFormation } from 'src/models/model.catalogueformation';
import { GoogleDriveService } from 'src/services/service.googledrive';
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
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: 50_000_000 } }),
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
      
      **Supported File Types:**
      - Documents: PDF, DOC, DOCX, TXT
      - Images: JPEG, PNG, GIF
      - Presentations: PPT, PPTX
      - Spreadsheets: XLS, XLSX
      - Maximum file size: 50MB
      
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
            'Document file to upload (optional). Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, PPT, PPTX, XLS, XLSX. Maximum size: 50MB.',
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

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          return {
            status: 400,
            data: 'File size exceeds 50MB limit',
          };
        }

        // Upload file to Cloudinary
        const uploadResult =
          await this.googleDriveService.uploadBufferFile(file);

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
