import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import { CreateTrainingsDto } from './dto/create-trainings.dto';
import { UpdateTrainingsDto } from './dto/update-trainings.dto';
import { DeleteTrainingsDto } from './dto/delete-trainings.dto';
import { JwtAuthGuardAsSecretary } from '../guard/guard.assecretary';
import { JwtAuthGuardAsStudent } from '../guard/guard.asstudent';

@ApiTags('Trainings')
@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new training',
    description: `
**CreateTrainingsDto Structure:**
\`\`\`typescript
{
  title: string;                    // Required
  subtitle?: string;                // Optional
  id_trainingcategory?: string;     // Optional
  trainingtype?: TrainingType;      // Optional
  rnc?: string;                     // Optional
  description?: string;             // Optional
  requirement?: string;             // Optional
  pedagogygoals?: string;           // Optional
  prix?: number;                    // Optional
}
\`\`\`
    `,
  })
  @ApiBody({
    type: CreateTrainingsDto,
    examples: {
      example1: {
        summary: 'Basic training creation',
        value: {
          title: 'Advanced React Development',
          subtitle: 'Master React hooks and advanced patterns',
          id_trainingcategory: '123e4567-e89b-12d3-a456-426614174000',
          trainingtype: 'En ligne',
          rnc: 'RNC123456',
          description: 'Comprehensive training on React development',
          requirement: 'Basic knowledge of JavaScript',
          pedagogygoals: 'Learn advanced React patterns and best practices',
          prix: 299.99,
        },
      },
      example2: {
        summary: 'Complete training creation with all fields',
        value: {
          title: 'Node.js Backend Development',
          subtitle: 'Build scalable backend applications',
          id_trainingcategory: '123e4567-e89b-12d3-a456-426614174001',
          trainingtype: 'Hybride',
          rnc: 'RNC789012',
          description: 'Learn Node.js, Express, and database integration',
          requirement: 'Basic programming knowledge',
          pedagogygoals: 'Master backend development with Node.js',
          prix: 399.99,
        },
      },
      example3: {
        summary: 'Minimal training creation (only required fields)',
        value: {
          title: 'Python Fundamentals',
        },
      },
      example4: {
        summary: 'Training with different types',
        value: {
          title: 'Data Science Workshop',
          subtitle: 'Hands-on data analysis and machine learning',
          id_trainingcategory: '123e4567-e89b-12d3-a456-426614174002',
          trainingtype: 'Vision Conférence',
          rnc: 'RNC456789',
          description:
            'Interactive workshop covering data analysis, visualization, and machine learning basics',
          requirement: 'Basic knowledge of Python and statistics',
          pedagogygoals: 'Learn practical data science skills and tools',
          prix: 599.99,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Training created successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Training created successfully' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: { type: 'string', example: 'Advanced React Development' },
            subtitle: {
              type: 'string',
              example: 'Master React hooks and advanced patterns',
            },
            id_trainingcategory: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            trainingtype: {
              type: 'string',
              enum: [
                'En ligne',
                'Vision Conférence',
                'En présentiel',
                'Hybride',
              ],
              example: 'En ligne',
            },
            rnc: { type: 'string', example: 'RNC123456' },
            description: {
              type: 'string',
              example: 'Comprehensive training on React development',
            },
            requirement: {
              type: 'string',
              example: 'Basic knowledge of JavaScript',
            },
            pedagogygoals: {
              type: 'string',
              example: 'Learn advanced React patterns and best practices',
            },
            prix: { type: 'number', example: 299.99 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  create(@Body() createTrainingsDto: CreateTrainingsDto) {
    console.log(
      '[TRAININGS CONTROLLER] Create endpoint called with data:',
      createTrainingsDto,
    );
    return this.trainingsService.create(createTrainingsDto);
  }

  @Get('getlist')
  @ApiOperation({ summary: 'Get all trainings' })
  @ApiResponse({
    status: 200,
    description: 'Trainings retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Trainings retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: { type: 'string', example: 'Advanced React Development' },
              subtitle: {
                type: 'string',
                example: 'Master React hooks and advanced patterns',
              },
              id_trainingcategory: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              trainingtype: {
                type: 'string',
                enum: [
                  'En ligne',
                  'Vision Conférence',
                  'En présentiel',
                  'Hybride',
                ],
                example: 'En ligne',
              },
              rnc: { type: 'string', example: 'RNC123456' },
              description: {
                type: 'string',
                example: 'Comprehensive training on React development',
              },
              requirement: {
                type: 'string',
                example: 'Basic knowledge of JavaScript',
              },
              pedagogygoals: {
                type: 'string',
                example: 'Learn advanced React patterns and best practices',
              },
              prix: { type: 'number', example: 299.99 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              trainingCategory: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Web Development' },
                },
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
  })
  findAll() {
    return this.trainingsService.findAll();
  }

  @Get('student/with-sessions')
  @UseGuards(JwtAuthGuardAsStudent)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all trainings with available sessions (Student access)',
    description:
      'Retrieve all trainings that have at least one training session available. This endpoint is specifically designed for students to browse available training opportunities.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainings with sessions retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Found 5 trainings with available sessions',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: { type: 'string', example: 'Advanced React Development' },
              subtitle: {
                type: 'string',
                example: 'Master React hooks and advanced patterns',
              },
              type: {
                type: 'string',
                enum: [
                  'En ligne',
                  'Vision Conférence',
                  'En présentiel',
                  'Hybride',
                ],
                example: 'En ligne',
              },
              description: {
                type: 'string',
                example: 'Comprehensive training on React development',
              },
              prix: { type: 'number', example: 299.99 },
              category: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Web Development' },
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
    description: 'Unauthorized - Student access required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findAllWithSessions() {
    console.log(
      '🎓 [STUDENT TRAININGS] Student requesting trainings with sessions',
    );
    return this.trainingsService.findAllWithSessions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training by ID' })
  @ApiResponse({
    status: 200,
    description: 'Training retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Training retrieved successfully' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a training',
    description: `
**UpdateTrainingsDto Structure:**
\`\`\`typescript
{
  id: string;                       // Required (to identify which training)
  title?: string;                   // Optional (same as create)
  subtitle?: string;                // Optional (same as create)
  id_trainingcategory?: string;     // Optional (same as create)
  trainingtype?: TrainingType;      // Optional (same as create)
  rnc?: string;                     // Optional (same as create)
  description?: string;             // Optional (same as create)
  requirement?: string;             // Optional (same as create)
  pedagogygoals?: string;           // Optional (same as create)
  prix?: number;                    // Optional (same as create)
}
\`\`\`

Update an existing training with the provided data. The request body should contain the same fields as the create endpoint, plus the required "id" field to identify which training to update. You can update any or all fields - only the fields provided in the request body will be updated.
    `,
  })
  @ApiBody({
    type: UpdateTrainingsDto,
    examples: {
      example1: {
        summary: 'Update training title and price',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Updated React Development Course',
          prix: 349.99,
        },
      },
      example2: {
        summary: 'Update training type and description',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          trainingtype: 'En présentiel',
          description: 'Updated comprehensive training on React development',
          requirement: 'Updated requirements for the course',
          pedagogygoals: 'Updated learning objectives',
        },
      },
      example3: {
        summary: 'Update training category and RNC',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          id_trainingcategory: '123e4567-e89b-12d3-a456-426614174001',
          rnc: 'RNC789012',
          subtitle: 'Updated subtitle for the training',
        },
      },
      example4: {
        summary: 'Update all training fields (complete update)',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Complete React Development Masterclass',
          subtitle: 'From basics to advanced patterns and best practices',
          id_trainingcategory: '123e4567-e89b-12d3-a456-426614174001',
          trainingtype: 'Hybride',
          rnc: 'RNC789012',
          description:
            'A comprehensive training covering all aspects of React development including hooks, context, state management, testing, and deployment.',
          requirement:
            'Basic knowledge of JavaScript and HTML/CSS. Familiarity with ES6+ features recommended.',
          pedagogygoals:
            'Master React fundamentals, advanced patterns, state management, testing strategies, and deployment best practices.',
          prix: 499.99,
        },
      },
      example5: {
        summary: 'Update training type to different options',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          trainingtype: 'En présentiel',
          description: 'Updated to in-person training format',
          prix: 449.99,
        },
      },
      example6: {
        summary: 'Update without changing title (title field optional)',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Updated description only',
          requirement: 'Updated requirements',
          prix: 299.99,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Training updated successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Training updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: { type: 'string', example: 'Advanced React Development' },
            subtitle: {
              type: 'string',
              example: 'Master React hooks and advanced patterns',
            },
            id_trainingcategory: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            trainingtype: {
              type: 'string',
              enum: [
                'En ligne',
                'Vision Conférence',
                'En présentiel',
                'Hybride',
              ],
              example: 'En ligne',
            },
            rnc: { type: 'string', example: 'RNC123456' },
            description: {
              type: 'string',
              example: 'Comprehensive training on React development',
            },
            requirement: {
              type: 'string',
              example: 'Basic knowledge of JavaScript',
            },
            pedagogygoals: {
              type: 'string',
              example: 'Learn advanced React patterns and best practices',
            },
            prix: { type: 'number', example: 299.99 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            trainingCategory: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 401 },
        message: {
          type: 'string',
          example: 'Unauthorized - Secretary role required',
        },
        data: { type: 'object', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Training not found.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Training not found' },
        data: { type: 'object', nullable: true },
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
        message: { type: 'string', example: 'Failed to update training' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Database connection error' },
          },
        },
      },
    },
  })
  update(@Body() updateTrainingsDto: UpdateTrainingsDto) {
    return this.trainingsService.update(updateTrainingsDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a training' })
  @ApiBody({
    type: DeleteTrainingsDto,
    examples: {
      example1: {
        summary: 'Delete training by ID',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Training deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Training deleted successfully' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Secretary role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Training not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  remove(@Body() deleteTrainingsDto: DeleteTrainingsDto) {
    return this.trainingsService.remove(deleteTrainingsDto);
  }

  @Delete('delete-all')
  @ApiOperation({ summary: 'Delete all trainings' })
  @ApiResponse({
    status: 200,
    description: 'All trainings deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'All trainings deleted successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  deleteAll() {
    return this.trainingsService.deleteAll();
  }

  @Post('fix-table')
  @ApiOperation({ summary: 'Create or fix training table structure' })
  @ApiResponse({
    status: 200,
    description: 'Training table created or verified successfully.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: {
          type: 'string',
          example: 'Training table created successfully',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  fixTable() {
    return this.trainingsService.createTableIfNotExists();
  }
}
