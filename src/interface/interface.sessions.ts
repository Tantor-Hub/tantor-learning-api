import { IGlobale } from './interface.globale';

export interface ISession extends IGlobale {
  id_formation: number;
  designation?: string; // as SESSION JJMMAAAA-JJMMAAAA
  type_formation?: 'onLine' | 'visionConference' | 'presentiel' | 'hybride';
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
