import { IGlobale } from './interface.globale';

export interface IStudentAnswer extends IGlobale {
  id?: string;
  questionId: string;
  studentId: string;
  evaluationId: string;
  answerText?: string;
  points: number;
  isCorrect?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
