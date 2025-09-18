export interface IJwtSignin {
  id_user: number;
  uuid_user: string;
  roles_user: number[];
  role?: string;
  level_indicator?: number;
}
