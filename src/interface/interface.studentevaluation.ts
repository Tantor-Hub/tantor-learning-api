import { IGlobale } from './interface.globale';

export enum StudentevaluationType {
  EXERCISE = 'exercise',
  HOMEWORK = 'homework',
  TEST = 'test',
  QUIZ = 'quiz',
  EXAMEN = 'examen',
}

export interface IStudentevaluation extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  type: StudentevaluationType;
  points: number;
  createdBy: string;
  studentId?: string[];
  submittiondate: Date;
  beginningTime?: string;
  endingTime?: string;
  ispublish: boolean;
  isImmediateResult?: boolean;
  sessionCoursId?: string;
  lessonId?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
