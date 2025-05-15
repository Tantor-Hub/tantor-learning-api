import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';

export class AddSeanceSessionDto {
    
    @IsNumberString()
    id_session: number;

    @IsNumberString()
    duree: number;

    @IsNumber()
    seance_date_on: number;

    @IsOptional()
    @IsNumber()
    type_seance: string;

    @IsOptional()
    @IsNumber()
    id_formation?: string;

    @IsOptional()
    @IsNumber()
    piece_jointe: string;
};