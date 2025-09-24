import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Module de Formation DTOs with Swagger decorators
export class CreateModuledeformationDto {
  @ApiProperty({
    example: 'Advanced JavaScript',
    description: 'Title of the module de formation',
  })
  title: string;

  @ApiProperty({
    example: 'Advanced concepts in JavaScript development',
    description: 'Description of the module de formation',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this module belongs to',
  })
  id_formation: number;

  @ApiProperty({
    example: 20,
    description: 'Duration in hours',
  })
  duree: number;

  @ApiProperty({
    example: 1,
    description: 'Order/sequence of the module',
  })
  ordre: number;
}

export class UpdateModuledeformationDto {
  @ApiProperty({
    example: 'Updated Advanced JavaScript',
    description: 'Title of the module de formation',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 'Updated advanced concepts in JavaScript development',
    description: 'Description of the module de formation',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this module belongs to',
    required: false,
  })
  id_formation?: number;

  @ApiProperty({
    example: 20,
    description: 'Duration in hours',
    required: false,
  })
  duree?: number;

  @ApiProperty({
    example: 1,
    description: 'Order/sequence of the module',
    required: false,
  })
  ordre?: number;
}

// Module de Formation Controller Swagger Configuration
export const ModuleDeFormationSwagger = {
  controller: {
    tag: 'ModuleDeFormation',
    bearerAuth: true,
  },

  methods: {
    findAll: {
      operation: {
        summary: 'Get all modules de formation',
        description: 'Retrieve all modules de formation',
      },
      responses: {
        200: {
          description: 'Modules de formation retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get module de formation by ID',
        description: 'Retrieve a specific module de formation by its ID',
      },
      param: {
        name: 'id',
        description: 'Module de Formation ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Module de formation retrieved successfully',
        },
        404: {
          description: 'Module de formation not found',
        },
      },
    },

    create: {
      operation: {
        summary: 'Create a new module de formation',
        description: 'Create a new module de formation',
      },
      body: { type: CreateModuledeformationDto },
      responses: {
        201: {
          description: 'Module de formation created successfully',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update module de formation by ID',
        description: 'Update an existing module de formation',
      },
      param: {
        name: 'id',
        description: 'Module de Formation ID',
        type: 'string',
      },
      body: { type: UpdateModuledeformationDto },
      responses: {
        200: {
          description: 'Module de formation updated successfully',
        },
        404: {
          description: 'Module de formation not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete module de formation by ID',
        description: 'Delete an existing module de formation',
      },
      param: {
        name: 'id',
        description: 'Module de Formation ID',
        type: 'string',
      },
      responses: {
        200: {
          description: 'Module de formation deleted successfully',
        },
        404: {
          description: 'Module de formation not found',
        },
      },
    },
  },
};
