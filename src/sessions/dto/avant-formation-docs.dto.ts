import { IsOptional, IsString } from 'class-validator';

export class AvantFormationDocsDto {
  @IsOptional()
  @IsString()
  carte_identite?: string;

  @IsOptional()
  @IsString()
  contrat_ou_convention?: string;

  @IsOptional()
  @IsString()
  justificatif_domicile?: string;

  @IsOptional()
  @IsString()
  analyse_besoin?: string;

  @IsOptional()
  @IsString()
  formulaire_handicap?: string;

  @IsOptional()
  @IsString()
  convocation?: string;

  @IsOptional()
  @IsString()
  programme?: string;

  @IsOptional()
  @IsString()
  conditions_vente?: string;

  @IsOptional()
  @IsString()
  reglement_interieur?: string;

  @IsOptional()
  @IsString()
  cgv?: string;

  @IsOptional()
  @IsString()
  fiche_controle_initiale?: string;
}
