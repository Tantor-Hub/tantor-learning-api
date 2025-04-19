import { Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Formations } from 'src/models/model.formations';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';

@Injectable()
export class FormationsService {

    constructor(private readonly formationModel: typeof Formations) { }

    async getTypesFormations(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: typeFormations })
    }

    async gatAllFormations(): Promise<ResponseServer> {
        return {} as any
        // return this.formationModel.findAll({
        //     where: {
        //         status: 1
        //     }
        // })
        // .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
        // .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

}
