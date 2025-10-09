import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserInSessionStatus } from 'src/enums/user-in-session-status.enum';

export class CreateUserInSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID that this user belongs to',
  })
  @IsUUID()
  id_session: string;

  @ApiProperty({
    example: 'pending',
    description: 'User status in the session',
    enum: UserInSessionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserInSessionStatus)
  status?: UserInSessionStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'User ID who is participating in the session',
  })
  @IsUUID()
  id_user: string;
}
