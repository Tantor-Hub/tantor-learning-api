import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsInt,
    IsDateString,
    IsNumberString,
} from 'class-validator';

export class CreateMessageDto {

    @IsNumberString()
    @IsOptional()
    thread?: string;

    @IsNumberString()
    @IsNotEmpty()
    @IsOptional()
    id_user_sender: number;

    @IsNumberString()
    @IsNotEmpty()
    @IsOptional()
    id_user_receiver?: number;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    date_d_envoie?: Date;

    @IsOptional()
    @IsDateString()
    date_de_lecture?: Date;

    @IsOptional()
    @IsString()
    piece_jointe?: string;

    @IsOptional()
    @IsInt()
    is_readed?: number;

    @IsOptional()
    @IsInt()
    is_replied_to?: number;

    @IsOptional()
    @IsInt()
    status?: number;
}
