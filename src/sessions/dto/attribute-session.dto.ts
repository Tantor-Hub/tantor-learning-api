import { IsInt, IsPositive } from 'class-validator';

export class AssignFormateurToSessionDto {
  @IsInt()
  @IsPositive()
  id_user: number;

  @IsInt()
  @IsPositive()
  id_cours: number;
}
