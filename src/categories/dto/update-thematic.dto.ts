import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateThematicFormationDto {
    @IsString()
    @IsOptional()
    thematic?: string;

    @IsOptional()
    @IsString()
    description?: string;

}