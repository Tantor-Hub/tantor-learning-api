import { IGlobale } from './interface.globale';

export interface IPayemenMethode extends IGlobale {
  full_name?: string;
  card_number?: string;
  id_user?: number;
  cvv?: number;
  amount?: number;
  year?: number;
  month?: number;
  id_session?: number;
  id_session_student?: number;
  id_stripe_payment?: string;
}

export interface IPayementopco extends IGlobale {
  nom_opco?: string;
  nom_entreprise?: string;
  id_session_student: number;
  siren?: string;
  nom_responsable?: string;
  telephone_responsable?: string;
  email_responsable?: string;
  id_user: number;
  status?: number;
  id_session?: number;
}
