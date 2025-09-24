import { IGlobale } from './interface.globale';
import { FormationType } from 'src/utils/utiles.typesformations';

export interface IFormation extends IGlobale {
  titre: string;
  sous_titre: string;
  id_training?: string;
  description: string;
  alternance: string;
  prerequis: string;
  rnc: string;

  type_formation?: FormationType;
  piece_jointe?: string; // optionnel
  id_formateur?: number;
  duree?: string;
  start_on?: Date;
  end_on?: Date;
  prix: number;
}
