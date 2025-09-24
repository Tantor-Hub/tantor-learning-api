import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// Stripe DTOs with Swagger decorators
export class PaymentMethodOpcoDto {
  @ApiProperty({
    example: 'pm_card_visa',
    description: 'Stripe payment method ID',
  })
  paymentMethodId: string;

  @ApiProperty({
    example: 1,
    description: 'Session ID',
  })
  id_session: number;

  @ApiProperty({
    example: 'OPCO001',
    description: 'OPCO identifier',
  })
  opco: string;
}

// Stripe Controller Swagger Configuration
export const StripeSwagger = {
  controller: {
    tag: 'Stripe',
    bearerAuth: true,
  },

  methods: {
    createPaymentIntent: {
      operation: {
        summary: 'Create payment intent',
        description: 'Create a Stripe payment intent for session payment',
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 1500 },
            currency: { type: 'string', example: 'eur' },
            id_session: { type: 'number', example: 1 },
          },
        },
      },
      responses: {
        200: {
          description: 'Payment intent created successfully',
          schema: {
            type: 'object',
            properties: {
              clientSecret: { type: 'string', example: 'pi_xxx_secret_xxx' },
            },
          },
        },
      },
    },

    confirmPayment: {
      operation: {
        summary: 'Confirm payment',
        description: 'Confirm a Stripe payment',
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            paymentIntentId: { type: 'string', example: 'pi_xxx' },
          },
        },
      },
      responses: {
        200: {
          description: 'Payment confirmed successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'succeeded' },
            },
          },
        },
      },
    },

    createPaymentMethodOpco: {
      operation: {
        summary: 'Create payment method for OPCO',
        description: 'Create a payment method specifically for OPCO payments',
      },
      body: { type: PaymentMethodOpcoDto },
      responses: {
        201: {
          description: 'OPCO payment method created successfully',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'pm_opco_xxx' },
              opco: { type: 'string', example: 'OPCO001' },
            },
          },
        },
      },
    },

    processOpcoPayment: {
      operation: {
        summary: 'Process OPCO payment',
        description: 'Process payment through OPCO system',
      },
      body: {
        schema: {
          type: 'object',
          properties: {
            id_session: { type: 'number', example: 1 },
            opco: { type: 'string', example: 'OPCO001' },
            amount: { type: 'number', example: 1500 },
          },
        },
      },
      responses: {
        200: {
          description: 'OPCO payment processed successfully',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'processed' },
              reference: { type: 'string', example: 'OPCO_REF_123' },
            },
          },
        },
      },
    },
  },
};
