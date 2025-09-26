import { PartialType } from '@nestjs/swagger';
import { CreateSurveyQuestionDto } from './create-surveyquestion.dto';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSurveyQuestionDto extends PartialType(
  CreateSurveyQuestionDto,
) {
  @ApiProperty({
    description: 'ID of the survey question to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  id: string;
}
