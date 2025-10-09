import { UserInSessionStatus } from '../enums/user-in-session-status.enum';

export interface IUserInSession {
  id?: string;
  id_session: string;
  status: UserInSessionStatus;
  id_user: string;
  createdAt?: Date;
  updatedAt?: Date;
}
