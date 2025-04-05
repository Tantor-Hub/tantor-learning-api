import { IsEmail } from "class-validator";

export class ResentCodeDto {
    @IsEmail()
    user_email: string
}