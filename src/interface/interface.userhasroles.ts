import { IGlobale } from "./interface.globale";

export interface IUserHasRoles extends IGlobale{
    id?: number,
    id_user: number,
    id_role: number
}