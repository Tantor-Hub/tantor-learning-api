import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateNewsLetterDto {
    @IsString()
    user_email: string;
}
