import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    ValidateNested,
    ValidateIf,
    IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from './create-sesion-fulldoc.dto';
import { CreatePaymentSessionDto } from './payement-methode.dto';
import { CpfPaymentDto, PayementOpcoDto } from './payement-method-opco.dto';

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

    @ValidateNested()
    @Type(() => PaymentDto)
    // @IsObject()
    payment: PaymentDto;
}
