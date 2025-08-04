import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    registerDecorator,
    ValidateNested,
    ValidationArguments,
    ValidationOptions
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionSurveyDto } from './create-question.dto';
import { DocumentKeyEnum, RequiredDocument } from 'src/utils/utiles.documentskeyenum';

function IsValidRequiredDocuments(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsValidRequiredDocuments',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any[], args: ValidationArguments) {
                    if (!Array.isArray(value)) return false;
                    return value.every((val) => Object.values(RequiredDocument).includes(val));
                },
                defaultMessage(args: ValidationArguments) {
                    const value = args.value as string[];
                    const invalids = value.filter(
                        (val) => !Object.values(RequiredDocument).includes(val as RequiredDocument),
                    );
                    return `The document name ${invalids.join(', ')} is invalid. Valid documents are: ${Object.values(RequiredDocument).join(', ')}.`;
                },
            },
        });
    };
}

export enum QuestionType {
    QCM = 'QCM',
    QCU = 'QCU',
    TXT = 'TXT'
}

export enum PaymentMethod {
    OPCO = 'OPCO',
    CPF = 'CPF',
    CARD = 'CARD'
}
export class CreateSessionFullStepDto {
    @IsInt()
    id_formation: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    date_session_debut: string;

    @IsDateString()
    date_session_fin: string;

    @IsInt()
    @Min(1)
    @Max(1000)
    nb_places: number;

    @IsOptional()
    @IsArray()
    @IsEnum(PaymentMethod, {
        each: true,
        message: 'Chaque méthode de paiement doit être OPCO, CPF ou CARD',
    })
    @IsOptional()
    payment_methods: PaymentMethod[];

    @IsOptional()
    @IsArray()
    // @IsEnum(RequiredDocument, {
    //     each: true,
    //     message: 'Un ou plusieurs documents requis sont invalides'
    // })
    @IsValidRequiredDocuments()
    @IsOptional()
    required_documents: RequiredDocument[];

    @IsString()
    text_reglement: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionSurveyDto)
    questions: CreateQuestionSurveyDto[];
}
