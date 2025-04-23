import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    @IsOptional()
    titre: string;

    @IsString()
    @IsOptional()
    sous_titre: string;

    @IsNumberString()
    id_formation: number;

    @IsNumberString()
    @IsOptional()
    id_category: number;

    @IsNumberString()
    @IsOptional()
    id_formateur?: number;

    @IsNumberString()
    @IsOptional()
    id_thematic: number;

    @IsEnum(['onLine', 'visioConference', 'presentiel', 'hybride'])
    @IsOptional()
    type_formation: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    lien_contenu?: string;

    @IsOptional()
    @IsString()
    prix?: number;

    @IsOptional()
    @IsString()
    duree?: string;

    @IsDateString()
    // @IsOptional()
    start_on: string;

    @IsDateString()
    // @IsOptional()
    end_on: string;
};