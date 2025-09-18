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
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    example: 'Formation JavaScript Avancé',
    description: 'Session designation',
    default: 'Formation JavaScript Avancé',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({
    example: 1,
    description: 'Controller ID',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  id_controleur?: number;

  @ApiProperty({
    example: 'uuid-string',
    description: 'Session UUID',
    default: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  uuid: string;

  @ApiProperty({
    example: 2,
    description: 'Supervisor ID',
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  id_superviseur?: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Update date',
    default: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  date_mise_a_jour?: Date;

  @ApiProperty({
    example: 'presentiel',
    description: 'Training type',
    enum: ['onLine', 'visioConference', 'presentiel', 'hybride'],
    default: 'presentiel',
  })
  @IsEnum(['onLine', 'visioConference', 'presentiel', 'hybride'])
  @IsOptional()
  type_formation: string;

  @ApiProperty({
    example: 'CPF',
    description: 'Payment method',
    enum: ['OPCO', 'CPF', 'CARD'],
    default: 'CPF',
  })
  @IsEnum(['OPCO', 'CPF', 'CARD'])
  @IsOptional()
  payment_method: string;

  @ApiProperty({
    example: 1,
    description: 'Formation ID',
    default: 1,
  })
  @IsNumber()
  id_formation: number;

  @ApiProperty({
    example: 20,
    description: 'Number of places',
    default: 20,
  })
  @IsNumber()
  nb_places: number;

  @ApiProperty({
    example: 1,
    description: 'Category ID',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  id_category: number;

  @ApiProperty({
    example: '2024-03-01',
    description: 'Session start date',
    default: '2024-03-01',
  })
  @IsDateString()
  // @IsISO8601()
  // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
  date_session_debut: Date | string | any;

  @ApiProperty({
    example: '2024-03-31',
    description: 'Session end date',
    default: '2024-03-31',
  })
  @IsDateString()
  // @IsISO8601()
  // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
  date_session_fin: Date | string | any;

  @ApiProperty({
    example: 'Advanced JavaScript training session',
    description: 'Session description',
    default: 'Advanced JavaScript training session',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 1500,
    description: 'Session price',
    default: 1500,
  })
  @IsOptional()
  @IsNumber()
  prix?: number;
}
