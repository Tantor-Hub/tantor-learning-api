import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateThematicFormationDto {
    @IsString()
    thematic: string;

    @IsOptional()
    @IsString()
    description?: string;

}