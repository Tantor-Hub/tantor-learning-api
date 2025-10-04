import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateEvaluationQuestionOptionDto {
  @ApiProperty({
    description: 'ID of the question this option belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  questionId: string;

  @ApiProperty({
    description: 'The option text',
    example: 'Using function components with hooks',
    required: true,
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Whether this option is correct',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
