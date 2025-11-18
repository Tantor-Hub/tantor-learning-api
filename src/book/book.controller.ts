import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBookQueryDto } from './dto/find-book.query.dto';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { GoogleDriveService } from 'src/services/service.googledrive';

@ApiTags('Books')
@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'icon', maxCount: 1 },
        { name: 'piece_joint', maxCount: 1 },
      ],
      { limits: { fileSize: 10 * 1024 * 1024 * 1024 } }, // 10GB limit (for piece_joint)
    ),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new book (Secretary only)',
    description:
      'Create a new book with icon (image) and piece_joint (document) file uploads. Only secretaries can create books.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'author',
        'status',
        'category',
        'icon',
        'piece_joint',
      ],
      properties: {
        title: { type: 'string', example: 'Introduction to Programming' },
        description: {
          type: 'string',
          example: 'A comprehensive guide to programming fundamentals',
        },
        author: { type: 'string', example: 'John Doe' },
        status: { type: 'string', enum: ['premium', 'free'], example: 'free' },
        category: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          example: ['550e8400-e29b-41d4-a716-446655440000'],
        },
        session: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
        },
        icon: {
          type: 'string',
          format: 'binary',
          description:
            'Book icon image file (JPEG, PNG, GIF, WebP) - Max 100MB',
        },
        piece_joint: {
          type: 'string',
          format: 'binary',
          description: 'Book document file (PDF, DOC, DOCX, etc.) - Max 10GB',
        },
        public: { type: 'boolean', example: false },
        downloadable: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Book created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            session: { type: 'array', items: { type: 'string' } },
            author: {
              type: 'string',
              description: 'Author of the book (required)',
            },
            createby: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['premium', 'free'] },
            category: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Array of BookCategory UUIDs (required)',
            },
            icon: {
              type: 'string',
              description: 'Icon URL from Cloudinary (required)',
            },
            piece_joint: {
              type: 'string',
              description: 'Attachment URL from Cloudinary (required)',
            },
            views: { type: 'number' },
            download: { type: 'number' },
            public: { type: 'boolean' },
            downloadable: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'title',
            'author',
            'status',
            'category',
            'icon',
            'piece_joint',
            'createby',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Validation error. Required fields: title, author, status, category, icon (file), piece_joint (file)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only secretaries can create books',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(
    @Body() createBookDto: any,
    @Request() req: any,
    @UploadedFiles()
    files: {
      icon?: Express.Multer.File[];
      piece_joint?: Express.Multer.File[];
    },
  ) {
    try {
      const userId = req.user.id_user;

      // Parse category array if it's a JSON string (common with multipart/form-data)
      let category: string[] = [];
      if (createBookDto.category) {
        if (typeof createBookDto.category === 'string') {
          try {
            category = JSON.parse(createBookDto.category);
          } catch {
            // If not JSON, treat as single value array
            category = [createBookDto.category];
          }
        } else if (Array.isArray(createBookDto.category)) {
          category = createBookDto.category;
        }
      }

      // Parse session array if it's a JSON string
      let session: string[] = [];
      if (createBookDto.session) {
        if (typeof createBookDto.session === 'string') {
          try {
            session = JSON.parse(createBookDto.session);
          } catch {
            session = [createBookDto.session];
          }
        } else if (Array.isArray(createBookDto.session)) {
          session = createBookDto.session;
        }
      }

      // Validate required fields
      if (!createBookDto.title) {
        return {
          status: 400,
          data: 'Title is required',
        };
      }

      if (!createBookDto.author) {
        return {
          status: 400,
          data: 'Author is required',
        };
      }

      if (!createBookDto.status) {
        return {
          status: 400,
          data: 'Status is required',
        };
      }

      if (!category || category.length === 0) {
        return {
          status: 400,
          data: 'Category is required. Please provide at least one category UUID.',
        };
      }

      // Validate that both files are uploaded
      if (!files.icon || files.icon.length === 0) {
        return {
          status: 400,
          data: 'Icon file is required. Please upload an image file.',
        };
      }

      if (!files.piece_joint || files.piece_joint.length === 0) {
        return {
          status: 400,
          data: 'Piece joint file is required. Please upload a document file.',
        };
      }

      const iconFile = files.icon[0];
      const pieceJointFile = files.piece_joint[0];

      // Validate icon file type (images only)
      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
      ];

      if (!allowedImageTypes.includes(iconFile.mimetype)) {
        return {
          status: 400,
          data: `Icon file type ${iconFile.mimetype} is not allowed. Allowed types: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF`,
        };
      }

      // Validate piece_joint file type (documents)
      const allowedDocumentTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Also allow images for piece_joint if needed
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedDocumentTypes.includes(pieceJointFile.mimetype)) {
        return {
          status: 400,
          data: `Piece joint file type ${pieceJointFile.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, TXT, PPT, XLS, JPEG, PNG, GIF, WebP`,
        };
      }

      // Validate icon file size (100MB limit for images)
      const maxIconSize = 100 * 1024 * 1024; // 100MB
      if (iconFile.size > maxIconSize) {
        return {
          status: 400,
          data: 'Icon file size exceeds 100MB limit',
        };
      }

      // Validate piece_joint file size (10GB limit for documents)
      const maxPieceJointSize = 10 * 1024 * 1024 * 1024; // 10GB
      if (pieceJointFile.size > maxPieceJointSize) {
        return {
          status: 400,
          data: 'Piece joint file size exceeds 10GB limit',
        };
      }

      // Upload icon to Cloudinary
      const iconUploadResult =
        await this.googleDriveService.uploadBufferFile(iconFile);
      if (!iconUploadResult) {
        return {
          status: 500,
          data: 'Failed to upload icon to cloud storage',
        };
      }

      // Upload piece_joint to Cloudinary
      const pieceJointUploadResult =
        await this.googleDriveService.uploadBufferFile(pieceJointFile);
      if (!pieceJointUploadResult) {
        return {
          status: 500,
          data: 'Failed to upload piece joint to cloud storage',
        };
      }

      // Create book with uploaded file URLs
      const bookData: CreateBookDto & { icon: string; piece_joint: string } = {
        title: createBookDto.title,
        description: createBookDto.description,
        author: createBookDto.author,
        status: createBookDto.status,
        category: category,
        session: session,
        public:
          createBookDto.public === 'true' || createBookDto.public === true,
        downloadable:
          createBookDto.downloadable === 'true' ||
          createBookDto.downloadable === true,
        icon: iconUploadResult.link,
        piece_joint: pieceJointUploadResult.link,
      };

      return this.bookService.create(bookData, userId);
    } catch (error) {
      console.error('Error creating book:', error);
      return {
        status: 500,
        data: 'Internal server error during book creation',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books',
    description:
      'Retrieve public books that have an active session. Supports filtering by session, category, author, status (free/premium), minimum views/downloads, text search, and pagination.\n\n' +
      'Example URL with all parameters:\n' +
      '/api/book?session=1f3c2b9d-1f60-4f3f-9f2e-0a7f6c8e1a9b,9e2d7f4c-3c1b-4f4c-b9c7-2f5f7a6b3c9d&category=e2c7a9f4-2a6d-4b7e-8c9d-1a2b3c4d5e6f&author=John%20Doe&status=free&search=leadership%20fundamentals&minViews=100&minDownload=50&page=1&limit=20',
  })
  @ApiQuery({
    name: 'session',
    required: false,
    description:
      'Comma-separated list of session UUIDs. Book must belong to all provided sessions.',
    type: String,
    example:
      '1f3c2b9d-1f60-4f3f-9f2e-0a7f6c8e1a9b,9e2d7f4c-3c1b-4f4c-b9c7-2f5f7a6b3c9d',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Comma-separated list of category UUIDs.',
    type: String,
    example: 'e2c7a9f4-2a6d-4b7e-8c9d-1a2b3c4d5e6f',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    description: 'Partial match on author name.',
    type: String,
    example: 'John Doe',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term applied to book title and description.',
    type: String,
    example: 'leadership fundamentals',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by book status (free or premium).',
    enum: ['free', 'premium'],
    example: 'free',
  })
  @ApiQuery({
    name: 'minViews',
    required: false,
    description: 'Minimum number of views.',
    type: Number,
    example: 100,
  })
  @ApiQuery({
    name: 'minDownload',
    required: false,
    description: 'Minimum number of downloads.',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts at 1).',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100).',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description:
      'Books retrieved successfully. Returns paginated results with active sessions.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              description: { type: 'string' },
              session: { type: 'array', items: { type: 'string' } },
              author: {
                type: 'string',
                description: 'Author of the book (required)',
              },
              createby: { type: 'string', format: 'uuid' },
              status: { type: 'string', enum: ['premium', 'free'] },
              category: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                description: 'Array of BookCategory UUIDs (required)',
              },
              icon: {
                type: 'string',
                description: 'Icon URL from Cloudinary (required)',
              },
              piece_joint: {
                type: 'string',
                description: 'Attachment URL from Cloudinary (required)',
              },
              views: { type: 'number' },
              download: { type: 'number' },
              public: { type: 'boolean' },
              downloadable: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'title',
              'author',
              'status',
              'category',
              'icon',
              'piece_joint',
              'createby',
            ],
          },
        },
      },
    },
  })
  findAll(@Query() query: FindBookQueryDto) {
    return this.bookService.findAll(query);
  }

  @Get('secretary/all')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all books (Secretary only)',
    description: 'Retrieve every book without filters or public-only restrictions.',
  })
  @ApiResponse({
    status: 200,
    description: 'All books retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              title: { type: 'string', example: 'Introduction to Programming' },
              description: { type: 'string', example: 'A comprehensive guide to programming fundamentals' },
              session: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                example: ['1f3c2b9d-1f60-4f3f-9f2e-0a7f6c8e1a9b'],
              },
              author: { type: 'string', example: 'John Doe' },
              createby: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
              status: { type: 'string', enum: ['premium', 'free'], example: 'free' },
              category: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                example: ['e2c7a9f4-2a6d-4b7e-8c9d-1a2b3c4d5e6f'],
              },
              icon: {
                type: 'string',
                example: 'https://res.cloudinary.com/example/image/upload/v1234567890/icon.jpg',
              },
              piece_joint: {
                type: 'string',
                example: 'https://res.cloudinary.com/example/image/upload/v1234567890/document.pdf',
              },
              views: { type: 'number', example: 150 },
              download: { type: 'number', example: 45 },
              public: { type: 'boolean', example: true },
              downloadable: { type: 'boolean', example: false },
              createdAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2025-01-25T10:00:00.000Z' },
              creator: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'jane.doe@example.com' },
                },
              },
            },
            required: [
              'id',
              'title',
              'author',
              'status',
              'category',
              'icon',
              'piece_joint',
              'createby',
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only secretaries can access this endpoint',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  findAllForSecretary() {
    return this.bookService.findAllForSecretary();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a book by ID',
    description:
      'Retrieve a specific book by its ID. Premium books require an active session payment.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.bookService.findOne(id, req.user.id_user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'icon', maxCount: 1 },
        { name: 'piece_joint', maxCount: 1 },
      ],
      { limits: { fileSize: 10 * 1024 * 1024 * 1024 } }, // 10GB limit (for piece_joint)
    ),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update a book (Secretary only)',
    description: `
      Update a book with optional file uploads. Only authenticated secretaries can modify book records.

      **Features**
      - Upload new media (optional) for \`icon\` (image) or \`piece_joint\` (document)
      - Update book metadata (\`title\`, \`description\`, \`author\`)
      - Maintain associations (\`session[]\`, \`category[]\`) using UUID arrays
      - Toggle access flags (\`status\`, \`public\`, \`downloadable\`)
      - Automatic upload to cloud storage with URL generation for files

      **File Upload**
      - \`icon\`: JPEG, PNG, GIF, WEBP | Max 100MB
      - \`piece_joint\`: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, JPEG, PNG, GIF, WEBP | Max 10GB
      - Send files using multipart/form-data; the backend stores them and updates the URLs

      **Example cURL**
      \`\`\`bash
      curl -X PATCH "https://api.example.com/api/book/550e8400-e29b-41d4-a716-446655440000" \
        -H "Authorization: Bearer SECRETARY_JWT" \
        -F "title=Updated Programming Handbook" \
        -F "description=Expanded edition with new labs" \
        -F "author=Jane Doe" \
        -F "session=[\"1f3c2b9d-1f60-4f3f-9f2e-0a7f6c8e1a9b\"]" \
        -F "category=[\"e2c7a9f4-2a6d-4b7e-8c9d-1a2b3c4d5e6f\"]" \
        -F "status=premium" \
        -F "public=true" \
        -F "downloadable=true" \
        -F "icon=@/path/to/icon.png" \
        -F "piece_joint=@/path/to/document.pdf"
      \`\`\`

      **Example JavaScript/TypeScript**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('title', 'Updated Programming Handbook');
      formData.append('description', 'Expanded edition with new labs');
      formData.append('author', 'Jane Doe');
      formData.append('session', JSON.stringify(['1f3c2b9d-1f60-4f3f-9f2e-0a7f6c8e1a9b']));
      formData.append('category', JSON.stringify(['e2c7a9f4-2a6d-4b7e-8c9d-1a2b3c4d5e6f']));
      formData.append('status', 'premium');
      formData.append('public', 'true');
      formData.append('downloadable', 'true');
      formData.append('icon', iconFileInput.files[0]); // Optional
      formData.append('piece_joint', pieceJointFileInput.files[0]); // Optional

      const response = await fetch('/api/book/550e8400-e29b-41d4-a716-446655440000', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer SECRETARY_JWT' },
        body: formData,
      });

      const result = await response.json();
      \`\`\`
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only secretaries can update books',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: any,
    @Request() req: any,
    @UploadedFiles()
    files: {
      icon?: Express.Multer.File[];
      piece_joint?: Express.Multer.File[];
    },
  ) {
    try {
      // Check if body is empty or undefined
      if (!updateBookDto || Object.keys(updateBookDto).length === 0) {
        // Also check if files are provided
        if (!files || (!files.icon && !files.piece_joint)) {
          return {
            status: 400,
            data: 'Aucune donnée reçue. Veuillez préciser au moins un champ à mettre à jour.',
          };
        }
      }

      // Parse category array if it's a JSON string (common with multipart/form-data)
      let category: string[] | undefined = undefined;
      if (updateBookDto.category) {
        if (typeof updateBookDto.category === 'string') {
          try {
            category = JSON.parse(updateBookDto.category);
          } catch {
            // If not JSON, treat as single value array
            category = [updateBookDto.category];
          }
        } else if (Array.isArray(updateBookDto.category)) {
          category = updateBookDto.category;
        }
      }

      // Parse session array if it's a JSON string
      let session: string[] | undefined = undefined;
      if (updateBookDto.session) {
        if (typeof updateBookDto.session === 'string') {
          try {
            session = JSON.parse(updateBookDto.session);
          } catch {
            session = [updateBookDto.session];
          }
        } else if (Array.isArray(updateBookDto.session)) {
          session = updateBookDto.session;
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (updateBookDto.title !== undefined) updateData.title = updateBookDto.title;
      if (updateBookDto.description !== undefined)
        updateData.description = updateBookDto.description;
      if (session !== undefined) updateData.session = session;
      if (updateBookDto.author !== undefined)
        updateData.author = updateBookDto.author;
      if (updateBookDto.status !== undefined)
        updateData.status = updateBookDto.status;
      if (category !== undefined) updateData.category = category;
      if (updateBookDto.public !== undefined)
        updateData.public =
          updateBookDto.public === 'true' || updateBookDto.public === true;
      if (updateBookDto.downloadable !== undefined)
        updateData.downloadable =
          updateBookDto.downloadable === 'true' ||
          updateBookDto.downloadable === true;

      // Handle icon file upload
      if (files.icon && files.icon.length > 0) {
        const iconFile = files.icon[0];

        // Validate icon file type (images only)
        const allowedImageTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/tiff',
        ];

        if (!allowedImageTypes.includes(iconFile.mimetype)) {
          return {
            status: 400,
            data: `Icon file type ${iconFile.mimetype} is not allowed. Allowed types: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF`,
          };
        }

        // Validate icon file size (100MB limit for images)
        const maxIconSize = 100 * 1024 * 1024; // 100MB
        if (iconFile.size > maxIconSize) {
          return {
            status: 400,
            data: 'Icon file size exceeds 100MB limit',
          };
        }

        // Upload icon to cloud storage
        const iconUploadResult =
          await this.googleDriveService.uploadBufferFile(iconFile);
        if (!iconUploadResult) {
          return {
            status: 500,
            data: 'Failed to upload icon to cloud storage',
          };
        }
        updateData.icon = iconUploadResult.link;
      }

      // Handle piece_joint file upload
      if (files.piece_joint && files.piece_joint.length > 0) {
        const pieceJointFile = files.piece_joint[0];

        // Validate piece_joint file type (documents)
        const allowedDocumentTypes = [
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          // Also allow images for piece_joint if needed
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (!allowedDocumentTypes.includes(pieceJointFile.mimetype)) {
          return {
            status: 400,
            data: `Piece joint file type ${pieceJointFile.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, TXT, PPT, XLS, JPEG, PNG, GIF, WebP`,
          };
        }

        // Validate piece_joint file size (10GB limit for documents)
        const maxPieceJointSize = 10 * 1024 * 1024 * 1024; // 10GB
        if (pieceJointFile.size > maxPieceJointSize) {
          return {
            status: 400,
            data: 'Piece joint file size exceeds 10GB limit',
          };
        }

        // Upload piece_joint to cloud storage
        const pieceJointUploadResult =
          await this.googleDriveService.uploadBufferFile(pieceJointFile);
        if (!pieceJointUploadResult) {
          return {
            status: 500,
            data: 'Failed to upload piece joint to cloud storage',
          };
        }
        updateData.piece_joint = pieceJointUploadResult.link;
      }

      // Check if there's at least one field to update
      if (Object.keys(updateData).length === 0) {
        return {
          status: 400,
          data: 'Aucune donnée reçue. Veuillez préciser au moins un champ à mettre à jour.',
        };
      }

      return this.bookService.update(id, updateData);
    } catch (error) {
      console.error('Error updating book:', error);
      return {
        status: 500,
        data: 'Internal server error during book update',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a book (Secretary only)',
    description: 'Delete a book. Only secretaries can delete books.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary access required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only secretaries can delete books',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.remove(id);
  }

  @Patch(':id/increment-views')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Increment book views',
    description:
      'Increment the view count for a book. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Views incremented successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.incrementViews(id);
  }

  @Patch(':id/increment-download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Increment book downloads',
    description:
      'Increment the download count for a book. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Downloads incremented successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  incrementDownload(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.incrementDownload(id);
  }
}
