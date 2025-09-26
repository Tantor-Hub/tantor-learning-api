import { PartialType } from '@nestjs/swagger';
import { CreateSessionCoursDto } from './create-sessioncours.dto';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionCoursDto extends PartialType(CreateSessionCoursDto) {
  @ApiProperty({
    description: 'ID of the session course to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;
}
