import { PaymentMethodCpfStatus } from '../enums/payment-method-cpf-status.enum';

export interface IPaymentMethodCpf {
  id?: string;
  id_session: string;
  status: PaymentMethodCpfStatus;
  id_user: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
