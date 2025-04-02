import { IsNotEmpty, IsString } from "class-validator";
import { NotEmpty } from "sequelize-typescript";

export class SignInStudentDto {

    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString({ message: "Entrer un mot de passe avant de continuer !" })
    password: string
}