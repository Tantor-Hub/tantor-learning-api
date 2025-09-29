import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateSessionCoursDto } from '../sessioncours/dto/create-sessioncours.dto';
import { UpdateSessionCoursDto } from '../sessioncours/dto/update-sessioncours.dto';

// Create SessionCours
export const SessionCoursCreateApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new session course' }),
    ApiBody({
      type: CreateSessionCoursDto,
      examples: {
        example1: {
          summary: 'Basic session course',
          value: {
            title: 'Advanced React Development',
            description: 'Learn advanced React concepts and best practices',
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            is_published: false,
            id_formateur: ['1', '2'],
          },
        },
        example2: {
          summary: 'Another session course',
          value: {
            title: 'Introduction to JavaScript',
            description: 'Basic JavaScript concepts and fundamentals',
            id_session: '550e8400-e29b-41d4-a716-446655440001',
            is_published: true,
            id_formateur: ['3'],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Session course created successfully',
      schema: {
        example: {
          status: 201,
          message: 'Session course created successfully',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Advanced React Development',
            description: 'Learn advanced React concepts and best practices',
            is_published: false,
            id_formateur: ['1', '2'],
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            createdBy: '550e8400-e29b-41d4-a716-446655440009',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while creating session course',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Get All SessionCours
export const SessionCoursGetAllApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all session courses' }),
    ApiResponse({
      status: 200,
      description: 'Session courses retrieved successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session courses retrieved successfully',
          data: {
            length: 2,
            rows: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Advanced React Development',
                description: 'Learn advanced React concepts and best practices',
                is_published: false,
                id_formateur: ['1', '2'],
                id_session: '550e8400-e29b-41d4-a716-446655440000',
                createdBy: '550e8400-e29b-41d4-a716-446655440009',
                createdAt: '2025-01-25T10:00:00.000Z',
                updatedAt: '2025-01-25T10:00:00.000Z',
                CreatedBy: {
                  id: 1,
                  fs_name: 'John',
                  ls_name: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  title: 'Advanced React Development Session',
                  nb_places: 30,
                  available_places: 25,
                  begining_date: '2024-03-15T09:00:00.000Z',
                  ending_date: '2024-03-20T17:00:00.000Z',
                },
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while retrieving session courses',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Get SessionCours by Session ID
export const SessionCoursFindBySessionIdApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all session courses by session ID' }),
    ApiParam({
      name: 'sessionId',
      description: 'Training session ID',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Session courses retrieved successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session courses retrieved successfully',
          data: {
            length: 2,
            rows: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Advanced React Development',
                description: 'Learn advanced React concepts and best practices',
                is_published: false,
                id_formateur: ['1', '2'],
                createdAt: '2025-01-25T10:00:00.000Z',
                updatedAt: '2025-01-25T10:00:00.000Z',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                title: 'Introduction to JavaScript',
                description: 'Basic JavaScript concepts and fundamentals',
                is_published: true,
                id_formateur: ['3'],
                createdAt: '2025-01-25T10:00:00.000Z',
                updatedAt: '2025-01-25T10:00:00.000Z',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Session not found',
      schema: {
        example: {
          status: 404,
          message: 'Session not found',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while retrieving session courses',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Get SessionCours by Formateur ID
export const SessionCoursFindByFormateurIdApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all session courses by formateur ID' }),
    ApiParam({
      name: 'formateurId',
      description: 'Formateur (trainer/instructor) ID',
      example: '1',
    }),
    ApiResponse({
      status: 200,
      description: 'Session courses retrieved successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session courses retrieved successfully',
          data: {
            length: 2,
            rows: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                title: 'Advanced React Development',
                description: 'Learn advanced React concepts and best practices',
                is_published: false,
                id_formateur: ['1', '2'],
                id_session: '550e8400-e29b-41d4-a716-446655440000',
                createdBy: '550e8400-e29b-41d4-a716-446655440009',
                createdAt: '2025-01-25T10:00:00.000Z',
                updatedAt: '2025-01-25T10:00:00.000Z',
                CreatedBy: {
                  id: 1,
                  fs_name: 'John',
                  ls_name: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  title: 'Advanced React Development Session',
                  nb_places: 30,
                  available_places: 25,
                  begining_date: '2024-03-15T09:00:00.000Z',
                  ending_date: '2024-03-20T17:00:00.000Z',
                },
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                title: 'Introduction to JavaScript',
                description: 'Basic JavaScript concepts and fundamentals',
                is_published: true,
                id_formateur: ['1', '3'],
                id_session: '550e8400-e29b-41d4-a716-446655440001',
                createdBy: '550e8400-e29b-41d4-a716-446655440009',
                createdAt: '2025-01-25T11:00:00.000Z',
                updatedAt: '2025-01-25T11:00:00.000Z',
                CreatedBy: {
                  id: 1,
                  fs_name: 'John',
                  ls_name: 'Doe',
                  email: 'john.doe@example.com',
                },
                trainingSession: {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  title: 'JavaScript Fundamentals Session',
                  nb_places: 25,
                  available_places: 20,
                  begining_date: '2024-03-22T09:00:00.000Z',
                  ending_date: '2024-03-27T17:00:00.000Z',
                },
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message:
              'Internal server error while retrieving session courses by formateur',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Get SessionCours by ID
export const SessionCoursGetByIdApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a session course by ID' }),
    ApiParam({
      name: 'id',
      description: 'Session course ID',
      example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    ApiResponse({
      status: 200,
      description: 'Session course retrieved successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session course retrieved successfully',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Advanced React Development',
            description: 'Learn advanced React concepts and best practices',
            is_published: false,
            id_formateur: ['1', '2'],
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            createdBy: '550e8400-e29b-41d4-a716-446655440009',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T10:00:00.000Z',
            CreatedBy: {
              id: 1,
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
              nb_places: 30,
              available_places: 25,
              begining_date: '2024-03-15T09:00:00.000Z',
              ending_date: '2024-03-20T17:00:00.000Z',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Session course not found',
      schema: {
        example: {
          status: 404,
          data: 'Session course not found',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while fetching session course',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Update SessionCours
export const SessionCoursUpdateApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a session course' }),
    ApiBody({
      type: UpdateSessionCoursDto,
      examples: {
        example1: {
          summary: 'Update session course',
          value: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Updated Advanced React Development',
            description: 'Updated description with new content',
            is_published: true,
            id_formateur: ['1', '3'],
          },
        },
        example2: {
          summary: 'Update only is_published',
          value: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            is_published: true,
          },
        },
        example3: {
          summary: 'Update only id_formateur',
          value: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            id_formateur: ['2', '4'],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Session course updated successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session course updated successfully',
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            title: 'Updated Advanced React Development',
            description: 'Updated description with new content',
            is_published: true,
            id_formateur: ['1', '3'],
            id_session: '550e8400-e29b-41d4-a716-446655440000',
            createdBy: '550e8400-e29b-41d4-a716-446655440009',
            createdAt: '2025-01-25T10:00:00.000Z',
            updatedAt: '2025-01-25T11:00:00.000Z',
            CreatedBy: {
              id: 1,
              fs_name: 'John',
              ls_name: 'Doe',
              email: 'john.doe@example.com',
            },
            trainingSession: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Advanced React Development Session',
              nb_places: 30,
              available_places: 25,
              begining_date: '2024-03-15T09:00:00.000Z',
              ending_date: '2024-03-20T17:00:00.000Z',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Session course not found',
      schema: {
        example: {
          status: 404,
          data: 'Session course not found',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - insufficient permissions',
      schema: {
        example: {
          status: 403,
          data: 'You do not have permission to update this session course',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while updating session course',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );

// Delete SessionCours
export const SessionCoursDeleteApiResponse = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a session course' }),
    ApiParam({
      name: 'id',
      description: 'Session course ID',
      example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    ApiResponse({
      status: 200,
      description: 'Session course deleted successfully',
      schema: {
        example: {
          status: 200,
          message: 'Session course deleted successfully',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Session course not found',
      schema: {
        example: {
          status: 404,
          data: 'Session course not found',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - insufficient permissions',
      schema: {
        example: {
          status: 403,
          data: 'You do not have permission to delete this session course',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        example: {
          status: 500,
          data: {
            message: 'Internal server error while deleting session course',
            errorType: 'SequelizeDatabaseError',
            errorMessage: 'Error message',
            timestamp: '2025-01-25T10:00:00.000Z',
          },
        },
      },
    }),
  );
