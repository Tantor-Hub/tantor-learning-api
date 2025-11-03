import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetVerifiedStatusDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID (UUID)',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: false,
    description: 'Set is_verified status. Use false to revoke verification.',
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_verified: boolean;
}
