import { IsEmail, IsString } from 'class-validator';
// email: emails[0].value,
// firstName: name.givenName,
// lastName: name.familyName,
// picture: photos[0].value,
// accessToken
export class IAuthWithGoogle {
    @IsEmail()
    email: string

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsString()
    picture: any

    @IsString()
    accessToken: string
}