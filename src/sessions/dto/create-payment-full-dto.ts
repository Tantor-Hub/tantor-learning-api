import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    ValidateNested,
    ValidateIf,
    IsDefined,
    IsArray,
    ArrayNotEmpty,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from './create-sesion-fulldoc.dto';
import { CreatePaymentSessionDto } from './payement-methode.dto';
import { CpfPaymentDto, PayementOpcoDto } from './payement-method-opco.dto';

// 👇 Représente une réponse à une question du survey
export class SurveyResponseDto {

    @IsNumber()
    id_question: number;

    @IsString()
    answer: string;

    @IsNumber()
    @IsOptional()
    id_stagiaire_session?: number;
}

export class PaymentDto {
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ValidateIf(o => o.method === PaymentMethod.CARD)
    @ValidateNested()
    @Type(() => CreatePaymentSessionDto)
    card?: CreatePaymentSessionDto;

    @ValidateIf(o => o.method === PaymentMethod.OPCO)
    @ValidateNested()
    @Type(() => PayementOpcoDto)
    opco?: PayementOpcoDto;

    @ValidateIf(o => o.method === PaymentMethod.CPF)
    @ValidateNested()
    @Type(() => CpfPaymentDto)
    cpf?: CpfPaymentDto;
}

export class CreateSessionPaiementDto {
    @IsNumber()
    id_session: number;

    @IsBoolean()
    roi_accepted: boolean;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => SurveyResponseDto)
    responses_survey: SurveyResponseDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => PaymentDto)
    payment: PaymentDto;
}
