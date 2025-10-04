import { PartialType } from '@nestjs/swagger';
import { CreateStudentAnswerOptionDto } from './create-studentansweroption.dto';

export class UpdateStudentAnswerOptionDto extends PartialType(
  CreateStudentAnswerOptionDto,
) {}
