import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsInt, Min, IsOptional } from 'class-validator';

export class CreateStudentAnswerOptionDto {
  @ApiProperty({
    description: 'ID of the student answer this option belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  studentAnswerId: string;

  @ApiProperty({
    description: 'ID of the question option that was selected',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID('4')
  optionId: string;

  @ApiProperty({
    description: 'Whether this selected option is correct',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiProperty({
    description: 'Points awarded for selecting this option',
    example: 2,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;
}
