import { IGlobale } from './interface.globale';

export interface ISessionDocument extends IGlobale {
  id?: string;
  type: string;
  id_student: string;
  id_session: string;
  categories: 'before' | 'during' | 'after';
  piece_jointe?: string;
  status: 'pending' | 'rejected' | 'validated';
  student?: any;
  trainingSession?: any;
}
