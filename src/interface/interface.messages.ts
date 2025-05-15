import { IGlobale } from "./interface.globale";

export interface IMessages extends IGlobale {
    id_user_sender: number,
    id_user_receiver: number,
    subject?: string,
    content: string,
    date_d_envoie: string | Date,
    date_de_lecture: string | Date,
}