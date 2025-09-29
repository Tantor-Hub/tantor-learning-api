import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'UUID of the sender',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  id_user_sender: string;

  @ApiProperty({
    description: 'Array of receiver UUIDs',
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  id_user_receiver: string[];

  @ApiProperty({
    description: 'Subject of the chat message',
    example: 'Meeting Discussion',
    required: false,
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Content of the chat message',
    example: 'Hello everyone, let\'s discuss the project updates.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

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
