import { IsOptional, IsString } from 'class-validator';

export class ApresFormationDocsDto {
    @IsOptional()
    @IsString()
    questionnaire_satisfaction?: string;

    @IsOptional()
    @IsString()
    paiement?: string;

    @IsOptional()
    @IsString()
    documents_financeur?: string;

    @IsOptional()
    @IsString()
    fiche_controle_finale?: string;
}
