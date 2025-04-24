import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';

export class ApplySessionDto {
    
    @IsNumberString()
    id_session: string;

    @IsOptional()
    @IsNumberString()
    id_user?: number;

    @IsOptional()
    @IsNumberString()
    id_formation?: string;

};