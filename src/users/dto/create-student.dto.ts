import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsOptional()
    id?: number;

    @IsOptional()
    uuid?: string;

    @IsNotEmpty()
    @IsString()
    fs_name: string;

    @IsOptional()
    @IsNumber()
    id_role?: number

    @IsNotEmpty()
    @IsString()
    ls_name: string;

    @IsNotEmpty()
    @IsStrongPassword()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    nick_name?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsString()
    verification_code?: string;
}
