import { IsString, IsCreditCard, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreatePaymentSessionDto {

    @IsNumber()
    @IsOptional()
    id_user?: number;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    id_session?: number;

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
    // Stripe payment ID
    id_stripe_payment?: string; 

    @IsUrl()
    callback: string;
}