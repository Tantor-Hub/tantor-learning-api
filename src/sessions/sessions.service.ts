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
import { Categories } from 'src/models/model.categoriesformations';
import { Thematiques } from 'src/models/model.groupeformations';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ApplySessionDto } from './dto/apply-tosesssion.dto';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { typesprestations } from 'src/utils/utiles.typesprestation';
import { typesrelances } from 'src/utils/utiles.typerelances';
import { typesactions } from 'src/utils/utiles.actionreprendre';
import { DocsService } from 'src/services/service.docs';
import { AddSeanceSessionDto } from './dto/add-seances.dto';
import { SeanceSessions } from 'src/models/model.sessionhasseances';

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

        @InjectModel(Categories)
        private readonly categoryModel: typeof Categories,

        @InjectModel(Thematiques)
        private readonly thematicModel: typeof Thematiques,

        @InjectModel(SeanceSessions)
        private readonly seancesModel: typeof SeanceSessions,

        @InjectModel(StagiaireHasSession)
        private readonly hasSessionStudentModel: typeof StagiaireHasSession,

        @InjectModel(FormateurHasSession)
        private readonly hasSessionFormateurModel: typeof FormateurHasSession,

        private readonly allServices: AllSercices,
        private readonly serviceMail: MailService,
        private readonly docsService: DocsService,

    ) { }

    async listAllSessionsByOwn(user: IJwtSignin): Promise<ResponseServer> {

        const { id_user } = user
        StagiaireHasSession.belongsTo(Formations, { foreignKey: "id_formation" })
        StagiaireHasSession.belongsTo(SessionSuivi, { foreignKey: "id_sessionsuivi" })
        Formations.belongsTo(Categories, { foreignKey: "id_category" })
        Formations.belongsTo(Thematiques, { foreignKey: "id_thematic" })

        return this.hasSessionStudentModel.findAndCountAll({
            include: [
                {
                    model: SessionSuivi,
                    required: true,
                },
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description'],
                    include: [
                        {
                            model: Thematiques,
                            required: true,
                            attributes: ['id', 'thematic']
                        },
                        {
                            model: Categories,
                            required: true,
                            attributes: ['id', 'category']
                        }
                    ]
                }
            ],
            where: {
                id_stagiaire: id_user,
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }

    async applyToSession(applySessionDto: ApplySessionDto, user: IJwtSignin): Promise<ResponseServer> {
        const { id_session, id_formation, id_user: as_user_id } = applySessionDto;
        const { id_user } = user;
        try {
            const student = await this.usersModel.findOne({ where: { id: id_user, status: 1 } });
            if (!student) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const { phone, email, fs_name, ls_name } = student.toJSON();
            const fullname = this.allServices.fullName({ fs: fs_name, ls: ls_name })

            SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
            return this.sessionModel.findOne({
                include: [
                    {
                        model: Formations,
                        required: true
                    }
                ],
                where: {
                    id: id_session
                }
            })
                .then(inst => {
                    if (inst instanceof SessionSuivi) {

                        const { id_formation, id_category, designation, Formation } = inst.toJSON() as any
                        const { phone, email } = student.toJSON();
                        const { titre } = Formation

                        return this.hasSessionStudentModel.findOrCreate({
                            where: {
                                id_sessionsuivi: id_session,
                                id_stagiaire: id_user
                            },
                            defaults: {
                                id_sessionsuivi: id_session,
                                id_stagiaire: id_user,
                                date_mise_a_jour: this.allServices.nowDate(),
                                id_formation,
                            }
                        })
                            .then(([record, isNew]) => {
                                if (isNew) {
                                    this.serviceMail.onWelcomeToSessionStudent({
                                        to: email,
                                        formation_name: titre,
                                        fullname,
                                        session_name: designation,
                                        asAttachement: true
                                    })
                                    return Responder({ status: HttpStatusCode.Created, data: record })
                                } else {
                                    return Responder({ status: HttpStatusCode.BadRequest, data: "Vous vous êtes déjà inscrit à cette session de formation; vous ne pouvez le faire deux fois" })
                                }
                            })
                            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
                    } else {
                        return Responder({ status: HttpStatusCode.BadRequest, data: "La session ciblée n'a pas été retrouvé !" })
                    }
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error: any) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async getListePrestation(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: { length: typesprestations.length, list: typesprestations } })
    }

    async getListeRealnce(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: { length: typesrelances.length, list: typesrelances } })
    }

    async getListeActions(): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: { length: typesactions.length, list: typesactions } })
    }

    async createSeance(addSeanceSessionDto: AddSeanceSessionDto): Promise<ResponseServer> {
        const { id_session, piece_jointe, seance_date_on, type_seance, id_formation, duree } = addSeanceSessionDto
        try {
            const session = await this.sessionModel.findOne({ where: { id: id_session } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            const { id_formation: as_id_formation } = session.toJSON()
            return this.seancesModel.create({
                duree,
                id_session: id_session as number,
                seance_date_on: Number(seance_date_on) as number,
                id_formation: as_id_formation,
                piece_jointe,
                type_seance
            })
                .then(seance => {
                    return Responder({ status: HttpStatusCode.Created, data: seance })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async deleteseance(id_seance: number) {
        try {
            const session = await this.seancesModel.findOne({ where: { id: id_seance } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            return session.destroy()
                .then(async (seance: any) => {
                    return Responder({ status: HttpStatusCode.Ok, data: "Supprimé" })
                })
                .catch((err: any) => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async updateSeance(addSeanceSessionDto: any, id_seance: number): Promise<ResponseServer> {
        const { id_session, piece_jointe, seance_date_on, type_seance, id_formation, duree } = addSeanceSessionDto
        try {
            const session = await this.seancesModel.findOne({ where: { id: id_seance } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            return session.update({
                ...addSeanceSessionDto
            })
                .then(async (seance: any) => {
                    return Responder({ status: HttpStatusCode.Created, data: seance })
                })
                .catch((err: any) => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

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

    async listAllSession(): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Thematiques, { foreignKey: "id_thematic" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })

        return this.sessionModel.findAndCountAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Thematiques,
                    required: true,
                    attributes: ['id', 'thematic']
                },
                {
                    model: Categories,
                    required: true,
                    attributes: ['id', 'category']
                }
            ],
            where: {
                status: 1
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }

    async gatAllSessionsByThematic(idThematic: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Thematiques, { foreignKey: "id_thematic" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Thematiques,
                    required: true,
                    attributes: ['id', 'thematic']
                },
                {
                    model: Categories,
                    required: true,
                    attributes: ['id', 'category']
                }
            ],
            where: {
                status: 1,
                id_thematic: idThematic
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async gatAllSessionsByThematicAndCategory(idThematic: number, idCategory: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Thematiques, { foreignKey: "id_thematic" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Thematiques,
                    required: true,
                    attributes: ['id', 'thematic']
                },
                {
                    model: Categories,
                    required: true,
                    attributes: ['id', 'category']
                }
            ],
            where: {
                status: 1,
                id_thematic: idThematic,
                id_category: idCategory
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async gatAllSessionsByCategory(idCategory: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Thematiques, { foreignKey: "id_thematic" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Thematiques,
                    required: true,
                    attributes: ['id', 'thematic']
                },
                {
                    model: Categories,
                    required: true,
                    attributes: ['id', 'category']
                }
            ],
            where: {
                status: 1,
                id_category: idCategory
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async updateSession(updateSessionDto: UpdateSessionDto, idSession: number): Promise<ResponseServer> {
        if (Object.keys(updateSessionDto).length <= 0) return Responder({ status: HttpStatusCode.BadRequest, data: "Le corps de cette requête ne devrait pas être vide !" })
        return this.sessionModel.findOne({
            where: {
                id: idSession
            }
        })
            .then(inst => {
                if (inst instanceof SessionSuivi) {
                    const { date_session_debut, date_session_fin, description, id_category, id_formation, id_thematic, type_formation, designation, id_controleur, id_superviseur, piece_jointe, prix } = updateSessionDto
                    return inst.update({
                        date_session_debut,
                        date_session_fin,
                        description,
                        designation,
                        id_category,
                        id_controleur,
                        id_formation,
                        id_superviseur,
                        id_thematic,
                        piece_jointe,
                        type_formation
                    })
                        .then(_ => Responder({ status: HttpStatusCode.Ok, data: inst }))
                        .catch(_ => Responder({ status: HttpStatusCode.BadRequest, data: _ }))
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: `La session n'a pas été retrouvée [id]:${idSession}` })
                }
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }

    async deleteSession(idSession: number): Promise<ResponseServer> {
        return this.sessionModel.findOne({
            where: {
                id: idSession
            }
        })
            .then(inst => {
                if (inst instanceof SessionSuivi) {
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
}
