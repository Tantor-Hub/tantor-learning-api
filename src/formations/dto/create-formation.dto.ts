import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString } from 'class-validator';

export class CreateFormationDto {
    @IsString()
    titre: string;

    @IsString()
    sous_titre: string;

    @IsNumberString()
    id_category: number;

    @IsNumberString()
    id_thematic: number;

    @IsEnum(['onLine', 'visioConference', 'presentiel', 'hybride'])
    type_formation: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    lien_contenu?: string;

    // @IsOptional()
    @IsString()
    prix?: number;

    @IsOptional()
    @IsString()
    duree?: string;

    @IsString()
    @IsOptional()
    start_on?: string

    @IsString()
    @IsOptional()
    end_on?: string

    @IsNumberString()
    @IsOptional()
    id_formateur?: number
};