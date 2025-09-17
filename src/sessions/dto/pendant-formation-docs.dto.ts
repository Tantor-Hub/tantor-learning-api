import { IsOptional, IsString } from 'class-validator';

export class PendantFormationDocsDto {
  @IsOptional()
  @IsString()
  convocation_examen?: string;

  @IsOptional()
  @IsString()
  attestation_formation?: string;

  @IsOptional()
  @IsString()
  certification?: string;

  @IsOptional()
  @IsString()
  fiche_controle_cours?: string;

  @IsOptional()
  @IsString()
  fiches_emargement?: string;
}
