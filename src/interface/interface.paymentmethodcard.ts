import { PaymentMethodCardStatus } from '../enums/payment-method-card-status.enum';

export interface IPaymentMethodCard {
  id?: string;
  id_session: string;
  id_stripe_payment?: string;
  id_user: string;
  status: PaymentMethodCardStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
