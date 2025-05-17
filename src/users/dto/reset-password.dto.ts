import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    verification_code: string;

    @IsString()
    @IsNotEmpty()
    new_password: string;

    @IsString()
    @IsOptional()
    repet_new_password: string;

    @IsString()
    @IsOptional()
    description?: string
}