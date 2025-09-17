import { Transform, Type } from 'class-transformer';
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

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsNumberString()
  id_controleur?: number;

  @IsOptional()
  @IsNumberString()
  id_superviseur?: number;

  @IsNumberString()
  @IsOptional()
  id_formation: number;

  @IsOptional()
  @IsString()
  piece_jointe?: string;

  @IsEnum(['onLine', 'visionConference', 'presentiel', 'hybride'])
  @IsOptional()
  type_formation:
    | string
    | 'onLine'
    | 'visionConference'
    | 'presentiel'
    | 'hybride';

  @IsNumberString()
  @IsOptional()
  id_category: number;

  @IsNumberString()
  @IsOptional()
  id_thematic: number;

  @IsDateString()
  @IsOptional()
  // @IsISO8601()
  // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
  date_session_debut: Date | string | any;

  @IsDateString()
  @IsOptional()
  // @IsISO8601()
  // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
  date_session_fin: Date | string | any;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumberString()
  prix?: number;
}
