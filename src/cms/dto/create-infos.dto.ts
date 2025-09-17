import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppInfosDto {
  @IsArray()
  @ArrayMinSize(1) // facultatif : garantit qu’il y ait au moins un numéro
  @Type(() => String)
  @IsString({ each: true }) // <- valide chaque élément du tableau
  contacts_numbers: string[];

  @IsEmail()
  email_contact: string;

  @IsString()
  adresse: string;

  @IsOptional()
  @IsString()
  about_app: string;
}
