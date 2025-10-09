import { PartialType } from '@nestjs/swagger';
import { CreateTrainingSessionDto } from './create-trainingssession.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTrainingSessionDto extends PartialType(
  CreateTrainingSessionDto,
) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training session ID to update',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 25,
    description:
      'Number of available places (automatically set to nb_places when nb_places is updated)',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  available_places?: number;
}
