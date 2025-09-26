import { IUsers } from './interface.users';

export interface IListUserByRoleResponse {
  status: number;
  message: string;
  data: IUsers[];
}
