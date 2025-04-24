import { IGlobale } from "./interface.globale";

export interface IFormateurHasSession extends IGlobale {
    id?: number,
    UserId: number,
    SessionId: number,
    description?: string,
    is_complited?: number
}