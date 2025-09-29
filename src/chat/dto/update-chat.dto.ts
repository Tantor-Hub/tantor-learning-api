import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ChatStatus } from 'src/models/model.chat';

export class UpdateChatDto {
  @ApiProperty({
    description: 'UUID of the chat message',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Subject of the chat message',
    example: 'Updated Meeting Discussion',
    required: false,
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Content of the chat message',
    example: 'Updated content for the discussion.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Array of user UUIDs who have read the message',
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  reader?: string[];

  @ApiProperty({
    description: 'Status of the chat message',
    enum: ChatStatus,
    example: ChatStatus.ALIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChatStatus)
  status?: ChatStatus;

  @ApiProperty({
    description: 'Array of user UUIDs who hide this message',
    example: ['550e8400-e29b-41d4-a716-446655440003'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dontshowme?: string[];

  @ApiProperty({
    description: 'Array of attachment file paths',
    example: ['/uploads/file1.pdf', '/uploads/image1.jpg'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  piece_joint?: string[];
}
