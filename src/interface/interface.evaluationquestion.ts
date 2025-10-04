import { IGlobale } from './interface.globale';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
}

export interface IEvaluationQuestion extends IGlobale {
  id?: string;
  evaluationId: string;
  type: QuestionType;
  text?: string;
  isImmediateResult?: boolean;
  points?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
