import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodCpfDto } from './create-paymentmethodcpf.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethodCpfStatus } from 'src/enums/payment-method-cpf-status.enum';

export class UpdatePaymentMethodCpfDto extends PartialType(
  CreatePaymentMethodCpfDto,
) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Payment method CPF ID to update',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'validated',
    description: 'Updated payment status',
    enum: PaymentMethodCpfStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethodCpfStatus)
  status?: PaymentMethodCpfStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the secretary who updated the payment',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;
}
