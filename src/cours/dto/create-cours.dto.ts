import {
    IsString,
    IsOptional,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
} from 'class-validator';

export class CreateCoursDto {

    @IsOptional()
    @IsNumber()
    id_cours: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    is_published?: boolean;

    @IsInt()
    @IsOptional()
    createdBy?: number;

    @IsInt()
    @IsNotEmpty()
    id_category: number;

    @IsInt()
    @IsNotEmpty()
    id_thematic: number;

    @IsInt()
    @IsOptional()
    id_formateur?: number;
}
