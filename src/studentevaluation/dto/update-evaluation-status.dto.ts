import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { MarkingStatus } from 'src/interface/interface.studentevaluation';

export class UpdateEvaluationStatusDto {
  @ApiProperty({
    description: 'Whether this evaluation is published and visible to students',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ispublish?: boolean;

  @ApiProperty({
    description: 'Whether results should be shown immediately after submission',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isImmediateResult?: boolean;

  @ApiProperty({
    description: 'Status of the marking process',
    enum: MarkingStatus,
    example: MarkingStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(MarkingStatus)
  markingStatus?: MarkingStatus;
}
