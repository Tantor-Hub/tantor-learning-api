import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class AttributeRoleDto {
    @IsNumber()
    @IsNotEmpty()
    id_role: number;

    @IsNumber()
    @IsNotEmpty()
    id_user: number;

    @IsString()
    @IsOptional()
    description?: string;
}