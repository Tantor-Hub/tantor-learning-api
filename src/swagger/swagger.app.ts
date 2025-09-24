import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// App Controller Swagger Configuration
export const AppSwagger = {
  controller: {
    tag: 'App',
    bearerAuth: false, // Public endpoint
  },

  methods: {
    getHello: {
      operation: {
        summary: 'Get hello message',
        description: 'Returns a welcome message from the API',
      },
      responses: {
        200: {
          description: 'Welcome message retrieved successfully',
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Hello World!' },
            },
          },
        },
      },
    },
  },
};
