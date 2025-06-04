import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Formations } from 'src/models/model.formations';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';
import { CreateFormationDto } from './dto/create-formation.dto';
import { AllSercices } from '../services/serices.all';
import { MailService } from '../services/service.mail';
import { Categories } from 'src/models/model.categoriesformations';
import { SessionSuivi } from 'src/models/model.suivisession';

@Injectable()
export class FormationsService {

    constructor(
        @InjectModel(Formations)
        private readonly formationModel: typeof Formations,
        private readonly allServices: AllSercices,
        private readonly mailService: MailService
    ) { }

    async getFormationById(idSession: number): Promise<ResponseServer> {
        return this.formationModel.findOne({
            include: [{
                model: Categories,
                required: true,
                attributes: ['id', 'category']
            },
            {
                model: SessionSuivi,
                required: false,
                // attributes
            }
            ],
            where: {
                id: idSession
            }
        })
            .then(inst => {
                if (inst instanceof Formations) {
                    return Responder({ status: HttpStatusCode.Ok, data: inst })
                } else {
                    return Responder({ status: HttpStatusCode.BadRequest, data: "La session ciblée n'a pas été retrouvé !" })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
    async delete(idSession: number): Promise<ResponseServer> {
        return this.formationModel.findOne({
            where: {
                id: idSession
            }
        })
            .then(inst => {
                if (inst instanceof Formations) {
                    return inst.update({
                        status: 0
                    })
                        .then(_ => Responder({ status: HttpStatusCode.Ok, data: "Elément supprimé avec succès !" }))
                        .catch(_ => Responder({ status: HttpStatusCode.BadRequest, data: _ }))
                } else {
                    return Responder({ status: HttpStatusCode.BadRequest, data: "La session ciblée n'a pas été retrouvé !" })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
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
            include: [{
                model: Categories,
                required: true,
                attributes: ['id', 'category']
            }],
            where: {
                status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
    async gatAllFormationsByCategory(idCategory: number): Promise<ResponseServer> {
        return this.formationModel.findAll({
            include: [{
                model: Categories,
                required: true,
                attributes: ['id', 'category']
            }],
            where: {
                status: 1,
                id_category: idCategory
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}
