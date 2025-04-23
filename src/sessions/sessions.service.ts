import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseServer } from 'src/interface/interface.response';
import { Sessions } from 'src/models/model.sessions';
import { CreateSessionDto } from './dto/create-session.dto';
import { AllSercices } from '../services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { log } from 'console';

@Injectable()
export class SessionsService {

    constructor(
        @InjectModel(Sessions)
        private readonly sessionModel: typeof Sessions,
        private readonly allServices: AllSercices
    ) { }

    async createSession(createSessionDto: CreateSessionDto): Promise<ResponseServer> {
        const { id_category, sous_titre, titre, type_formation, description, lien_contenu, prix, id_thematic, end_on, start_on, id_formateur, duree, id_formation } = createSessionDto
        const s_on = this.allServices.parseDate(start_on as any)
        const e_on = this.allServices.parseDate(end_on as any)

        const { code, data, message } = this.allServices.createDesignationSessionName({ start: start_on, end: end_on }, true)
        if (code !== 200) return Responder({ status: HttpStatusCode.BadRequest, data: data })
        
        log("Formating dates ==>", data)
        log("formating session ==>", createSessionDto)

        return this.sessionModel.create({
            description: description || "",
            duree: data as string,
            end_on: e_on as any,
            start_on: s_on as any,
            id_category,
            id_formateur: id_formateur || 0 as number,
            id_thematic,
            prix: prix as number || 0,
            type_formation: type_formation as any,
            piece_jointe: lien_contenu,
            id_formation,
            designation: description
        })
            .then(formation => {
                if (formation instanceof Sessions) {
                    return Responder({ status: HttpStatusCode.Created, data: formation })
                } else {
                    return Responder({ status: HttpStatusCode.BadRequest, data: formation })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}
