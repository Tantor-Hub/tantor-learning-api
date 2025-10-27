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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingCategoryService } from './trainingcategory.service';
import { CreateTrainingCategoryDto } from './dto/create-trainingcategory.dto';
import { UpdateTrainingCategoryDto } from './dto/update-trainingcategory.dto';
import { DeleteTrainingCategoryDto } from './dto/delete-trainingcategory.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';

@ApiTags('Training Categories')
@Controller('trainingcategory')
export class TrainingCategoryController {
  constructor(
    private readonly trainingCategoryService: TrainingCategoryService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new training category' })
  @ApiBody({
    type: CreateTrainingCategoryDto,
    description: 'Training category data',
    examples: {
      example1: {
        summary: 'Example training category',
        value: {
          title: 'Software Development',
          description:
            'Training programs focused on software development skills',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The training category has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: {
          type: 'string',
          example: 'Training category created successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: { type: 'string', example: 'Software Development' },
            description: {
              type: 'string',
              example:
                'Training programs focused on software development skills',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error or invalid input.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Failed to create training category',
        },
        data: { type: 'string', example: 'Validation error details' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to create training category',
        },
        data: { type: 'string', example: 'Error details' },
      },
    },
  })
  async create(@Body() createTrainingCategoryDto: CreateTrainingCategoryDto) {
    return this.trainingCategoryService.create(createTrainingCategoryDto);
  }

  @Get('getall')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve all training categories' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all training categories.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training categories retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: { type: 'string', example: 'Software Development' },
              description: {
                type: 'string',
                example:
                  'Training programs focused on software development skills',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to retrieve training categories',
        },
        data: { type: 'string', example: 'Error details' },
      },
    },
  })
  async findAll() {
    return this.trainingCategoryService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve a training category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the training category.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training category retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: { type: 'string', example: 'Software Development' },
            description: {
              type: 'string',
              example:
                'Training programs focused on software development skills',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training category not found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Training category not found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to retrieve training category',
        },
        data: { type: 'string', example: 'Error details' },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingCategoryService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing training category' })
  @ApiBody({
    type: UpdateTrainingCategoryDto,
    description: 'Training category update data',
    examples: {
      example1: {
        summary: 'Example training category update',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Advanced Software Development',
          description:
            'Advanced training programs focused on software development skills',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The training category has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training category updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: { type: 'string', example: 'Advanced Software Development' },
            description: {
              type: 'string',
              example:
                'Advanced training programs focused on software development skills',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training category not found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Training category not found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to update training category',
        },
        data: { type: 'string', example: 'Error details' },
      },
    },
  })
  async update(@Body() updateTrainingCategoryDto: UpdateTrainingCategoryDto) {
    return this.trainingCategoryService.update(updateTrainingCategoryDto);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a training category',
    description:
      'Delete a training category by ID. Only admins can perform this action. Cannot delete if there are associated trainings. Returns 409 Conflict if trainings are associated.',
  })
  @ApiBody({
    type: DeleteTrainingCategoryDto,
    description: 'Training category deletion data',
    examples: {
      example1: {
        summary: 'Example training category delete',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The training category has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training category deleted successfully',
        },
        data: {
          type: 'object',
          properties: {
            deletedCount: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training category not found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Training category not found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Cannot delete training category because it has associated trainings.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example:
            "Impossible de supprimer cette catégorie de formation car 3 formation(s) y sont associée(s): React Development, Node.js Basics, JavaScript Fundamentals. Veuillez d'abord supprimer ou réassigner les formations avant de supprimer la catégorie.",
        },
      },
      example: {
        status: 409,
        message:
          "Impossible de supprimer cette catégorie de formation car 3 formation(s) y sont associée(s): React Development, Node.js Basics, JavaScript Fundamentals. Veuillez d'abord supprimer ou réassigner les formations avant de supprimer la catégorie.",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 500 },
        message: {
          type: 'string',
          example: 'Failed to delete training category',
        },
        data: { type: 'string', example: 'Error details' },
      },
    },
  })
  async remove(@Body() deleteTrainingCategoryDto: DeleteTrainingCategoryDto) {
    const result = await this.trainingCategoryService.remove(
      deleteTrainingCategoryDto,
    );

    console.log('[TRAININGCATEGORY CONTROLLER] 🚀 DELETE Response:', {
      status: result.status,
      message: result.message,
    });

    return result;
  }
}
