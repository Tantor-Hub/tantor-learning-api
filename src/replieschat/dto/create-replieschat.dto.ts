import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsBoolean,
  ValidateIf,
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
    description:
      'UUID of the chat message being replied to (required if id_transferechat is not provided)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.id_transferechat)
  @IsNotEmpty()
  id_chat?: string;

  @ApiProperty({
    description:
      'UUID of the transfer chat being replied to (required if id_chat is not provided)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.id_chat)
  @IsNotEmpty()
  id_transferechat?: string;

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
