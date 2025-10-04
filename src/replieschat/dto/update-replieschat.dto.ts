import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { RepliesChatStatus } from 'src/models/model.replieschat';

export class UpdateRepliesChatDto {
  @ApiProperty({
    description: 'UUID of the reply message',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Updated content of the reply message',
    example: 'Updated reply content.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Status of the reply message',
    enum: RepliesChatStatus,
    example: RepliesChatStatus.ALIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(RepliesChatStatus)
  status?: RepliesChatStatus;

  @ApiProperty({
    description:
      'Whether the reply is public (visible to all receivers) or private (only to sender)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
