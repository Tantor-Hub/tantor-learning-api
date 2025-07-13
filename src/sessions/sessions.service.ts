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
import { UpdateSessionDto } from './dto/update-session.dto';
import { ApplySessionDto } from './dto/apply-tosesssion.dto';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { typesprestations } from 'src/utils/utiles.typesprestation';
import { typesrelances } from 'src/utils/utiles.typerelances';
import { typesactions } from 'src/utils/utiles.actionreprendre';
import { DocsService } from 'src/services/service.docs';
import { AddSeanceSessionDto } from './dto/add-seances.dto';
import { AddHomeworkSessionDto } from './dto/add-homework.dto';
import { HomeworksSession } from 'src/models/model.homework';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { Op } from 'sequelize';
import { log } from 'console';
import { AssignFormateurToSessionDto } from './dto/attribute-session.dto';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { Cours } from 'src/models/model.sessionshascours';
import { Listcours } from 'src/models/model.cours';
import { UploadDocument } from 'src/models/model.documentsession';
import { AvantFormationDocs } from 'src/models/model.avantformation';
import { PendantFormationDocs } from 'src/models/model.pendantformation';
import { ApresFormationDocs } from 'src/models/model.apresformation';
import { CreatePaymentSessionDto } from './dto/payement-methode.dto';
import { Payement } from 'src/models/model.payementmethode';
import { UploadDocumentToSessionDto } from './dto/add-document-session.dto';

@Injectable()
export class SessionsService {

    constructor(
        @InjectModel(SessionSuivi)
        private readonly sessionModel: typeof SessionSuivi,

        @InjectModel(Formations)
        private readonly formationModel: typeof Formations,

        @InjectModel(Users)
        private readonly usersModel: typeof Users,

        @InjectModel(SeanceSessions)
        private readonly seancesModel: typeof SeanceSessions,

        @InjectModel(StagiaireHasSession)
        private readonly hasSessionStudentModel: typeof StagiaireHasSession,

        @InjectModel(FormateurHasSession)
        private readonly hasSessionFormateurModel: typeof FormateurHasSession,

        @InjectModel(HomeworksSession)
        private readonly homeworkModel: typeof HomeworksSession,

        @InjectModel(StagiaireHasHomeWork)
        private readonly hashomeworkModel: typeof StagiaireHasHomeWork,

        @InjectModel(UploadDocument)
        private readonly documentModel: typeof UploadDocument,

        @InjectModel(AvantFormationDocs)
        private readonly adocsModel: typeof AvantFormationDocs,

        @InjectModel(PendantFormationDocs)
        private readonly pdocsModel: typeof PendantFormationDocs,

        @InjectModel(ApresFormationDocs)
        private readonly apdocsModel: typeof ApresFormationDocs,

        @InjectModel(Cours)
        private readonly coursModel: typeof Cours,

        @InjectModel(Payement)
        private readonly payementModel: typeof Payement,

        private readonly allServices: AllSercices,
        private readonly serviceMail: MailService
    ) { }

    async getPaymentsAll(user: IJwtSignin): Promise<ResponseServer> {
        try {
            const payments = await this.payementModel.findAll({ where: { status: 1 } });
            return Responder({ status: HttpStatusCode.Ok, data: payments });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async uploadDocumentToSessionDTO(user: IJwtSignin, uploadDocumentDto: UploadDocumentToSessionDto): Promise<ResponseServer> {
        const { id_session, key_document: document_type, description, document, piece_jointe } = uploadDocumentDto;
        try {
            const sess = await this.sessionModel.findOne({ where: { id: id_session } });
            if (!sess) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const userSession = await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: id_session, id_stagiaire: user.id_user } });
            if (!userSession) return Responder({ status: HttpStatusCode.NotFound, data: "L'utilisateur ciblé n'a pas été retrouvé dans cette session !" });

            return this.documentModel.create({
                id_session,
                id_student: user.id_user,
                key_document: document_type,
                document: document,
                piece_jointe
            })
                .then(doc => {
                    if (doc instanceof UploadDocument) {
                        return Responder({ status: HttpStatusCode.Created, data: doc })
                    } else {
                        return Responder({ status: HttpStatusCode.BadRequest, data: "Le document n'a pas pu être enregistré !" })
                    }
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async payementSession(student: IJwtSignin, payementSessionDto: CreatePaymentSessionDto): Promise<ResponseServer> {
        const { id_session, id_user, full_name, card_number, month, year, cvv } = payementSessionDto;
        try {
            const sess = await this.sessionModel.findOne({ where: { id: id_session } });
            if (!sess) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const session = await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: id_session, id_stagiaire: student.id_user } });
            const user = await this.usersModel.findOne({ where: { id: student.id_user } });
            if (!user) return Responder({ status: HttpStatusCode.NotFound, data: "L'utilisateur ciblé n'a pas été retrouvé !" });
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });

