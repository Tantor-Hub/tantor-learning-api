import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class StripePaymentIntentDto {
  @ApiProperty({
    example: 15000,
    description:
      'Amount to pay in cents (smallest currency unit). Example: 15000 = 150.00 EUR, 2500 = 25.00 EUR',
    minimum: 50,
    maximum: 99999999,
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @Min(50, { message: 'Amount must be at least 50 cents (0.50 EUR)' })
  amount: number;
}
