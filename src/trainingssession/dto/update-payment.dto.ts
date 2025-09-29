import { IsOptional, IsArray, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'Training session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Array of payment methods accepted for this training session',
    example: ['Credit Card', 'Bank Transfer', 'PayPal', 'Cash'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payment_method?: string[];

  @ApiProperty({
    description: 'CPF link for payment processing',
    example: 'https://cpf.example.com/payment-link',
    required: false,
  })
  @IsOptional()
  @IsString()
  cpf_link?: string;
}
