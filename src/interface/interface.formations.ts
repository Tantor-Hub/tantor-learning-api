import { IGlobale } from './interface.globale';

export interface IFormation extends IGlobale {
  titre: string;
  sous_titre: string;
  id_category: number;
  description: string;
  alternance: string;
  prerequis: string;
  rnc: string;

  type_formation?: 'onLine' | 'visionConference' | 'presentiel' | 'hybride';
  piece_jointe?: string; // optionnel
  id_formateur?: number;
  duree?: string;
  start_on?: Date;
  end_on?: Date;
  prix: number;
}

export interface IApresFormationDocs extends IGlobale {
  session_id: number;
  user_id: number;
  questionnaire_satisfaction?: string;
  paiement?: string;
  documents_financeur?: string;
  fiche_controle_finale?: string;
}

export interface IAvantFormationDocs extends IGlobale {
  session_id: number;
  user_id: number;
  carte_identite?: string;
  contrat_ou_convention?: string;
  justificatif_domicile?: string;
  analyse_besoin?: string;
  formulaire_handicap?: string;
  convocation?: string;
  programme?: string;
  conditions_vente?: string;
  reglement_interieur?: string;
  cgv?: string;
  fiche_controle_initiale?: string;
}

export interface IPendantFormationDocs extends IGlobale {
  session_id: number;
  user_id: number;
  convocation_examen?: string;
  attestation_formation?: string;
  certification?: string;
  fiche_controle_cours?: string;
  fiches_emargement?: string;
}
