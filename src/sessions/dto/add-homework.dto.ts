import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';

export class AddHomeworkSessionDto {
    
    @IsNumberString()
    id_session: number;

    @IsNumberString()
    homework_date_on: number;

    @IsOptional()
    @IsNumber()
    id_formation?: string;

    @IsOptional()
    @IsString()
    piece_jointe: string;
};