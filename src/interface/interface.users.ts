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
}