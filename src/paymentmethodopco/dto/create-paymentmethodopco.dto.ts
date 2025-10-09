import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { PaymentMethodOpcoStatus } from 'src/enums/payment-method-opco-status.enum';

export class CreatePaymentMethodOpcoDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID that this payment method belongs to',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    example: 'OPCO Mobilités',
    description: 'Name of the OPCO (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  nom_opco?: string;

  @ApiProperty({
    example: 'Entreprise ABC',
    description: 'Company name',
  })
  @IsString()
  nom_entreprise: string;

  @ApiProperty({
    example: '123456789',
    description: 'SIREN number of the company',
  })
  @IsString()
  siren: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: 'Name of the responsible person',
  })
  @IsString()
  nom_responsable: string;

  @ApiProperty({
    example: '0123456789',
    description: 'Phone number of the responsible person',
  })
  @IsString()
  telephone_responsable: string;

  @ApiProperty({
    example: 'jean.dupont@entreprise.com',
    description: 'Email of the responsible person',
  })
  @IsEmail()
  email_responsable: string;
}
