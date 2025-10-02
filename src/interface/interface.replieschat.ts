import { RepliesChatStatus } from 'src/models/model.replieschat';

export interface IRepliesChat {
  id?: string;
  content: string;
  id_sender: string;
  id_chat: string;
  status: RepliesChatStatus;
  is_public: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRepliesChatCreate {
  content: string;
  id_sender: string;
  id_chat: string;
  is_public?: boolean;
}

export interface IRepliesChatUpdate {
  id: string;
  content?: string;
  status?: RepliesChatStatus;
  is_public?: boolean;
}

export interface IRepliesChatResponse {
  id: string;
  content: string;
  id_sender: string;
  id_chat: string;
  status: RepliesChatStatus;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  chat?: {
    id: string;
    subject?: string;
    content?: string;
    id_user_sender: string;
    id_user_receiver: string[];
  };
}
