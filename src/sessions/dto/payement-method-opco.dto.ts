import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, Length, IsOptional, IsNumber } from 'class-validator';

export class PayementOpcoDto {
    @IsOptional()
    @IsString()
    nom_opco: string;

    @IsNotEmpty()
    @IsString()
    nom_entreprise: string;

    @IsNotEmpty()
    @Length(9, 9, { message: 'Le numéro SIREN doit comporter 9 chiffres.' })
    siren: string;

    @IsNotEmpty()
    @IsString()
    nom_responsable: string;

    @IsNotEmpty()
    @IsPhoneNumber('FR')
    telephone_responsable: string;

    @IsNotEmpty()
    @IsEmail()
    email_responsable: string;

    @IsOptional()
    @IsNumber()
    id_user: number; // ou number si tu utilises des IDs numériques

    @IsNumber()
    @IsOptional()
    id_session: number; // ID de la session liée
}

export class CpfPaymentDto {
    @IsNotEmpty()
    @IsString()
    full_name: string;
}