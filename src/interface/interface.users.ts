import { IGlobale } from "./interface.globale";

export interface IUsers extends IGlobale {
    id?: number,
    uuid?: string,
    num_record?: string,
    avatar?: string,
    fs_name: string,
    ls_name: string,
    nick_name?: string,
    email: string,
    phone?: string,
    password: string,
    verification_code?: string,
    is_verified: number,
    roles?: number[],
    last_login?: string,
    can_update_password?: number,
    adresse_physique?: string,
    pays_residance?: string,
    ville_residance?: string,
    num_piece_identite?: string
    date_de_naissance?: string
    date_of_birth?: string
}