import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';

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
    @IsEnum(['onLine', 'visionConference', 'presentiel', 'hybride'])
    type_seance: string;

    @IsOptional()
    @IsNumber()
    id_formation?: string;

    @IsOptional()
    @IsString()
    piece_jointe: string;
};