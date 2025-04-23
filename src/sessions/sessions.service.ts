import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseServer } from 'src/interface/interface.response';
import { CreateSessionDto } from './dto/create-session.dto';
import { AllSercices } from '../services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { Users } from 'src/models/model.users';
import { HasRoles } from 'src/models/model.userhasroles';
import { Roles } from 'src/models/model.roles';
import { FormateurHasSession } from 'src/models/model.formateurhassession';
import { MailService } from '../services/service.mail';
import { SessionSuivi } from 'src/models/model.suivisession';
import { Formations } from 'src/models/model.formations';
import { log } from 'console';

@Injectable()
export class SessionsService {

    constructor(
        @InjectModel(SessionSuivi)
        private readonly sessionModel: typeof SessionSuivi,

        @InjectModel(Formations)
        private readonly formationModel: typeof Formations,

        @InjectModel(Users)
        private readonly usersModel: typeof Users,

        @InjectModel(Roles)
        private readonly rolesModel: typeof Roles,

        @InjectModel(HasRoles)
        private readonly hasRoleModel: typeof HasRoles,

        @InjectModel(FormateurHasSession)
        private readonly hasSessionFormateurModel: typeof FormateurHasSession,

        private readonly allServices: AllSercices,
        private readonly serviceMail: MailService
    ) { }

    async createSession(createSessionDto: CreateSessionDto): Promise<ResponseServer> {

        const { type_formation, description, prix, date_session_debut, date_session_fin, id_superviseur, piece_jointe, id_formation, id_controleur } = createSessionDto
        const s_on = this.allServices.parseDate(date_session_debut as any)
        const e_on = this.allServices.parseDate(date_session_fin as any)

        const { code, data, message } = this.allServices.calcHoursBetweenDates({ start: date_session_debut, end: date_session_fin }, true)
        if (code !== 200) return Responder({ status: HttpStatusCode.BadRequest, data: data })
        const designation_start = this.allServices.formatDate({ dateString: s_on as any })
        const designation_end = this.allServices.formatDate({ dateString: e_on as any })
        if (!designation_end || !designation_start) return Responder({ status: HttpStatusCode.BadRequest, data: "Date_start and Date_end must be type of date !" })
        const designation = this.allServices.createDesignationSessionName({ start: designation_start, end: designation_end })
        const uuid = this.allServices.generateUuid()

        return this.formationModel.findOne({
            where: {
                status: 1,
                id: id_formation
            }
        })
            .then(form => {
                if (form instanceof Formations) {
                    const { id_category, id_thematic, sous_titre, titre, } = form.toJSON()
                    return this.sessionModel.create({
                        description: description,
                        duree: data as string,
                        date_session_debut: date_session_debut,
                        date_session_fin: date_session_fin,
                        id_category,
                        id_controleur,
                        id_superviseur,
                        id_thematic,
                        prix: prix,
                        type_formation: type_formation as any,
                        piece_jointe: piece_jointe,
                        id_formation,
                        designation: designation.toUpperCase(),
                        date_mise_a_jour: null,
                        status: 1,
                        uuid: uuid
                    })
                        .then(async formation => {
                            if (formation instanceof SessionSuivi) {
                                const { id } = formation.toJSON()
                                if (id_superviseur) {
                                    Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
                                    return this.usersModel.findOne({
                                        include: [
                                            {
                                                model: Roles,
                                                required: true,
                                                where: {
                                                    id: 3
                                                }
                                            }
                                        ],
                                        where: {
                                            id: id_superviseur
                                        }
                                    })
                                        .then(formateur => {
                                            return this.hasSessionFormateurModel.create({
                                                SessionId: id as number,
                                                UserId: id_superviseur,
                                                is_complited: 0,
                                                status: 1
                                            })
                                                .then(_ => {
                                                    return Responder({ status: HttpStatusCode.Created, data: formation })
                                                })
                                                .catch(err => Responder({ status: HttpStatusCode.BadRequest, data: "Les identifiants fournis du formateur sont incorrectes [id_formateur]" }))
                                        })
                                        .catch(err => Responder({ status: HttpStatusCode.BadRequest, data: "Les identifiants fournis du formateur sont incorrectes [id_formateur]" }))
                                } else {
                                    return Responder({ status: HttpStatusCode.Created, data: formation })
                                }
                            } else {
                                return Responder({ status: HttpStatusCode.BadRequest, data: formation })
                            }
                        })
                        .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: "La formation ciblée na pas été retrouvé sur notre serveur !" })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}
