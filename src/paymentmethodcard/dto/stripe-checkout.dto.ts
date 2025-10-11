import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class StripePaymentIntentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID to get the training price from',
    type: 'string',
  })
  @IsUUID()
  id_session: string;
}
