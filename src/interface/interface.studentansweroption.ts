import { IGlobale } from './interface.globale';

export interface IStudentAnswerOption extends IGlobale {
  id?: string;
  studentAnswerId: string;
  optionId: string;
  isCorrect: boolean;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}
