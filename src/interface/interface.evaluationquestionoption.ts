import { IGlobale } from './interface.globale';

export interface IEvaluationQuestionOption extends IGlobale {
  id?: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
