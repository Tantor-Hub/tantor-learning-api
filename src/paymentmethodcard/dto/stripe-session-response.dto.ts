import { ApiProperty } from '@nestjs/swagger';

export class StripePaymentIntentResponseDto {
  @ApiProperty({
    example: 'pi_1234567890abcdef_secret_xyz1234567890',
    description:
      'Stripe Payment Intent client secret. Use this with Stripe.js to confirm the payment on the frontend.',
    type: 'string',
  })
  clientSecret: string;
}

export class StripePaymentIntentStatusDto {
  @ApiProperty({
    example: 'succeeded',
    description:
      'Current payment status from Stripe. Use this to determine if payment was successful or if additional action is required.',
    enum: [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'succeeded',
    ],
    enumName: 'PaymentStatus',
  })
  status: string;

  @ApiProperty({
    example: null,
    description: 'Error code from Stripe if payment failed',
    required: false,
  })
  errorCode?: string;

  @ApiProperty({
    example: null,
    description: 'Human-readable error message for the user',
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    example: null,
    description: 'Detailed error information from Stripe',
    required: false,
  })
  errorDetails?: {
    type: string;
    code: string;
    message: string;
    decline_code?: string;
  };

  @ApiProperty({
    example: false,
    description:
      'Whether the payment requires additional action (3D Secure, etc.)',
    required: false,
  })
  requiresAction?: boolean;

  @ApiProperty({
    example: null,
    description: 'Next action required for the payment (if any)',
    required: false,
  })
  nextAction?: {
    type: string;
    redirectToUrl?: string;
  };
}
