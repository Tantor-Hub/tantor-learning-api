import { IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayementOpcoDto {
  @ApiProperty({
    example: 1,
    description: 'Training ID',
  })
  @IsNumber()
  session_id: number;

  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    example: 'OPCO001',
    description: 'OPCO name',
  })
  @IsString()
  nom_opco: string;

  @ApiProperty({
    example: 'Company Name',
    description: 'Company name',
  })
  @IsString()
  nom_entreprise: string;

  @ApiProperty({
    example: '123456789',
    description: 'SIREN number',
  })
  @IsString()
  siren: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Responsible person name',
  })
  @IsString()
  nom_responsable: string;

  @ApiProperty({
    example: '+33123456789',
    description: 'Responsible person phone',
  })
  @IsString()
  telephone_responsable: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Responsible person email',
  })
  @IsEmail()
  email_responsable: string;
}
