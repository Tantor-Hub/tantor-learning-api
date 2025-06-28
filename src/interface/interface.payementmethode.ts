import { IGlobale } from "./interface.globale";

export interface IPayemenMethode extends IGlobale {
    full_name: string,
    card_number: string,
    id_user?: number,
    cvv: number,
    amount: number,
    year: number,
    month: number,
    id_session: number,
    id_session_student?: number,
}