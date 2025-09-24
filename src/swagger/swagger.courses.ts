import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Course DTOs with Swagger decorators
export class CreateCoursDto {
  @ApiProperty({
    example: 'Course Title',
    description: 'Title of the course',
  })
  title: string;

  @ApiProperty({
    example: 'Course Description',
    description: 'Description of the course',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this course belongs to',
  })
  id_formation: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of formateur IDs',
  })
  id_formateurs: number[];

  @ApiProperty({
    example: true,
    description: 'Whether the course is active',
  })
  isActive: boolean;
}

export class UpdateCoursDto {
  @ApiProperty({
    example: 'Updated Course Title',
    description: 'Title of the course',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Updated Course Description',
    description: 'Description of the course',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this course belongs to',
    required: false,
  })
  id_formation?: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of formateur IDs',
    required: false,
  })
  id_formateurs?: number[];

  @ApiProperty({
    example: true,
    description: 'Whether the course is active',
    required: false,
  })
  isActive?: boolean;
}

// Courses Controller Swagger Configuration
export const CoursesSwagger = {
  controller: {
    tag: 'Courses',
    bearerAuth: true,
  },

  methods: {
    findAll: {
      operation: {
        summary: 'Get all courses',
        description: 'Retrieve all courses',
      },
      responses: {
        200: {
          description: 'Courses retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get course by ID',
        description: 'Retrieve a specific course by its ID',
      },
      param: {
        name: 'id',
        description: 'Course ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Course retrieved successfully',
        },
        404: {
          description: 'Course not found',
        },
      },
    },

    create: {
      operation: {
        summary: 'Create a new course',
        description: 'Create a new course',
      },
      body: { type: CreateCoursDto },
      responses: {
        201: {
          description: 'Course created successfully',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update course by ID',
        description: 'Update an existing course',
      },
      param: {
        name: 'id',
        description: 'Course ID',
        type: 'string',
      },
      body: { type: UpdateCoursDto },
      responses: {
        200: {
          description: 'Course updated successfully',
        },
        404: {
          description: 'Course not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete course by ID',
        description: 'Delete an existing course',
      },
      param: {
        name: 'id',
        description: 'Course ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Course deleted successfully',
        },
        404: {
          description: 'Course not found',
        },
      },
    },

    createPreset: {
      operation: {
        summary: 'Create a preset course for a session',
        description: 'Create a predefined course structure for a session',
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'JavaScript Fundamentals' },
            description: { type: 'string', example: 'Learn JavaScript basics' },
            id_formation: { type: 'number', example: 1 },
            id_formateurs: {
              type: 'array',
              items: { type: 'number' },
              example: [1, 2],
            },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
      responses: {
        201: {
          description: 'Preset course created successfully',
        },
      },
    },

    updateFormateurs: {
      operation: {
        summary: 'Update course formateurs',
        description: 'Update the formateurs assigned to a course',
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          id_formateurs: { type: 'array', items: { type: 'string' } },
        },
      },
      responses: {
        200: {
          description: 'Course formateurs updated successfully',
        },
      },
    },
  },
};
