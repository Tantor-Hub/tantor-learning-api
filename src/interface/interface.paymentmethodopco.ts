import { PaymentMethodOpcoStatus } from '../enums/payment-method-opco-status.enum';

export interface IPaymentMethodOpco {
  id?: string;
  id_session: string;
  nom_opco?: string;
  nom_entreprise: string;
  siren: string;
  nom_responsable: string;
  telephone_responsable: string;
  email_responsable: string;
  status: PaymentMethodOpcoStatus;
  id_user: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
