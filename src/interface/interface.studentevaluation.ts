import { IGlobale } from './interface.globale';

export enum StudentevaluationType {
  EXERCISE = 'exercise',
  HOMEWORK = 'homework',
  TEST = 'test',
  EXAMEN = 'examen',
}

export interface IStudentevaluation extends IGlobale {
  id?: string;
  title: string;
  description?: string;
  type: StudentevaluationType;
  points: number;
  lecturerId: string;
  submittiondate: Date;
  ispublish: boolean;
  isImmediateResult?: boolean;
  sessionCoursId?: string;
  lessonId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
