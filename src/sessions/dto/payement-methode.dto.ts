import { IsString, IsCreditCard, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PaymentMethodeDto {

    @IsNumber()
    @IsOptional()
    id_user: string;

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsCreditCard()
    card_number: string;

    @IsNotEmpty()
    month: number;

    @IsNotEmpty()
    year: number;

    @IsNotEmpty()
    cvc: number;
}