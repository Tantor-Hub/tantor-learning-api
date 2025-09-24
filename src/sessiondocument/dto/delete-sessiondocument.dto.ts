import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSessiondocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the session document to delete',
  })
  @IsInt()
  @IsNotEmpty()
  id: number;
}
