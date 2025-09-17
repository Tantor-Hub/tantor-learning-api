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

export class ApplySessionDto {
  @IsNumber()
  id_session: number;

  @IsOptional()
  @IsNumber()
  id_user?: number;

  @IsOptional()
  @IsNumber()
  id_formation?: string;
}
