import { PartialType } from '@nestjs/swagger';
import { CreateStudentAnswerDto } from './create-studentanswer.dto';

export class UpdateStudentAnswerDto extends PartialType(
  CreateStudentAnswerDto,
) {}
