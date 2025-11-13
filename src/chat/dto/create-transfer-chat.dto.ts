import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsUUID } from 'class-validator';

export class CreateTransferChatDto {
  @ApiProperty({
    description: 'UUID of the chat to transfer',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id_chat: string;

  @ApiProperty({
    description: 'Array of user UUIDs who will receive the transferred chat',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
    minItems: 1,
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  receivers: string[];
}

