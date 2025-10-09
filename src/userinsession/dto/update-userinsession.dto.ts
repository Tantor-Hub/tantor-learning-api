import { PartialType } from '@nestjs/swagger';
import { CreateUserInSessionDto } from './create-userinsession.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserInSessionStatus } from 'src/enums/user-in-session-status.enum';

export class UpdateUserInSessionDto extends PartialType(
  CreateUserInSessionDto,
) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User in session ID to update',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 'in',
    description: 'Updated user status in the session',
    enum: UserInSessionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserInSessionStatus)
  status?: UserInSessionStatus;
}
