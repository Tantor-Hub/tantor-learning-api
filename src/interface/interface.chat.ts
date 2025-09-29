import { ChatStatus } from 'src/models/model.chat';

export interface IChat {
  id?: string;
  id_user_sender: string;
  id_user_receiver: string[];
  subject?: string;
  content?: string;
  reader?: string[];
  status: ChatStatus;
  dontshowme?: string[];
  piece_joint?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatCreate {
  id_user_sender: string;
  id_user_receiver: string[];
  subject?: string;
  content?: string;
  piece_joint?: string[];
}

export interface IChatUpdate {
  id: string;
  subject?: string;
  content?: string;
  reader?: string[];
  status?: ChatStatus;
  dontshowme?: string[];
  piece_joint?: string[];
}

export interface IChatResponse {
  id: string;
  id_user_sender: string;
  id_user_receiver: string[];
  subject?: string;
  content?: string;
  reader?: string[];
  status: ChatStatus;
  dontshowme?: string[];
  piece_joint?: string[];
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: number;
    fs_name: string;
    ls_name: string;
    email: string;
    uuid: string;
  };
}
