import { IGlobale } from './interface.globale';

export interface ITransferChat extends IGlobale {
  id?: string;
  id_chat: string;
  sender: string;
  receivers: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

