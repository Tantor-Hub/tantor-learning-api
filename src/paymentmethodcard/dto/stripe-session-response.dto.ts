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
}
