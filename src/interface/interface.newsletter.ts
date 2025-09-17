import { IGlobale } from './interface.globale';

export interface INewsletter extends IGlobale {
  user_email: string;
  status?: number;
}
