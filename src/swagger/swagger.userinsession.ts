import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

export const userInSessionSwagger = {
  create: {
    operation: {
      summary: 'Create a new user in session',
      description: `
**CreateUserInSessionDto Structure:**
\`\`\`typescript
{
  id_session: string;                    // Required - Training session ID
  status?: UserInSessionStatus;          // Optional - User status (default: pending)
  id_user: string;                       // Required - User ID
}
\`\`\`
      `,
    },
    responses: {
      201: {
        description: 'User in session created successfully.',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 201 },
            message: {
              type: 'string',
              example: 'User in session created successfully',
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                id_session: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                },
                status: {
                  type: 'string',
                  enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                  example: 'pending',
                },
                id_user: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440001',
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                trainingSession: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    nb_places: { type: 'number' },
                    available_places: { type: 'number' },
                    begining_date: { type: 'string', format: 'date-time' },
                    ending_date: { type: 'string', format: 'date-time' },
                  },
                },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    firstName: { type: 'string' },
                    lastname: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    otp: { type: 'string' },
                    otp_expires_at: { type: 'string', format: 'date-time' },
                    password: { type: 'string' },
                    reset_token: { type: 'string' },
                    reset_token_expires_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      404: {
        description: 'Training session or user not found.',
      },
      400: {
        description: 'User already in session or no available places.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  createFreeSession: {
    operation: {
      summary: 'Create UserInSession for free training session',
      description: `
# 🆓 Free Training Session Enrollment

**Creates a UserInSession for training sessions with price 0 (student access)**

## 📋 Process
1. **Validate Training Session**: Checks if session exists and has price 0
2. **Check Existing Enrollment**: Prevents duplicate enrollments
3. **Create UserInSession**: Creates enrollment record with IN status
4. **Reduce Available Places**: Updates session capacity
5. **Send Confirmation**: Sends enrollment confirmation email

## 🎯 Use Cases
- Free training sessions
- Student access programs
- Complimentary courses
- Trial sessions

## 📊 Request Body
\`\`\`json
{
  "id_session": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

## ✅ Response
\`\`\`json
{
  "status": 201,
  "data": {
    "id": "userinsession-id",
    "id_user": "user-id",
    "id_session": "session-id",
    "status": "IN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Inscription gratuite créée avec succès"
}
\`\`\`

## ❌ Error Handling
- **Session Not Found**: Returns 404 if session doesn't exist
- **Not Free Session**: Returns 400 if session price is not 0
- **Already Enrolled**: Returns 400 if user already enrolled
- **No Available Places**: Returns 400 if session is full
      `,
    },
    responses: {
      201: {
        description: 'Free session enrollment created successfully',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 201 },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'userinsession-id' },
                id_user: { type: 'string', example: 'user-id' },
                id_session: {
                  type: 'string',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                },
                status: { type: 'string', example: 'IN' },
                createdAt: {
                  type: 'string',
                  example: '2024-01-01T00:00:00.000Z',
                },
                updatedAt: {
                  type: 'string',
                  example: '2024-01-01T00:00:00.000Z',
                },
              },
            },
            message: {
              type: 'string',
              example: 'Inscription gratuite créée avec succès',
            },
          },
        },
      },
      400: {
        description: 'Bad request - session not free or already enrolled',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 400 },
            data: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: "Cette session de formation n'est pas gratuite",
                },
              },
            },
            message: {
              type: 'string',
              example: "Impossible de s'inscrire à cette session",
            },
          },
        },
      },
      404: {
        description: 'Training session not found',
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
      },
    },
  },

  findAll: {
    operation: {
      summary: 'Get all users in sessions (Root endpoint)',
      description:
        'Retrieve all user-session relationships. This is the main endpoint for getting all user sessions.',
    },
    responses: {
      200: {
        description: 'Users in sessions retrieved successfully.',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 200 },
            message: {
              type: 'string',
              example: 'Users in sessions retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  id_session: { type: 'string', format: 'uuid' },
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                  },
                  id_user: { type: 'string', format: 'uuid' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  trainingSession: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      nb_places: { type: 'number' },
                      available_places: { type: 'number' },
                      begining_date: { type: 'string', format: 'date-time' },
                      ending_date: { type: 'string', format: 'date-time' },
                    },
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastname: { type: 'string' },
                      email: { type: 'string' },
                      phone: { type: 'string' },
                      otp: { type: 'string' },
                      otp_expires_at: { type: 'string', format: 'date-time' },
                      password: { type: 'string' },
                      reset_token: { type: 'string' },
                      reset_token_expires_at: {
                        type: 'string',
                        format: 'date-time',
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findAllAdmin: {
    operation: {
      summary: 'Get all users in sessions (Admin access only)',
      description:
        'Retrieve all user-session relationships. Admin-only endpoint for getting all user sessions.',
    },
    responses: {
      200: {
        description: 'Users in sessions retrieved successfully (Admin access)',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 200 },
            message: {
              type: 'string',
              example:
                'Users in sessions retrieved successfully (Admin access)',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  id_session: { type: 'string', format: 'uuid' },
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                  },
                  id_user: { type: 'string', format: 'uuid' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  trainingSession: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      nb_places: { type: 'number' },
                      available_places: { type: 'number' },
                      required_document_before: { type: 'string' },
                      required_document_during: { type: 'string' },
                      required_document_after: { type: 'string' },
                      payment_method: { type: 'string' },
                      cpf_link: { type: 'string' },
                      survey: { type: 'string' },
                      regulation_text: { type: 'string' },
                      begining_date: { type: 'string', format: 'date-time' },
                      ending_date: { type: 'string', format: 'date-time' },
                      trainings: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string' },
                          subtitle: { type: 'string' },
                          trainingtype: { type: 'string' },
                          rnc: { type: 'string' },
                          description: { type: 'string' },
                          requirement: { type: 'string' },
                          pedagogygoals: { type: 'string' },
                          prix: { type: 'number' },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      avatar: { type: 'string', nullable: true },
                      email: { type: 'string' },
                      phone: { type: 'string', nullable: true },
                      verification_code: { type: 'string' },
                      last_login: { type: 'string', format: 'date-time' },
                      is_verified: { type: 'boolean' },
                      num_piece_identite: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      address: { type: 'string', nullable: true },
                      country: { type: 'string', nullable: true },
                      city: { type: 'string', nullable: true },
                      dateBirth: { type: 'string' },
                      role: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Admin role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findAllLegacy: {
    operation: {
      summary: 'Get all users in sessions (Legacy endpoint)',
    },
    responses: {
      200: {
        description: 'Users in sessions retrieved successfully.',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 200 },
            message: {
              type: 'string',
              example: 'Users in sessions retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  id_session: { type: 'string', format: 'uuid' },
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                  },
                  id_user: { type: 'string', format: 'uuid' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  trainingSession: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      nb_places: { type: 'number' },
                      available_places: { type: 'number' },
                      begining_date: { type: 'string', format: 'date-time' },
                      ending_date: { type: 'string', format: 'date-time' },
                    },
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastname: { type: 'string' },
                      email: { type: 'string' },
                      phone: { type: 'string' },
                      otp: { type: 'string' },
                      otp_expires_at: { type: 'string', format: 'date-time' },
                      password: { type: 'string' },
                      reset_token: { type: 'string' },
                      reset_token_expires_at: {
                        type: 'string',
                        format: 'date-time',
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findByUserId: {
    operation: {
      summary: 'Get user sessions by user ID (Student access)',
      description:
        'Retrieve all sessions for the authenticated user. The user ID is automatically extracted from the JWT token.',
    },
    responses: {
      200: {
        description: 'User sessions retrieved successfully.',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 200 },
            message: {
              type: 'string',
              example: 'Opération réussie.',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                    example: 'in',
                  },
                  trainingSession: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: 'd6ff1fd6-f795-47a3-9abd-24d911d06b22',
                      },
                      title: { type: 'string', example: 'hello javascript' },
                      begining_date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-10-09T22:00:00.000Z',
                      },
                      ending_date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-10-30T22:00:00.000Z',
                      },
                    },
                  },
                  training: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', example: 'hello javascript' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Student access required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findByUserIdParam: {
    operation: {
      summary: 'Get user sessions by specific user ID (Student access)',
      description:
        'Retrieve all sessions for a specific user by providing the user ID in the request. This endpoint allows students to query sessions for any user.',
    },
    responses: {
      200: {
        description: 'User sessions retrieved successfully.',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'number', example: 200 },
            message: {
              type: 'string',
              example: 'Opération réussie.',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['refusedpayment', 'notpaid', 'pending', 'in', 'out'],
                    example: 'in',
                  },
                  trainingSession: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        example: 'd6ff1fd6-f795-47a3-9abd-24d911d06b22',
                      },
                      title: { type: 'string', example: 'hello javascript' },
                      begining_date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-10-09T22:00:00.000Z',
                      },
                      ending_date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-10-30T22:00:00.000Z',
                      },
                    },
                  },
                  training: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', example: 'hello javascript' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Student access required.',
      },
      404: {
        description: 'User not found.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findBySessionId: {
    operation: {
      summary: 'Get session participants by session ID',
      description: 'Retrieve all participants for a specific training session.',
    },
    responses: {
      200: {
        description: 'Session participants retrieved successfully.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findByStatus: {
    operation: {
      summary: 'Get users by status',
      description: 'Retrieve all users with a specific status.',
    },
    responses: {
      200: {
        description: 'Users by status retrieved successfully.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  findOne: {
    operation: {
      summary: 'Get a user in session by ID',
    },
    responses: {
      200: {
        description: 'User in session retrieved successfully.',
      },
      404: {
        description: 'User in session not found.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  update: {
    operation: {
      summary: 'Update a user in session',
      description: `
**UpdateUserInSessionDto Structure:**
\`\`\`typescript
{
  id: string;                           // Required (to identify which user in session)
  id_session?: string;                  // Optional
  status?: UserInSessionStatus;         // Optional
  id_user?: string;                     // Optional
}
\`\`\`
      `,
    },
    responses: {
      200: {
        description: 'User in session updated successfully.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      404: {
        description: 'User in session, training session, or user not found.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  remove: {
    operation: {
      summary: 'Delete a user in session',
    },
    responses: {
      200: {
        description: 'User in session deleted successfully.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      404: {
        description: 'User in session not found.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },

  deleteAll: {
    operation: {
      summary: 'Delete all users in sessions',
    },
    responses: {
      200: {
        description: 'All users in sessions deleted successfully.',
      },
      401: {
        description: 'Unauthorized - Secretary role required.',
      },
      500: {
        description: 'Internal server error.',
      },
    },
  },
};
