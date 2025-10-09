import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DeletePaymentMethodCpfDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Payment method CPF ID to delete',
  })
  @IsUUID()
  id: string;
}
