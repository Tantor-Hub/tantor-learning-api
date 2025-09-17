import { IsOptional, IsString } from 'class-validator';
export class ForgotenPasswordDto {
  @IsString()
  user_name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
