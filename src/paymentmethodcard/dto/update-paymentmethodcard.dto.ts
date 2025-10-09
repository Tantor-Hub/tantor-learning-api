import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodCardDto } from './create-paymentmethodcard.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethodCardStatus } from 'src/enums/payment-method-card-status.enum';

export class UpdatePaymentMethodCardDto extends PartialType(
  CreatePaymentMethodCardDto,
) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Payment method card ID to update',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'validated',
    description: 'Updated payment status',
    enum: PaymentMethodCardStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethodCardStatus)
  status?: PaymentMethodCardStatus;
}
