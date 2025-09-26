import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionCoursDto {
  @ApiProperty({
    description: 'Title of the session course',
    example: 'Advanced React Development',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the session course',
    example: 'Learn advanced React concepts and best practices',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'ID of the training session this course belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id_session: string;
}
