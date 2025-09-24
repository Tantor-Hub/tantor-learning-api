import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Formation DTOs with Swagger decorators
export class CreateFormationDto {
  @ApiProperty({
    example: 'JavaScript Development',
    description: 'Title of the formation',
  })
  title: string;

  @ApiProperty({
    example: 'Complete JavaScript development course',
    description: 'Description of the formation',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the category this formation belongs to',
  })
  id_category: number;

  @ApiProperty({
    example: 1500,
    description: 'Price of the formation',
  })
  prix: number;

  @ApiProperty({
    example: 40,
    description: 'Duration in hours',
  })
  duree: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date of the formation',
  })
  date_debut: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'End date of the formation',
  })
  date_fin: string;
}

export class UpdateFormationDto {
  @ApiProperty({
    example: 'Updated JavaScript Development',
    description: 'Title of the formation',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Updated Complete JavaScript development course',
    description: 'Description of the formation',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the category this formation belongs to',
    required: false,
  })
  id_category?: number;

  @ApiProperty({
    example: 1500,
    description: 'Price of the formation',
    required: false,
  })
  prix?: number;

  @ApiProperty({
    example: 40,
    description: 'Duration in hours',
    required: false,
  })
  duree?: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date of the formation',
    required: false,
  })
  date_debut?: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'End date of the formation',
    required: false,
  })
  date_fin?: string;
}

// Formations Controller Swagger Configuration
export const FormationsSwagger = {
  controller: {
    tag: 'Formations',
    bearerAuth: true,
  },

  methods: {
    findAll: {
      operation: {
        summary: 'Get all formations',
        description: 'Retrieve all formations',
      },
      responses: {
        200: {
          description: 'Formations retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get formation by ID',
        description: 'Retrieve a specific formation by its ID',
      },
      param: {
        name: 'id',
        description: 'Formation ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Formation retrieved successfully',
        },
        404: {
          description: 'Formation not found',
        },
      },
    },

    create: {
      operation: {
        summary: 'Create a new formation',
        description: 'Create a new formation',
      },
      body: { type: CreateFormationDto },
      responses: {
        201: {
          description: 'Formation created successfully',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update formation by ID',
        description: 'Update an existing formation',
      },
      param: {
        name: 'id',
        description: 'Formation ID',
        type: 'string',
      },
      body: { type: UpdateFormationDto },
      responses: {
        200: {
          description: 'Formation updated successfully',
        },
        404: {
          description: 'Formation not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete formation by ID',
        description: 'Delete an existing formation',
      },
      param: {
        name: 'id',
        description: 'Formation ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Formation deleted successfully',
        },
        404: {
          description: 'Formation not found',
        },
      },
    },
  },
};
