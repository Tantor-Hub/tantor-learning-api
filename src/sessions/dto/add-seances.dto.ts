import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsDateString,
  IsInt,
  IsUUID,
  IsDate,
  IsISO8601,
} from 'class-validator';
import { FormationType } from 'src/utils/utiles.typesformations';

export class AddSeanceSessionDto {
  @IsNumberString()
  id_session: number;

  @IsNumberString()
  id_cours: number;

  @IsNumberString()
  duree: number;

  @IsNumberString()
  seance_date_on: number;

  @IsOptional()
  @IsString()
  @IsEnum(FormationType)
  type_seance: FormationType;

  @IsOptional()
  @IsNumber()
  id_formation?: string;

  @IsOptional()
  @IsString()
  piece_jointe: string;
}
