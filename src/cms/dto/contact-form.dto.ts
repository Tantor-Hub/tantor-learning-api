import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
    @IsNotEmpty()
    @IsString()
    from_name: string;

    @IsNotEmpty()
    @IsEmail()
    from_mail: string;

    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}
