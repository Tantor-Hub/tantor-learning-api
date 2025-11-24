import { PartialType, OmitType } from '@nestjs/swagger';
import { UpdatePaymentMethodOpcoDto } from './update-paymentmethodopco.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaymentMethodOpcoStatus } from 'src/enums/payment-method-opco-status.enum';

export class UpdatePaymentMethodOpcoSecretaryDto extends OmitType(
  UpdatePaymentMethodOpcoDto,
  ['id'] as const,
) {
  @ApiProperty({
    example: 'validated',
    description: 'Updated payment status',
    enum: PaymentMethodOpcoStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethodOpcoStatus)
  status?: PaymentMethodOpcoStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Updated user ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id_user?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the secretary who updated the payment',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;
}

