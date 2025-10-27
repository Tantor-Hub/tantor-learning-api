import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsInt, Min, IsOptional } from 'class-validator';

export class CreateStudentAnswerOptionDto {
  @ApiProperty({
    description: 'ID of the evaluation question this option belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  questionId: string;

  @ApiProperty({
    description: 'ID of the question option that was selected',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  optionId: string;

  @ApiProperty({
    description:
      'Whether this selected option is correct (automatically set from evaluation question option)',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({
    description:
      'Points awarded for selecting this option (automatically set: full question points if correct, 0 if incorrect)',
    example: 5,
    required: false,
    default: 'Auto-assigned based on correctness',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}
