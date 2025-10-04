import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// TrainingCategory DTOs with Swagger decorators
export class CreateTrainingCategoryDto {
  @ApiProperty({
    example: 'Web Development',
    description: 'Category name',
  })
  name: string;

  @ApiProperty({
    example: 'Programming and web technologies',
    description: 'Category description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Category color code',
    required: false,
  })
  color?: string;

  @ApiProperty({
    example: 'web-development-icon.png',
    description: 'Category icon filename',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the category is active',
    required: false,
  })
  is_active?: boolean;
}

export class UpdateTrainingCategoryDto {
  @ApiProperty({
    example: 'Advanced Web Development',
    description: 'Category name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'Advanced programming and modern web technologies',
    description: 'Category description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Category color code',
    required: false,
  })
  color?: string;

  @ApiProperty({
    example: 'advanced-web-dev-icon.png',
    description: 'Category icon filename',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the category is active',
    required: false,
  })
  is_active?: boolean;
}

// TrainingCategory Controller Swagger Configuration
export const TrainingCategorySwagger = {
  controller: {
    tag: 'Training Categories',
    bearerAuth: true,
  },

  methods: {
    create: {
      operation: {
        summary: 'Create new training category',
        description: 'Create a new training category',
      },
      body: { type: CreateTrainingCategoryDto },
      responses: {
        201: {
          description: 'Training category created successfully',
        },
        400: {
          description: 'Bad request - Invalid data provided',
        },
      },
    },

    findAll: {
      operation: {
        summary: 'Get all training categories',
        description: 'Retrieve all training categories with optional filtering',
      },
      responses: {
        200: {
          description: 'Training categories retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get training category by ID',
        description: 'Retrieve a specific training category by its ID',
      },
      responses: {
        200: {
          description: 'Training category found successfully',
        },
        404: {
          description: 'Training category not found',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update training category',
        description: 'Update an existing training category',
      },
      body: { type: UpdateTrainingCategoryDto },
      responses: {
        200: {
          description: 'Training category updated successfully',
        },
        404: {
          description: 'Training category not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete training category',
        description: 'Remove a training category',
      },
      responses: {
        200: {
          description: 'Training category deleted successfully',
        },
        404: {
          description: 'Training category not found',
        },
      },
    },

    getTrainings: {
      operation: {
        summary: 'Get trainings by category',
        description: 'Retrieve all trainings in a specific category',
      },
      responses: {
        200: {
          description: 'Trainings retrieved successfully',
        },
        404: {
          description: 'Training category not found',
        },
      },
    },
  },
};
