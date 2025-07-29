import { IsString, IsOptional, IsEnum, IsNumber, IsNumberString, IsDateString, IsInt, IsUUID, IsDate, IsISO8601 } from 'class-validator';

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

    @IsEnum(['onLine', 'visioConference', 'presentiel', 'hybride'])
    @IsOptional()
    type_formation: string;

    @IsEnum(['OPCO', 'CPF', 'CARD'])
    @IsOptional()
    payment_method: string;

    @IsNumberString()
    id_formation: number;

    @IsNumberString()
    nb_places: number;

    @IsNumberString()
    @IsOptional()
    id_category: number;

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