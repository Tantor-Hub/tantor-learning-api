import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';
import * as moment from 'moment';

export class CreateSessionDto {
    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    @IsNumberString()
    id_controleur?: number;

    @IsUUID()
    @IsOptional()
    uuid: string;

    @IsOptional()
    @IsNumberString()
    id_superviseur?: number;

    @IsOptional()
    @IsDateString()
    date_mise_a_jour?: Date;

    @IsNumberString()
    id_formation: number;

    @IsOptional()
    @IsString()
    piece_jointe?: string;

    @IsEnum(['onLine', 'visionConference', 'presentiel', 'hybride'])
    type_formation: string;

    @IsNumberString()
    @IsOptional()
    id_category: number;

    @IsNumberString()
    @IsOptional()
    id_thematic: number;

    @IsDateString()
    // @IsISO8601()
    // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
    date_session_debut: Date | string | any;

    @IsDateString()
    // @IsISO8601()
    // @Transform(({ value }) => moment(value, 'DD/MM/YYYY', true).isValid() ? moment(value, 'DD/MM/YYYY').toDate() : null)
    date_session_fin: Date | string | any;

    @IsString()
    @IsOptional()
    description: string;

    @IsOptional()
    @IsNumberString()
    prix?: number;
};