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
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
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
      { limits: { fileSize: 2 * 1024 * 1024 * 1024 } }, // 2GB limit (for piece_joint)
    ),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new book (Secretary only)',
    description: 'Create a new book with icon (image) and piece_joint (document) file uploads. Only secretaries can create books.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'author', 'status', 'category', 'icon', 'piece_joint'],
      properties: {
        title: { type: 'string', example: 'Introduction to Programming' },
        description: { type: 'string', example: 'A comprehensive guide to programming fundamentals' },
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
          description: 'Book icon image file (JPEG, PNG, GIF, WebP) - Max 100MB',
        },
        piece_joint: {
          type: 'string',
          format: 'binary',
          description: 'Book document file (PDF, DOC, DOCX, etc.) - Max 2GB',
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
          required: ['title', 'author', 'status', 'category', 'icon', 'piece_joint', 'createby'],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error. Required fields: title, author, status, category, icon (file), piece_joint (file)',
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

      // Validate piece_joint file size (2GB limit for documents)
      const maxPieceJointSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (pieceJointFile.size > maxPieceJointSize) {
        return {
          status: 400,
          data: 'Piece joint file size exceeds 2GB limit',
        };
      }

      // Upload icon to Cloudinary
      const iconUploadResult = await this.googleDriveService.uploadBufferFile(iconFile);
      if (!iconUploadResult) {
        return {
          status: 500,
          data: 'Failed to upload icon to cloud storage',
        };
      }

      // Upload piece_joint to Cloudinary
      const pieceJointUploadResult = await this.googleDriveService.uploadBufferFile(pieceJointFile);
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
        public: createBookDto.public === 'true' || createBookDto.public === true,
        downloadable: createBookDto.downloadable === 'true' || createBookDto.downloadable === true,
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
    description: 'Retrieve all books. This endpoint is public.',
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
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
            required: ['id', 'title', 'author', 'status', 'category', 'icon', 'piece_joint', 'createby'],
          },
        },
      },
    },
  })
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book by ID',
    description: 'Retrieve a specific book by its ID. This endpoint is public.',
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a book (Secretary only)',
    description: 'Update a book. Only secretaries can update books.',
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto);
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
    description: 'Increment the view count for a book. Requires authentication.',
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
    description: 'Increment the download count for a book. Requires authentication.',
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

