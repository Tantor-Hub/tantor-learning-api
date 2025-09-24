import { PartialType } from '@nestjs/swagger';
import { CreateSessiondocumentDto } from './create-sessiondocument.dto';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessiondocumentDto extends PartialType(
  CreateSessiondocumentDto,
) {
  @ApiProperty({
    example: 1,
    description: 'ID of the session document to update',
  })
  @IsInt()
  @IsNotEmpty()
  id: number;
}
