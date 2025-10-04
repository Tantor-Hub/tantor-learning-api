import { IGlobale } from './interface.globale';

export interface IPayemenMethode extends IGlobale {
  full_name?: string;
  card_number?: string;
  id_user?: string;
  cvv?: number;
  amount?: number;
  year?: number;
  month?: number;
  id_session?: string;
  id_session_student?: string;
  id_stripe_payment?: string;
}

export interface IPayementopco extends IGlobale {
  nom_opco?: string;
  nom_entreprise?: string;
  id_session_student: string;
  siren?: string;
  nom_responsable?: string;
  telephone_responsable?: string;
  email_responsable?: string;
  id_user: string;
  status?: number;
  id_session?: string;
}
