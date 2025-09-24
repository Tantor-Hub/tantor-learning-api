import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// CMS DTOs with Swagger decorators
export class CreateNewsLetterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address for newsletter subscription',
  })
  email: string;
}

// CMS Controller Swagger Configuration
export const CMSSwagger = {
  controller: {
    tag: 'CMS',
    bearerAuth: false, // Public endpoints for newsletter
  },

  methods: {
    subscribeNewsletter: {
      operation: {
        summary: 'Subscribe to the newsletter',
        description: 'Subscribe an email address to the newsletter',
      },
      body: { type: CreateNewsLetterDto },
      responses: {
        201: {
          description: 'Subscription successful',
        },
        409: {
          description: 'Already subscribed',
        },
      },
    },

    unsubscribeNewsletter: {
      operation: {
        summary: 'Unsubscribe from the newsletter',
        description: 'Unsubscribe an email address from the newsletter',
      },
      body: { type: CreateNewsLetterDto },
      responses: {
        200: {
          description: 'Unsubscription successful',
        },
        404: {
          description: 'Email not found',
        },
      },
    },

    getNewsletterSubscribers: {
      operation: {
        summary: 'Get list of active newsletter subscribers',
        description: 'Retrieve all active newsletter subscribers (Admin only)',
      },
      responses: {
        200: {
          description: 'Newsletter subscribers retrieved successfully',
        },
      },
    },

    getNewsletterSubscribersAdmin: {
      operation: {
        summary: 'Admin: Get list of active newsletter subscribers',
        description:
          'Admin endpoint to retrieve all active newsletter subscribers',
      },
      responses: {
        200: {
          description: 'Newsletter subscribers retrieved successfully',
        },
      },
    },
  },
};
