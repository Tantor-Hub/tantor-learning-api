import { ITypeformation } from "src/interface/interface.typeformations";

export const typeFormations: ITypeformation[] = [
    {
        key: "onLine",
        type: "En ligne",
        description: "Une formation en ligne avec tous les supports en ligne, des videos des cours doivent être mis en la dispositions des apprenants"
    },
    {
        key: "visioConference",
        type: "Vision Conférence",
        description: "Une formation en vision conférence"
    },
    {
        key: "presentiel",
        type: "En présentiel",
        description: "Une formation organisée au sein d'une centre de formation"
    },
    {
        key: "hybride",
        type: "Hybride",
        description: "Il s'agit d'une formation qui peut etre dispensée en ligne en vision conference, soit en presentiel"
    }
]