import { IsNumber } from "class-validator";

export class GetUserByRoleDto {
    @IsNumber()
    idrole: number
}