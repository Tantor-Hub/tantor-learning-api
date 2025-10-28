import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreatePaymentMethodCardDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID that this payment method belongs to',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    example: 'pi_1234567890abcdef',
    description:
      'Stripe Payment Intent ID (required - payment will be validated)',
    required: true,
  })
  @IsString()
  stripe_payment_intent_id: string;
}
