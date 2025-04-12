import { IsOptional, IsString } from 'class-validator';
export class RefreshTokenDto {
    @IsString()
    refresh_token: string;

    @IsString()
    @IsOptional()
    old_access_token?: string
}