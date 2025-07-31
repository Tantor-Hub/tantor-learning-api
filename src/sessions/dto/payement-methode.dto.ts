import { IsString, IsCreditCard, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentSessionDto {

    @IsNumber()
    @IsOptional()
    id_user?: number;

    @IsNumber()
    @IsOptional()
    @IsNotEmpty()
    id_session?: number;

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsCreditCard()
    card_number: string;

    @IsNotEmpty()
    @IsNumber()
    month: number;

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsNumber()
    cvv: number;

    @IsString()
    id_stripe_payment: string; // Optional field for Stripe payment ID
}