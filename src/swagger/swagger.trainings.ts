import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Training DTOs with Swagger decorators
export class CreateTrainingDto {
  @ApiProperty({
    example: 'Complete Web Development Bootcamp',
    description: 'Training title',
  })
  title: string;

  @ApiProperty({
    example: 'Learn modern web development from scratch',
    description: 'Training subtitle',
    required: false,
  })
  subtitle?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training category UUID',
    required: false,
  })
  id_trainingcategory?: string;

  @ApiProperty({
    example: 'En ligne',
    description: 'Training type',
    enum: ['En ligne', 'Vision Conférence', 'En présentiel', 'Hybride'],
    required: false,
  })
  trainingtype?: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'RNC (Registration Number)',
    required: false,
  })
  rnc?: string;

  @ApiProperty({
    example:
      'This comprehensive bootcamp covers HTML, CSS, JavaScript, React, Node.js, and more.',
    description: 'Training description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'Basic computer skills, internet connection',
    description: 'Training requirements',
    required: false,
  })
  requirement?: string;

  @ApiProperty({
    example:
      'Students will learn to build modern web applications using industry-standard tools and practices.',
    description: 'Pedagogical goals',
    required: false,
  })
  pedagogygoals?: string;

  @ApiProperty({
    example: 299.99,
    description: 'Training price',
    required: false,
  })
  prix?: number;
}

export class UpdateTrainingDto {
  @ApiProperty({
    example: 'Advanced Web Development Bootcamp',
    description: 'Training title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Master advanced web development techniques',
    description: 'Training subtitle',
    required: false,
  })
  subtitle?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training category UUID',
    required: false,
  })
  id_trainingcategory?: string;

  @ApiProperty({
    example: 'Hybride',
    description: 'Training type',
    enum: ['En ligne', 'Vision Conférence', 'En présentiel', 'Hybride'],
    required: false,
  })
  trainingtype?: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'RNC (Registration Number)',
    required: false,
  })
  rnc?: string;

  @ApiProperty({
    example:
      'This advanced bootcamp covers advanced React, TypeScript, GraphQL, and deployment strategies.',
    description: 'Training description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'Intermediate programming skills, React knowledge',
    description: 'Training requirements',
    required: false,
  })
  requirement?: string;

  @ApiProperty({
    example:
      'Students will master advanced web development concepts and build production-ready applications.',
    description: 'Pedagogical goals',
    required: false,
  })
  pedagogygoals?: string;

  @ApiProperty({
    example: 399.99,
    description: 'Training price',
    required: false,
  })
  prix?: number;
}

// Training Controller Swagger Configuration
export const TrainingSwagger = {
  controller: {
    tag: 'Trainings',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Create new training',
        description: 'Create a new training program',
      },
      body: { type: CreateTrainingDto },
      responses: {
        201: {
          description: 'Training created successfully',
        },
        400: {
          description: 'Bad request - Invalid data provided',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all trainings',
        description: 'Retrieve all trainings with optional filtering',
      },
      responses: {
        200: {
          description: 'Trainings retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get training by ID',
        description: 'Retrieve a specific training by its ID',
      },
      responses: {
        200: {
          description: 'Training found successfully',
        },
        404: {
          description: 'Training not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update training',
        description: 'Update an existing training',
      },
      body: { type: UpdateTrainingDto },
      responses: {
        200: {
          description: 'Training updated successfully',
        },
        404: {
          description: 'Training not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete training',
        description: 'Remove a training',
      },
      responses: {
        200: {
          description: 'Training deleted successfully',
        },
        404: {
          description: 'Training not found',
        },
      },
    },

    getSessions: {
      operation: {
        summary: 'Get training sessions',
        description: 'Retrieve all sessions for a specific training',
      },
      responses: {
        200: {
          description: 'Training sessions retrieved successfully',
        },
        404: {
          description: 'Training not found',
        },
      },
    },

    getByCategory: {
      operation: {
        summary: 'Get trainings by category',
        description: 'Retrieve all trainings in a specific category',
      },
      responses: {
        200: {
          description: 'Trainings retrieved successfully',
        },
        404: {
          description: 'Category not found',
        },
      },
    },
  },
};
