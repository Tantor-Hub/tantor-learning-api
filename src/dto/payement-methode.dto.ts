import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsCreditCard,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreatePaymentSessionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  session_id: number;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsCreditCard()
  @IsOptional()
  card_number?: string;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  cvv?: number;

  @IsString()
  @IsOptional()
  id_stripe_payment?: string;

  @IsUrl()
  @IsNotEmpty()
  callback: string;
}
