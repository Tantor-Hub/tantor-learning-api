import { IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    category: string

    @IsString()
    @IsOptional()
    description?: string
}