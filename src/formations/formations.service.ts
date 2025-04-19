import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Formations } from 'src/models/model.formations';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';
import { CreateFormationDto } from './dto/create-formation.dto';
import { AllSercices } from '../services/serices.all';

@Injectable()
export class FormationsService {

    constructor(
        @InjectModel(Formations)
        private readonly formationModel: typeof Formations,

        private readonly allServices: AllSercices
    ) { }

    async createNewFormation(createFormationDto: CreateFormationDto): Promise<ResponseServer> {
        const { id_category, sous_titre, titre, type_formation, description, lien_contenu, prix, id_thematic, end_on, start_on, id_formateur, duree } = createFormationDto;

        const s_on = this.allServices.parseDate(start_on as any)
        const e_on = this.allServices.parseDate(end_on as any)

        return this.formationModel.create({
            description: description || "",
            duree: duree || "",
            end_on: e_on as any,
            start_on: s_on as any,
            id_category,
            id_formateur: id_formateur || 0 as number,
            id_thematic,
            prix: prix as number,
            sous_titre,
            titre,
            type_formation: type_formation as any,
            piece_jointe: lien_contenu
        })
            .then(formation => {
                if (formation instanceof Formations) {
                    return Responder({ status: HttpStatusCode.Created, data: createFormationDto })
                } else {
                    return Responder({ status: HttpStatusCode.BadRequest, data: formation })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async getTypesFormations(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: typeFormations })
    }

    async gatAllFormations(): Promise<ResponseServer> {
        return this.formationModel.findAll({
            where: {
                status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async gatAllFormationsByThematic(idThematic: number): Promise<ResponseServer> {
        return this.formationModel.findAll({
            where: {
                status: 1,
                id_thematic: idThematic
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async gatAllFormationsByThematicAndCategory(idThematic: number, idCategory: number): Promise<ResponseServer> {
        return this.formationModel.findAll({
            where: {
                status: 1,
                id_thematic: idThematic,
                id_category: idCategory
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async gatAllFormationsByCategory(idCategory: number): Promise<ResponseServer> {
        return this.formationModel.findAll({
            where: {
                status: 1,
                id_category: idCategory
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

}
