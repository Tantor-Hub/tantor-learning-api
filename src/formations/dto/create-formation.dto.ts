import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateFormationDto {
    @IsString()
    titre: string;

    @IsString()
    sousTitre: string;

    @IsEnum(['onLine', 'visioConference', 'presentiel', 'hybride'])
    type: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    lien_contenu?: string;
}