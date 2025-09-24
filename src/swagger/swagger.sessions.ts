import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Sessions DTOs with Swagger decorators
export class CreateSessionDto {
  @ApiProperty({
    example: 'Formation JavaScript Avancé',
    description: 'Session title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'Formation ID',
    required: false,
  })
  id_formation?: number;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Session UUID',
    required: false,
  })
  uuid?: string;

  @ApiProperty({
    example: 2,
    description: 'Number of participants',
    required: false,
  })
  nb_participants?: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Session start date',
    required: false,
  })
  date_debut?: string;

  @ApiProperty({
    example: 'presentiel',
    description: 'Session mode (presentiel/remote)',
    required: false,
  })
  mode?: string;

  @ApiProperty({
    example: 'CPF',
    description: 'Payment method',
    required: false,
  })
  methode_payement?: string;

  @ApiProperty({
    example: 1,
    description: 'Formateur ID',
    required: false,
  })
  id_formateur?: number;

  @ApiProperty({
    example: 20,
    description: 'Session duration in hours',
    required: false,
  })
  duree?: number;

  @ApiProperty({
    example: 1,
    description: 'Course ID',
    required: false,
  })
  id_cours?: number;

  @ApiProperty({
    example: '2024-03-01',
    description: 'Registration start date',
    required: false,
  })
  date_ouverture_inscription?: string;

  @ApiProperty({
    example: '2024-03-31',
    description: 'Registration end date',
    required: false,
  })
  date_fermeture_inscription?: string;

  @ApiProperty({
    example: 'Advanced JavaScript training session',
    description: 'Session description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1500,
    description: 'Session price',
    required: false,
  })
  prix?: number;
}

export class UpdateSessionDto {
  @ApiProperty({
    example: 'Updated Formation JavaScript Avancé',
    description: 'Session title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'Formation ID',
    required: false,
  })
  id_formation?: number;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Session UUID',
    required: false,
  })
  uuid?: string;

  @ApiProperty({
    example: 2,
    description: 'Number of participants',
    required: false,
  })
  nb_participants?: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Session start date',
    required: false,
  })
  date_debut?: string;

  @ApiProperty({
    example: 'presentiel',
    description: 'Session mode (presentiel/remote)',
    required: false,
  })
  mode?: string;

  @ApiProperty({
    example: 'CPF',
    description: 'Payment method',
    required: false,
  })
  methode_payement?: string;

  @ApiProperty({
    example: 1,
    description: 'Formateur ID',
    required: false,
  })
  id_formateur?: number;

  @ApiProperty({
    example: 20,
    description: 'Session duration in hours',
    required: false,
  })
  duree?: number;

  @ApiProperty({
    example: 1,
    description: 'Course ID',
    required: false,
  })
  id_cours?: number;

  @ApiProperty({
    example: '2024-03-01',
    description: 'Registration start date',
    required: false,
  })
  date_ouverture_inscription?: string;

  @ApiProperty({
    example: '2024-03-31',
    description: 'Registration end date',
    required: false,
  })
  date_fermeture_inscription?: string;

  @ApiProperty({
    example: 'Updated Advanced JavaScript training session',
    description: 'Session description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1500,
    description: 'Session price',
    required: false,
  })
  prix?: number;
}

// Sessions Controller Swagger Configuration
export const SessionsSwagger = {
  controller: {
    tag: 'Sessions',
    bearerAuth: true,
  },

  methods: {
    findAll: {
      operation: {
        summary: 'Get all sessions',
        description: 'Retrieve all training sessions',
      },
      responses: {
        200: {
          description: 'Sessions retrieved successfully',
        },
      },
    },

    findOne: {
      operation: {
        summary: 'Get session by ID',
        description: 'Retrieve a specific session by its ID',
      },
      param: {
        name: 'id',
        description: 'Session ID',
        type: 'number',
      },
      responses: {
        200: {
          description: 'Session retrieved successfully',
        },
        404: {
          description: 'Session not found',
        },
      },
    },

    create: {
      operation: {
        summary: 'Create a new session',
        description: 'Create a new training session',
      },
      body: { type: CreateSessionDto },
      responses: {
        201: {
          description: 'Session created successfully',
        },
      },
    },

    update: {
      operation: {
        summary: 'Update session by ID',
        description: 'Update an existing session',
      },
      param: {
        name: 'id',
        description: 'Session ID',
        type: 'number',
      },
      body: { type: UpdateSessionDto },
      responses: {
        200: {
          description: 'Session updated successfully',
        },
        404: {
          description: 'Session not found',
        },
      },
    },

    remove: {
      operation: {
        summary: 'Delete session by ID',
        description: 'Delete an existing session',
      },
      param: {
        name: 'id',
        description: 'Session ID',
        type: 'number',
      },
      responses: {
        200: {
          description: 'Session deleted successfully',
        },
        404: {
          description: 'Session not found',
        },
      },
    },
  },
};
