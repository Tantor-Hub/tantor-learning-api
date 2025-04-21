import { ICategorieFormations } from "./interface.categoriesformations";
import { IGlobale } from "./interface.globale";

export interface IGroupeFormations extends IGlobale {
    id?: number,
    thematic: string,
    description?: string,
    categories?: ICategorieFormations[]
}