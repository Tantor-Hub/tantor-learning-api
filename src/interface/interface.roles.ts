import { IGlobale } from './interface.globale';

export interface IRoles extends IGlobale {
  id?: number;
  role: string;
  description?: string;
}
