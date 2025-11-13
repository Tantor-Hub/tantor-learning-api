import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsUUID } from 'class-validator';

export class UpdateTransferChatDto {
  @ApiProperty({
    description: 'Updated array of receiver UUIDs (add or remove people from the receiving list)',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  receivers: string[];
}

