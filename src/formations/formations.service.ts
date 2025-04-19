import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { log } from 'console';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Formations } from 'src/models/model.formations';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';

@Injectable()
export class FormationsService {

    constructor(
        @InjectModel(Formations)
        private readonly formationModel: typeof Formations
    ) { }

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
