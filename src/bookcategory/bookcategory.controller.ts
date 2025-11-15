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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { BookCategoryService } from './bookcategory.service';
import { CreateBookCategoryDto } from './dto/create-bookcategory.dto';
import { UpdateBookCategoryDto } from './dto/update-bookcategory.dto';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';

@ApiTags('Book Categories')
@Controller('bookcategory')
export class BookCategoryController {
  constructor(private readonly bookCategoryService: BookCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new book category (Secretary only)',
    description: 'Create a new book category. Only secretaries can create categories.',
  })
  @ApiBody({ type: CreateBookCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Book category created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Book category created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Programming' },
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
    description: 'Forbidden - Only secretaries can create book categories',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A category with this title already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  create(@Body() createBookCategoryDto: CreateBookCategoryDto) {
    return this.bookCategoryService.create(createBookCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all book categories',
    description: 'Retrieve all book categories. This endpoint is public.',
  })
  @ApiResponse({
    status: 200,
    description: 'Book categories retrieved successfully',
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
              title: { type: 'string', example: 'Programming' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  findAll() {
    return this.bookCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book category by ID',
    description: 'Retrieve a specific book category by its ID. This endpoint is public.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book category UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book category retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Programming' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Book category not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a book category (Secretary only)',
    description: 'Update a book category. Only secretaries can update categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book category UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateBookCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Book category updated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Programming' },
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
    description: 'Forbidden - Only secretaries can update book categories',
  })
  @ApiResponse({
    status: 404,
    description: 'Book category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A category with this title already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookCategoryDto: UpdateBookCategoryDto,
  ) {
    return this.bookCategoryService.update(id, updateBookCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a book category (Secretary only)',
    description: 'Delete a book category. Only secretaries can delete categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book category UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Catégorie de livre supprimée avec succès' },
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
    description: 'Forbidden - Only secretaries can delete book categories',
  })
  @ApiResponse({
    status: 404,
    description: 'Book category not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookCategoryService.remove(id);
  }
}

