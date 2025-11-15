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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';

@ApiTags('Books')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new book (Secretary only)',
    description: 'Create a new book. Only secretaries can create books.',
  })
  @ApiBody({ type: CreateBookDto })
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
            author: { type: 'string' },
            createby: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['premium', 'free'] },
            category: { type: 'array', items: { type: 'string', format: 'uuid' } },
            icon: { type: 'string' },
            piece_joint: { type: 'string' },
            views: { type: 'number' },
            download: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
    description: 'Forbidden - Only secretaries can create books',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  create(@Body() createBookDto: CreateBookDto, @Request() req: any) {
    const userId = req.user.id_user;
    return this.bookService.create(createBookDto, userId);
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
              author: { type: 'string' },
              createby: { type: 'string', format: 'uuid' },
              status: { type: 'string', enum: ['premium', 'free'] },
              category: { type: 'array', items: { type: 'string', format: 'uuid' } },
              icon: { type: 'string' },
              piece_joint: { type: 'string' },
              views: { type: 'number' },
              download: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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

