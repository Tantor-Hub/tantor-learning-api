import { IGlobale } from './interface.globale';

export interface IContact extends IGlobale {
  from_name: string;
  from_mail: string;
  subject: string;
  content: string;
}
