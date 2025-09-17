import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateEvenementDto {
  @IsString()
  titre: string;

  @IsString()
  description: string;

  @IsEnum(['Examen', 'Cours', 'Réunion', 'Autre'], {
    message:
      "type must be one of the following values: 'Examen' | 'Cours' | 'Réunion' | 'Autre'",
  })
  type: 'Examen' | 'Cours' | 'Réunion' | 'Autre';

  @IsOptional()
  @IsNumber()
  id_cibling?: number | null;

  @IsOptional()
  timeline: string[];
}
