import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Array of receiver UUIDs',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
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
    example: "Hello everyone, let's discuss the project updates.",
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description:
      'Array of Cloudinary URLs for file attachments (automatically populated when files are uploaded)',
    example: [
      'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/__tantorLearning/documents/document.pdf',
      'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/images/image.jpg',
    ],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  piece_joint?: string[];
}
