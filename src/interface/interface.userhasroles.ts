import { IGlobale } from './interface.globale';

export interface IUserHasRoles extends IGlobale {
  id?: number;
  UserId: number;
  RoleId: number;
}
