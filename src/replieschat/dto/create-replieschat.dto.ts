import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateRepliesChatDto {
  @ApiProperty({
    description: 'Content of the reply message',
    example: 'Thank you for your message. I will get back to you soon.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'UUID of the chat message being replied to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  id_chat: string;

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
