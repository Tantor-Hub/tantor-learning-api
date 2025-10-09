import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethodCpfStatus } from 'src/enums/payment-method-cpf-status.enum';

export class CreatePaymentMethodCpfDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID that this payment method belongs to',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    example: 'pending',
    description: 'Payment status',
    enum: PaymentMethodCpfStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethodCpfStatus)
  status?: PaymentMethodCpfStatus;
}
