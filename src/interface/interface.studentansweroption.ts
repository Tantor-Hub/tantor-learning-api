import { IGlobale } from './interface.globale';

export interface IStudentAnswerOption extends IGlobale {
  id?: string;
  questionId: string;
  optionId: string;
  studentId: string;
  isCorrect: boolean;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}