            return this.payementModel.create({
                id_session,
                id_session_student: session?.id as number,
                id_user: student.id_user,
                full_name,
                card_number,
                amount: sess.prix as number,
                month,
                year,
                cvv
            })
                .then(payement => {
                    if (payement instanceof Payement) {
                        return this.allServices.onPay({
                            currency: 'EUR',
                            amount: sess.prix as number,
                            payment_method_types: ['card']
                        })
                            .then((infos) => {
                                const {code, data } = infos
                                if (code === 200) {
                                    const { clientSecret, id, amount, currency, status } = data;
                                    payement.update({ status: 1 })
                                    this.serviceMail.onPayementSession({
                                        to: user.email,
                                        fullname: this.allServices.fullName({ fs: user.fs_name, ls: user.ls_name }),
                                        session: sess.designation as string,
                                        amount: sess.prix as number,
                                        currency: 'EUR',
                                    })
                                    return Responder({ status: HttpStatusCode.Created, data })
                                } else {
                                    return Responder({ status: HttpStatusCode.BadRequest, data: "Le paiement n'a pas pu être effectué !" })
                                }
                            })
                            .catch(err => {
                                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
                            })
                    } else {
                        return Responder({ status: HttpStatusCode.BadRequest, data: "La session ciblée n'a pas été retrouvé !" })
                    }
                })
                .catch(err => Responder({ status: HttpStatusCode.BadRequest, data: `Le paiement ne peut etre effectue qu'une seule fois pour session !` }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async GetDocumentsByGroup(idSession: number, idStudent: number, group: 'before' | 'during' | 'after'): Promise<ResponseServer> { // before ~ during ~ after
        try {
            const student = await this.usersModel.findOne({
                where: {
                    id: idStudent
                }
            })
            if (!student) return Responder({ status: HttpStatusCode.NotFound, data: `Student not found with id: ${idStudent}` })
            const session = await this.sessionModel.findOne({
                where: {
                    id: idSession
                }
            })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: `Session not found with id: ${idSession}` })
            const sessionStudent = await this.hasSessionStudentModel.findOne({
                where: {
                    id_sessionsuivi: idSession,
                    id_stagiaire: idStudent
                }
            })
            if (!session) return Responder({ status: HttpStatusCode.BadRequest, data: `The student is not associated to this session: ${idSession}` })
            const { id } = sessionStudent?.toJSON() as any
            switch (group) {
                case 'after':
                    return this.apdocsModel.findOne({
                        include: [
                            'QuestionnaireSatisfactionDoc',
                            'PaiementDoc',
                            'DocumentsFinanceurDoc',
                            'FicheControleFinaleDoc',
                        ],
                        where: {
                            user_id: idStudent,
                            session_id: id
                        }
                    })
                        .then(pref => {
                            if (pref instanceof ApresFormationDocs) return Responder({ status: HttpStatusCode.Ok, data: pref })
                            else return Responder({ status: HttpStatusCode.Ok, data: {} })
                        })
                        .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    break;

                case 'before':
                    return this.adocsModel.findOne({
                        // include: [
                        //     'QuestionnaireSatisfactionDoc',
                        //     'PaiementDoc',
                        //     'DocumentsFinanceurDoc',
                        //     'FicheControleFinaleDoc',
                        // ],
                        where: {
                            user_id: idStudent,
                            session_id: id
                        }
                    })
                        .then(pref => {
                            if (pref instanceof ApresFormationDocs) return Responder({ status: HttpStatusCode.Ok, data: pref })
                            else return Responder({ status: HttpStatusCode.Ok, data: {} })
                        })
                        .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    break;

                case 'during':
                    return this.pdocsModel.findOne({
                        // include: [
                        //     'QuestionnaireSatisfactionDoc',
                        //     'PaiementDoc',
                        //     'DocumentsFinanceurDoc',
                        //     'FicheControleFinaleDoc',
                        // ],
                        where: {
                            user_id: idStudent,
                            session_id: id
                        }
                    })
                        .then(pref => {
                            if (pref instanceof ApresFormationDocs) return Responder({ status: HttpStatusCode.Ok, data: pref })
                            else return Responder({ status: HttpStatusCode.Ok, data: {} })
                        })
                        .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    break;

                default:
                    return Responder({ status: HttpStatusCode.InternalServerError, data: `Key group must be included in before | during | after` })
                    break;
            }

        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async listOfLearnerByIdSession(idsession: number): Promise<ResponseServer> {

        StagiaireHasSession.belongsTo(Users, { foreignKey: "id_stagiaire" })
        return this.hasSessionStudentModel.findAndCountAll({
            subQuery: false,
            where: {
                id_sessionsuivi: idsession
            },
            attributes: ['id', 'id_stagiaire'],
            include: [
                {
                    model: Users,
                    required: true,
                    attributes: ['id', 'fs_name', 'ls_name', 'email', 'phone']
                },
                {
                    model: SessionSuivi,
                    required: true,
                    where: {
                        id: idsession
                    }
                },
                {
                    model: Payement,
                    required: false,
                },
            ]
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async createHomework(addSeanceSessionDto: AddHomeworkSessionDto): Promise<ResponseServer> {
        const { id_session, piece_jointe, id_formation, homework_date_on, score, id_cours } = addSeanceSessionDto
        try {
            const session = await this.sessionModel.findOne({ where: { id: id_session } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            const allConcernedStudent = await this.hasSessionStudentModel.findAll({ where: { id_sessionsuivi: id_session } })
            const studentsIds = allConcernedStudent.map(s => (s.toJSON()['id_stagiaire']));

            const { id_formation: as_id_formation } = session.toJSON()
            return this.homeworkModel.create({
                id_cours: id_cours,
                id_session: id_session as number,
                homework_date_on: Number(homework_date_on) as number,
                id_formation: as_id_formation,
                piece_jointe,
                score: Number(score) as number
            })
                .then(seance => {
                    studentsIds.forEach(id => {
                        this.hashomeworkModel.create({
                            id_cours,
                            date_de_creation: new Date(),
                            date_de_remise: homework_date_on,
                            id_session,
                            id_user: id,
                            id_formation: as_id_formation,
                            piece_jointe,
                            is_returned: 0,
                            score: Number(score) as number,
                            score_on: 0
                        })
                    })
                    return Responder({ status: HttpStatusCode.Created, data: seance })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async listOfLearnerByConnectedFormateur(user: IJwtSignin): Promise<ResponseServer> {

        let list = await this.sessionModel.findAll({ where: { id_superviseur: { [Op.contains]: [user.id_user] } }, attributes: ['id', 'id_superviseur'] })
        const allowed = list.map(l => l.toJSON()['id'])
        StagiaireHasSession.belongsTo(Users, { foreignKey: "id_stagiaire" })

        return this.hasSessionStudentModel.findAndCountAll({
            attributes: ['id', 'id_stagiaire'],
            include: [
                {
                    model: Users,
                    required: true,
                    attributes: ['id', 'fs_name', 'ls_name', 'email', 'phone']
                },
                {
                    model: SessionSuivi,
                    required: true,
                    where: {
                        id_superviseur: user.id_user,
                        id: {
                            [Op.in]: allowed
                        }
                    }
                },
                {
                    model: Payement,
                    required: false,
                },
            ]
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async listAllSessionsByOwn(user: IJwtSignin): Promise<ResponseServer> {

        const { id_user } = user
        StagiaireHasSession.belongsTo(Formations, { foreignKey: "id_formation" })
        StagiaireHasSession.belongsTo(SessionSuivi, { foreignKey: "id_sessionsuivi" })
        Formations.belongsTo(Categories, { foreignKey: "id_category" })

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
                        // {
                        //     model: Thematiques,
                        //     required: true,
                        //     attributes: ['id', 'thematic']
                        // },
                        // {
                        //     model: Categories,
                        //     required: true,
                        //     attributes: ['id', 'category']
                        // }
                    ]
                }
            ],
            where: {
                id_stagiaire: id_user
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async listAllSessionsByOwnAsFormateur(user: IJwtSignin): Promise<ResponseServer> {
        const { id_user } = user
        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })

        return this.sessionModel.findAndCountAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                }
            ],
            where: {
                status: 1,
                id_superviseur: {
                    [Op.contains]: [id_user]
                }
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async listAllSessionsByIdInstructor(idinstructor: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        SessionSuivi.belongsTo(Users, { foreignKey: "id_superviseur" })

        return this.sessionModel.findAndCountAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Users,
                    required: false,
                    as: "Superviseur",
                    attributes: ['id', 'fs_name', 'ls_name', 'email']
                }
            ],
            where: {
                status: 1,
                id_superviseur: {
                    [Op.contains]: [idinstructor]
                }
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async getSessionById(idsession: number): Promise<ResponseServer> {
        try {
            SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
            SessionSuivi.belongsTo(Users, { foreignKey: "id_superviseur", })
            // Listcours.belongsTo(Cours, { foreignKey: "id_preset_cours",  })
            Cours.belongsTo(Listcours, { foreignKey: "id_preset_cours" });
            SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" });

            SessionSuivi.hasMany(Cours, { foreignKey: "id_session" })

            return this.sessionModel.findOne({
                subQuery: false,
                include: [
                    {
                        model: Formations,
                        required: true,
                        attributes: ['id', 'titre', 'sous_titre', 'description']
                    },
                    {
                        model: Users,
                        required: false,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: Cours,
                        required: false,
                        include: [
                            {
                                model: Listcours,
                                required: true,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt', 'createdBy'],
                                }
                            }
                        ],
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        }
                    },
                ],
                where: {
                    id: idsession
                }
            })
                .then(session => {
                    if (session instanceof SessionSuivi) return Responder({ status: HttpStatusCode.Ok, data: session })
                    else return Responder({ status: HttpStatusCode.NotFound, data: session })
                })
                .catch(_ => {
                    return Responder({ status: HttpStatusCode.InternalServerError, data: _.toString() })
                })
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async getAllSessionByIdFormation(idsession: number): Promise<ResponseServer> {
        try {
            SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
            SessionSuivi.belongsTo(Users, { foreignKey: "id_superviseur", })
            Cours.belongsTo(Listcours, { foreignKey: "id_preset_cours" });
            SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" });
            SessionSuivi.hasMany(Cours, { foreignKey: "id_session" })

            return this.sessionModel.findAll({
                subQuery: false,
                include: [
                    {
                        model: Formations,
                        required: true,
                        attributes: ['id', 'titre', 'sous_titre', 'description'],
                        where: {
                            id: idsession
                        }
                    },
                    {
                        model: Users,
                        required: false,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: Cours,
                        required: false,
                        include: [
                            {
                                model: Listcours,
                                required: true,
                                attributes: {
                                    exclude: ['createdAt', 'updatedAt', 'createdBy'],
                                }
                            }
                        ],
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        }
                    },
                ],
                where: {
                    status: 1
                }
            })
                .then(session => {
                    return Responder({ status: HttpStatusCode.Ok, data: { length: session.length, list: session } })
                })
                .catch(_ => {
                    return Responder({ status: HttpStatusCode.InternalServerError, data: _.toString() })
                })
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
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
                                    const { id } = record?.toJSON()
                                    this.apdocsModel.create({
                                        session_id: id as number,
                                        user_id: id_user,
                                    })
                                    this.adocsModel.create({
                                        session_id: id as number,
                                        user_id: id_user,
                                    })
                                    this.pdocsModel.create({
                                        session_id: id as number,
                                        user_id: id_user,
                                    })
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
        const { id_session, piece_jointe, seance_date_on, type_seance, id_formation, duree, id_cours } = addSeanceSessionDto
        try {
            const session = await this.sessionModel.findOne({ where: { id: id_session } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            const { id_formation: as_id_formation } = session.toJSON()
            return this.seancesModel.create({
                duree,
                id_cours,
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
    async listAllSeancesBySession(id_session: number, id_cours: number): Promise<ResponseServer> {
        try {
            return this.seancesModel.findAndCountAll({
                where: {
                    id_session: id_session,
                    id_cours: id_cours
                }
            })
                .then(({ count, rows }) => {
                    return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
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

        const { description, prix, date_session_debut, date_session_fin, id_superviseur, id_formation, id_controleur, type_formation, nb_places } = createSessionDto
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
                    const { id_category, sous_titre, titre } = form.toJSON()
                    return this.sessionModel.create({
                        description: description,
                        duree: data as string,
                        date_session_debut: date_session_debut,
                        date_session_fin: date_session_fin,
                        id_category,
                        id_controleur,
                        id_superviseur: [id_superviseur ?? 0],
                        prix: prix,
                        type_formation,
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
                                        .then(async (formateur) => {
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
    async listAllSessionByKeyword(user: IJwtSignin, keyword: string): Promise<ResponseServer> {

        const { id_user } = user
        StagiaireHasSession.belongsTo(Formations, { foreignKey: "id_formation" })
        StagiaireHasSession.belongsTo(SessionSuivi, { foreignKey: "id_sessionsuivi" })
        Formations.belongsTo(Categories, { foreignKey: "id_category" })

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
                    where: {
                        titre: {
                            [Op.like]: `%${keyword}`
                        }
                    },
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
    async listAllSession(): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })

        return this.sessionModel.findAndCountAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
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
    async listAllSessionByGroupe(user: IJwtSignin, group: 'active' | 'upcoming' | 'completed'): Promise<ResponseServer> {
        const { id_user } = user
        StagiaireHasSession.belongsTo(Formations, { foreignKey: "id_formation" })
        StagiaireHasSession.belongsTo(SessionSuivi, { foreignKey: "id_sessionsuivi" })
        Formations.belongsTo(Categories, { foreignKey: "id_category" })

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
                }
            ],
            where: {
                status: 1,
                id_stagiaire: id_user
            }
        })
            .then(({ count, rows }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(_ => {
                log(_)
                return Responder({ status: HttpStatusCode.InternalServerError, data: _ })
            })
    }
    async gatAllSessionsByThematic(idThematic: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
                },
                {
                    model: Categories,
                    required: true,
                    attributes: ['id', 'category']
                }
            ],
            where: {
                status: 1,
                // id_thematic: idThematic
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
    async gatAllSessionsByThematicAndCategory(idThematic: number, idCategory: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
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
    async gatAllSessionsByCategory(idCategory: number): Promise<ResponseServer> {

        SessionSuivi.belongsTo(Categories, { foreignKey: "id_category" })
        SessionSuivi.belongsTo(Formations, { foreignKey: "id_formation" })
        return this.sessionModel.findAll({
            include: [
                {
                    model: Formations,
                    required: true,
                    attributes: ['id', 'titre', 'sous_titre', 'description']
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
                id: idSession,
                status: 1 // On ne peut modifier que les sessions actives
            }
        })
            .then(inst => {
                if (inst instanceof SessionSuivi) {
                    const { date_session_debut, date_session_fin, description, id_category, id_formation, type_formation, designation, id_controleur, id_superviseur, piece_jointe, prix } = updateSessionDto
                    return inst.update({
                        date_session_debut,
                        date_session_fin,
                        description,
                        designation,
                        id_category,
                        id_controleur,
                        id_formation,
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
    async assignFormateurToSession(updateSessionDto: AssignFormateurToSessionDto): Promise<ResponseServer> {
        const { id_cours, id_user } = updateSessionDto;

        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId", });
        const user = await this.usersModel.findOne({
            where: { id: id_user },
            include: [
                {
                    model: Roles,
                    required: true,
                    where: {
                        id: 3
                    }
                }
            ],
        });

        if (!user) return Responder({ status: HttpStatusCode.BadRequest, data: "Une session ne peut être attribuer qu'à un formateur ! id_user passé ne correspond à aucun formateur !" })
        return this.coursModel.findOne({
            where: {
                id: id_cours
            }
        })
            .then(inst => {
                if (inst instanceof Cours) {
                    return inst.update({
                        createdBy: id_user
                    })
                        .then(_ => Responder({ status: HttpStatusCode.Ok, data: inst }))
                        .catch(_ => Responder({ status: HttpStatusCode.BadRequest, data: _ }))
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: `Le Cours n'a pas été retrouvée [id] :${id_user}` })
                }
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
}
