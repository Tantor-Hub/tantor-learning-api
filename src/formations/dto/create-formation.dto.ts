import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { FormationType } from 'src/utils/utiles.typesformations';

export class CreateFormationDto {
  @IsString()
  titre: string;

  @IsString()
  sous_titre: string;

  @IsString()
  @IsOptional()
  id_training?: string;

  @IsNumberString()
  @IsOptional()
  id_thematic?: number;

  @IsEnum(FormationType)
  type_formation: FormationType;

  @IsString()
  description: string;

  @IsString()
  rnc: string;

  @IsString()
  prerequis: string;

  @IsString()
  alternance: string;

  @IsOptional()
  @IsString()
  lien_contenu?: string;

  // @IsOptional()
  @IsNumberString()
  prix: string;

  @IsOptional()
  @IsString()
  duree?: string;

  @IsString()
  @IsOptional()
  start_on?: string;

  @IsString()
  @IsOptional()
  end_on?: string;

  @IsNumberString()
  @IsOptional()
  id_formateur?: number;
}
