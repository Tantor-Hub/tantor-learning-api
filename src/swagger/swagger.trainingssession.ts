import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateTrainingSessionDto } from '../trainingssession/dto/create-trainingssession.dto';
import { UpdateTrainingSessionDto } from '../trainingssession/dto/update-trainingssession.dto';
import { TrainingSessionResponse } from './swagger.responses';

// TrainingSession Swagger Decorators
export const TrainingSessionApiTags = () => ApiTags('Training Sessions');

export const TrainingSessionCreateApiOperation = () =>
  ApiOperation({
    summary: 'Create a new training session',
    description: `
**CreateTrainingSessionDto Structure:**
\`\`\`typescript
{
  id_trainings: string;           // Required (UUID of the training)
  title: string;                  // Required
  nb_places: number;              // Required (minimum: 1)
  available_places: number;       // Required (minimum: 0)
  required_document_before?: string[];   // Optional
  required_document_during?: string[];   // Optional
  required_document_after?: string[];    // Optional
  payment_method?: string[];      // Optional
  survey?: string[];              // Optional
  regulation_text: string;        // Required
  begining_date: string;          // Required (ISO date string)
  ending_date: string;            // Required (ISO date string)
  cpf_link?: string;              // Optional (CPF link for the session)
}
\`\`\`
    `,
  });

export const TrainingSessionCreateApiBody = () =>
  ApiBody({
    type: CreateTrainingSessionDto,
    examples: {
      example1: {
        summary: 'Basic training session creation',
        value: {
          id_trainings: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Advanced React Development Session',
          nb_places: 30,
          available_places: 25,
          required_document_before: ['CV', 'Diploma', 'ID Card'],
          required_document_during: ['Attendance Sheet', 'Progress Report'],
          required_document_after: ['Certificate Request', 'Feedback Form'],
          payment_method: ['Credit Card', 'Bank Transfer'],
          survey: ['Experience Level', 'Learning Goals'],
          regulation_text:
            'This training session follows our standard regulations and policies.',
          begining_date: '2024-03-15T09:00:00.000Z',
          ending_date: '2024-03-20T17:00:00.000Z',
        },
      },
      example2: {
        summary: 'Minimal training session creation',
        value: {
          id_trainings: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Basic JavaScript Workshop',
          nb_places: 20,
          available_places: 20,
          regulation_text: 'Standard workshop regulations apply.',
          begining_date: '2024-04-01T10:00:00.000Z',
          ending_date: '2024-04-01T16:00:00.000Z',
        },
      },
    },
  });

export const TrainingSessionFindAllApiOperation = () =>
  ApiOperation({
    summary: 'Get all training sessions',
    description:
      'Retrieve all training sessions with their associated training information.',
  });

export const TrainingSessionFindByTrainingIdApiOperation = () =>
  ApiOperation({
    summary: 'Get training sessions by training ID',
    description: 'Retrieve all training sessions for a specific training.',
  });

export const TrainingSessionFindByTrainingIdApiParam = () =>
  ApiParam({
    name: 'trainingId',
    description: 'Training ID to get sessions for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  });

export const TrainingSessionFindOneApiOperation = () =>
  ApiOperation({
    summary: 'Get training session by ID',
    description: 'Retrieve a specific training session by its ID.',
  });

export const TrainingSessionFindOneApiParam = () =>
  ApiParam({
    name: 'id',
    description: 'Training session ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  });

export const TrainingSessionUpdateApiOperation = () =>
  ApiOperation({
    summary: 'Update a training session',
    description: `
**UpdateTrainingSessionDto Structure:**
\`\`\`typescript
{
  id: string;                     // Required (to identify which training session)
  id_trainings?: string;          // Optional (same as create)
  title?: string;                 // Optional (same as create)
  nb_places?: number;             // Optional (same as create)
  available_places?: number;      // Optional (same as create)
  required_document_before?: string[];   // Optional (same as create)
  required_document_during?: string[];   // Optional (same as create)
  required_document_after?: string[];    // Optional (same as create)
  payment_method?: string[];      // Optional (same as create)
  survey?: string[];              // Optional (same as create)
  regulation_text?: string;       // Optional (same as create)
  begining_date?: string;         // Optional (same as create)
  ending_date?: string;           // Optional (same as create)
}
\`\`\`

Update an existing training session with the provided data. You can update any or all fields - only the fields provided in the request body will be updated.
    `,
  });

export const TrainingSessionUpdateApiBody = () =>
  ApiBody({
    type: UpdateTrainingSessionDto,
    examples: {
      example1: {
        summary: 'Update training session title and available places',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Updated Advanced React Development Session',
          available_places: 20,
        },
      },
      example2: {
        summary: 'Update training session dates',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          begining_date: '2024-03-20T09:00:00.000Z',
          ending_date: '2024-03-25T17:00:00.000Z',
        },
      },
      example3: {
        summary: 'Update required documents',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          required_document_before: [
            'CV',
            'Diploma',
            'ID Card',
            'Cover Letter',
          ],
          required_document_during: [
            'Attendance Sheet',
            'Progress Report',
            'Assignment Submissions',
          ],
          required_document_after: [
            'Certificate Request',
            'Feedback Form',
            'Final Project',
          ],
        },
      },
    },
  });

export const TrainingSessionDeleteApiOperation = () =>
  ApiOperation({
    summary: 'Delete a training session',
    description: 'Delete a specific training session by its ID.',
  });

export const TrainingSessionDeleteApiParam = () =>
  ApiParam({
    name: 'id',
    description: 'Training session ID to delete',
    example: '550e8400-e29b-41d4-a716-446655440001',
  });

// Response decorators
export const TrainingSessionCreateApiResponse = () =>
  ApiResponse({
    status: 201,
    description: 'Training session created successfully',
    type: TrainingSessionResponse,
  });

export const TrainingSessionFindAllApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'Training sessions retrieved successfully',
    type: [TrainingSessionResponse],
  });

export const TrainingSessionFindByTrainingIdApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'Training sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Training sessions retrieved successfully',
          description: 'Response message',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
                description: 'Training session ID',
              },
              id_trainings: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
                description: 'Training ID that this session belongs to',
              },
              title: {
                type: 'string',
                example: 'Advanced React Development Session',
                description: 'Title of the training session',
              },
              nb_places: {
                type: 'number',
                example: 30,
                description: 'Total number of places available',
              },
              available_places: {
                type: 'number',
                example: 25,
                description: 'Number of available places',
              },
              required_document_before: {
                type: 'array',
                items: { type: 'string' },
                example: ['CV', 'Diploma', 'ID Card'],
                description: 'List of required documents before training',
              },
              required_document_during: {
                type: 'array',
                items: { type: 'string' },
                example: ['Attendance Sheet', 'Progress Report'],
                description: 'List of required documents during training',
              },
              required_document_after: {
                type: 'array',
                items: { type: 'string' },
                example: ['Certificate Request', 'Feedback Form'],
                description: 'List of required documents after training',
              },
              payment_method: {
                type: 'array',
                items: { type: 'string' },
                example: ['Credit Card', 'Bank Transfer', 'OPCO'],
                description: 'List of accepted payment methods',
              },
              survey: {
                type: 'array',
                items: { type: 'string' },
                example: ['Experience Level', 'Learning Goals', 'Availability'],
                description: 'List of survey questions',
              },
              regulation_text: {
                type: 'string',
                example:
                  'This training session follows our standard regulations and policies.',
                description: 'Regulation text for the training session',
              },
              begining_date: {
                type: 'string',
                format: 'date-time',
                example: '2024-03-15T09:00:00.000Z',
                description: 'Beginning date and time of the training session',
              },
              ending_date: {
                type: 'string',
                format: 'date-time',
                example: '2024-03-20T17:00:00.000Z',
                description: 'Ending date and time of the training session',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:13:47.000Z',
                description: 'Creation timestamp',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-25T10:13:47.000Z',
                description: 'Last update timestamp',
              },
              trainings: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    example: 'Advanced React Development',
                    description: 'Training title',
                  },
                  subtitle: {
                    type: 'string',
                    example: 'Learn advanced React concepts',
                    description: 'Training subtitle',
                  },
                  description: {
                    type: 'string',
                    example:
                      'This comprehensive training covers advanced React concepts including hooks, context, performance optimization, and modern development practices.',
                    description: 'Training description',
                  },
                },
                description: 'Associated training information',
              },
            },
          },
          description: 'Array of training sessions',
        },
      },
      example: {
        status: 200,
        message: 'Training sessions retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            id_trainings: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Advanced React Development Session',
            nb_places: 30,
            available_places: 25,
            required_document_before: ['CV', 'Diploma', 'ID Card'],
            required_document_during: ['Attendance Sheet', 'Progress Report'],
            required_document_after: ['Certificate Request', 'Feedback Form'],
            payment_method: ['Credit Card', 'Bank Transfer'],
            survey: ['Experience Level', 'Learning Goals'],
            regulation_text:
              'This training session follows our standard regulations and policies.',
            begining_date: '2024-03-15T09:00:00.000Z',
            ending_date: '2024-03-20T17:00:00.000Z',
            createdAt: '2025-01-25T10:13:47.000Z',
            updatedAt: '2025-01-25T10:13:47.000Z',
            trainings: {
              title: 'Advanced React Development',
              subtitle: 'Learn advanced React concepts',
              description:
                'This comprehensive training covers advanced React concepts including hooks, context, performance optimization, and modern development practices.',
            },
          },
        ],
      },
    },
  });

export const TrainingSessionFindOneApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'Training session retrieved successfully',
    type: TrainingSessionResponse,
  });

export const TrainingSessionUpdateApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'Training session updated successfully',
    type: TrainingSessionResponse,
  });

export const TrainingSessionDeleteApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'Training session deleted successfully',
    schema: {
      example: {
        status: 200,
        data: { id: '550e8400-e29b-41d4-a716-446655440001' },
        message: 'Training session deleted successfully',
      },
    },
  });

// Error response decorators
export const TrainingSessionBadRequestApiResponse = () =>
  ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
    schema: {
      example: {
        status: 400,
        data: 'Available places cannot exceed total places',
        message: 'Requête invalide',
      },
    },
  });

export const TrainingSessionNotFoundApiResponse = () =>
  ApiResponse({
    status: 404,
    description: 'Training session not found',
    schema: {
      example: {
        status: 404,
        data: 'Training session not found',
        message: 'Ressource introuvable',
      },
    },
  });

export const TrainingSessionTrainingNotFoundApiResponse = () =>
  ApiResponse({
    status: 404,
    description: 'Training not found',
    schema: {
      example: {
        status: 404,
        data: 'Training not found',
        message: 'Ressource introuvable',
      },
    },
  });

export const TrainingSessionInternalServerErrorApiResponse = () =>
  ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: { message: 'Error message' },
        message: 'Erreur interne du serveur',
      },
    },
  });
