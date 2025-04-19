import { Injectable } from '@nestjs/common';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';

@Injectable()
export class FormationsService {

    async getTypesFormations(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: typeFormations })
    }
    
}
