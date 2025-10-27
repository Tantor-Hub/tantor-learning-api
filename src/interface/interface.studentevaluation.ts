import { IGlobale } from './interface.globale';

export enum StudentevaluationType {
  EXERCISE = 'exercise',
  HOMEWORK = 'homework',
  TEST = 'test',
  QUIZ = 'quiz',
  EXAMEN = 'examen',
}

export enum MarkingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
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
  markingStatus?: MarkingStatus;
  sessionCoursId?: string;
  lessonId?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
