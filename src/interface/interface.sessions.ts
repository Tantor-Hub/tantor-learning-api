import { IGlobale } from './interface.globale';
import { FormationType } from 'src/utils/utiles.typesformations';

export interface ISession extends IGlobale {
  id_formation: number;
  designation?: string; // as SESSION JJMMAAAA-JJMMAAAA
  type_formation?: FormationType;
  piece_jointe?: string; // optionnel
  id_formateur?: number;
  description?: string;
  duree?: string;
  start_on?: Date;
  end_on?: Date;
  prix?: number; // les prix sont en Euro
  id_category?: number;
  id_thematic?: number;
}
