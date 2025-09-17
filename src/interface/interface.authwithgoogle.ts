import { IsEmail, IsString } from 'class-validator';

export class IAuthWithGoogle {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  picture: any;

  @IsString()
  accessToken: string;
}
