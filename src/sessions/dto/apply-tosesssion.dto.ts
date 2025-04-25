import { IsOptional, IsNumberString } from 'class-validator';

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