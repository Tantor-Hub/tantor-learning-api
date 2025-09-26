import { PartialType } from '@nestjs/swagger';
import { CreateStudentSessionDto } from './create-studentsession.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateStudentSessionDto extends PartialType(
  CreateStudentSessionDto,
) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'Student session ID to update',
  })
  @IsUUID()
  id: string;
}
