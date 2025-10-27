import { ApiProperty } from '@nestjs/swagger';

export class SubmitResponseDto {
  @ApiProperty({ description: 'User ID (Users.id)', example: 'user-uuid' })
  userId: string;

  @ApiProperty({
    description: 'fieldId -> value map',
    example: { 'field-1': 'John', 'field-2': 'john@example.com' },
  })
  answers: Record<string, any>;
}
