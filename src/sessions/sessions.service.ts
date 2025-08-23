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
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { typesprestations } from 'src/utils/utiles.typesprestation';
import { typesrelances } from 'src/utils/utiles.typerelances';
import { typesactions } from 'src/utils/utiles.actionreprendre';
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
import { Payement } from 'src/models/model.payementbycard';
import { UploadDocumentToSessionDto } from './dto/add-document-session.dto';
import { CreateSurveyDto } from './dto/create-session-questionnaire.dto';
import { Survey } from 'src/models/model.questionspourquestionnaireinscription';
import { Questionnaires } from 'src/models/model.questionnaireoninscriptionsession';
import { Options } from 'src/models/model.optionquestionnaires';
import { Payementopco } from 'src/models/model.payementbyopco';
import { CpfPaymentDto, PayementOpcoDto } from './dto/payement-method-opco.dto';
import { CreateSessionFullStepDto } from './dto/create-sesion-fulldoc.dto';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { IInternalResponse } from 'src/interface/interface.internalresponse';
import { CreateSessionPaiementDto } from './dto/create-payment-full-dto';
import { RequiredDocument } from 'src/utils/utiles.documentskeyenum';
import { SurveyResponse } from 'src/models/model.surveyresponses';
import { ISurveyResponse } from 'src/interface/interface.stagiairehassession';
import { Stripe } from 'stripe';

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

        @InjectModel(Payementopco)
        private readonly payementOpcoModel: typeof Payementopco,

        @InjectModel(Survey)
        private readonly surveyModel: typeof Survey,

        @InjectModel(Questionnaires)
        private readonly questionModel: typeof Questionnaires,

        @InjectModel(Options)
        private readonly optionsModel: typeof Options,

        @InjectModel(SurveyResponse)
        private readonly surveyResponseModel: typeof SurveyResponse,

        private readonly allServices: AllSercices,
        private readonly serviceMail: MailService,
        @Inject(Sequelize) private readonly sequelize: Sequelize
    ) { }

    async createSessionFullStep(createSessionDto: CreateSessionFullStepDto, user: IJwtSignin): Promise<ResponseServer> {
        const transaction = await this.sequelize.transaction();

        try {
            const { questions } = createSessionDto;

            const session = await this.handleCreationOfSession(createSessionDto, transaction, user);
            if (session.code !== HttpStatusCode.Created) {
                await transaction.rollback();
                return Responder({ status: session.code, data: session.data });
            }

            const sessionId = (session.data as SessionSuivi).id;

            const survey = await this.handleCreationOfSurvey({ questions, id_session: sessionId }, user, transaction);
            if (survey.code !== HttpStatusCode.Created) {
                await transaction.rollback();
                return Responder({ status: survey.code, data: survey.data });
            }

            await transaction.commit();
            return Responder({ status: HttpStatusCode.Created, data: { session: session.data, survey: survey.data } });

        } catch (error) {
            await transaction.rollback();
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async deleteSurveyById(id: number): Promise<ResponseServer> {
        try {
            const survey = await this.surveyModel.findByPk(id);
            if (!survey) return Responder({ status: HttpStatusCode.NotFound, data: "Survey not found" });

            await survey.destroy({ force: true });
            return Responder({ status: HttpStatusCode.Ok, data: "Survey deleted successfully" });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async getSurveyByIdSession(id_session: number): Promise<ResponseServer> {
        try {
            const survey = await this.surveyModel.findOne({
                where: { id_session },
                include: [
                    {
                        model: Questionnaires,
                        required: true,
                        include: [
                            {
                                model: Options,
                                required: false
                            }
                        ]
                    }
                ]
            });
            if (!survey) return Responder({ status: HttpStatusCode.NotFound, data: "Survey not found" });
            return Responder({ status: HttpStatusCode.Ok, data: survey });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async addSurveyToSession(createSurveyDto: CreateSurveyDto, user: IJwtSignin): Promise<ResponseServer> {
        return this.handleCreationOfSurvey(createSurveyDto, user, null)
            .then((survey) => {
                return Responder({ status: HttpStatusCode.Created, data: survey });
            })
            .catch((error) => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: error });
            });
    }
    async validatePayment(id_payment: number, user: IJwtSignin): Promise<ResponseServer> {
        try {
            const payment = await this.payementModel.findOne({
                where: { id: id_payment },
                // include: [
                //     {
                //         model: Users,
                //         required: true,
                //         attributes: ['id', 'fs_name', 'ls_name', 'email']
                //     },
                //     {
                //         model: SessionSuivi,
                //         required: true,
                //         attributes: ['id', 'title', 'description']
                //     }
                // ]
            });
            if (!payment) return Responder({ status: HttpStatusCode.NotFound, data: "Payment not found or already validated" });
            if (payment.status === 1) return Responder({ status: HttpStatusCode.BadRequest, data: "Payment already validated" });
            payment.status = 1;
            await payment.save();
            this.hasSessionStudentModel.update({
                id_payement: payment.id
            }, { where: { id: payment.id_session_student } });
            return Responder({ status: HttpStatusCode.Ok, data: payment });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async getPaymentsAll(user: IJwtSignin, status: number): Promise<ResponseServer> {
        try {
            if ([0, 1].indexOf(status) === -1) return Responder({ status: HttpStatusCode.BadRequest, data: "Invalid status only 0 or 1 are allowed" });
            const payments_cards = await this.payementModel.findAll({
                where: { status },
                subQuery: false,
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: SessionSuivi,
                        required: true,
                        attributes: ['id', 'designation', 'description']
                    }
                ]
            });
            const payments_opco = await this.payementOpcoModel.findAll({
                where: { status },
                subQuery: false,
                include: [
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: SessionSuivi,
                        required: true,
                        attributes: ['id', 'designation', 'description']
                    }
                ]
            });
            return Responder({ status: HttpStatusCode.Ok, data: { length: payments_cards.length + payments_opco.length, by_card: payments_cards, by_opco: payments_opco } });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async uploadDocumentToSessionDTO(user: IJwtSignin, uploadDocumentDto: UploadDocumentToSessionDto, group: string): Promise<ResponseServer> {
        const { id_session, key_document: document_type, description, document, piece_jointe } = uploadDocumentDto;
        try {
            const sess = await this.sessionModel.findOne({ where: { id: id_session } });
            if (!sess) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const userSession = await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: id_session, id_stagiaire: user.id_user } });
            if (!userSession) return Responder({ status: HttpStatusCode.NotFound, data: "L'utilisateur ciblé n'a pas été retrouvé dans cette session !" });

            return this.documentModel.create({
                id_session_student: userSession.id,
                id_session: id_session as number,
                id_student: user.id_user,
                key_document: document_type,
                document: document,
                piece_jointe,
                group
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
    async payementByOpco(user: IJwtSignin, payementOpcoDto: PayementOpcoDto): Promise<ResponseServer> {
        const { id_session, id_user, nom_opco, nom_entreprise, siren, nom_responsable, telephone_responsable, email_responsable } = payementOpcoDto;
        try {
            const sess = await this.sessionModel.findOne({ where: { id: id_session } });
            if (!sess) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const userSession = await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: id_session, id_stagiaire: user.id_user } });
            if (!userSession) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            let student = await this.usersModel.findOne({ where: { id: user.id_user }, raw: true });
            if (!student) return Responder({ status: HttpStatusCode.NotFound, data: "L'utilisateur ciblé n'a pas été retrouvé !" });
            return this.payementOpcoModel.create({
                id_session,
                id_session_student: userSession.id as number,
                id_user: user.id_user,
                nom_opco,
                nom_entreprise,
                siren,
                nom_responsable,
                telephone_responsable,
                email_responsable
            })
                .then(async doc => {
                    if (doc instanceof Payementopco) {

                        const p = await this.serviceMail.onPayementSession({
                            to: student.email,
                            fullname: this.allServices.fullName({ fs: student.fs_name, ls: student.ls_name }),
                            session: sess.designation as string,
                            amount: sess.prix as number,
                            currency: 'EUR',
                        })
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
        const { id_session, id_user, full_name, card_number, month, year, cvv, id_stripe_payment } = payementSessionDto;
        try {
            const sess = await this.sessionModel.findOne({ where: { id: id_session } });
            if (!sess) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });
            const session = await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: id_session, id_stagiaire: student.id_user } });
            const user = await this.usersModel.findOne({ where: { id: student.id_user } });
            if (!user) return Responder({ status: HttpStatusCode.NotFound, data: "L'utilisateur ciblé n'a pas été retrouvé !" });
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session ciblée n'a pas été retrouvé !" });

            return this.payementModel.create({
                id_session: id_session as number,
                id_session_student: session?.id as number,
                id_user: student.id_user,
                full_name,
                card_number,
                amount: sess.prix as number,
                month,
                year,
                id_stripe_payment,
                cvv
            })
                .then(async payement => {
                    if (payement instanceof Payement) {

                        const p = await this.serviceMail.onPayementSession({
                            to: user.email,
                            fullname: this.allServices.fullName({ fs: user.fs_name, ls: user.ls_name }),
                            session: sess.designation as string,
                            amount: sess.prix as number,
                            currency: 'EUR',
                        })
                        return Responder({ status: HttpStatusCode.Created, data: payement })
                        // return this.allServices.onPay({
                        //     currency: 'EUR',
                        //     amount: sess.prix as number,
                        //     payment_method_types: ['card']
                        // })
                        //     .then((infos) => {
                        //         const { code, data } = infos
                        //         if (code === 200) {
                        //             const { clientSecret, id, amount, currency, status } = data;
                        //             payement.update({ status: 1 })
                        //             this.serviceMail.onPayementSession({
                        //                 to: user.email,
                        //                 fullname: this.allServices.fullName({ fs: user.fs_name, ls: user.ls_name }),
                        //                 session: sess.designation as string,
                        //                 amount: sess.prix as number,
                        //                 currency: 'EUR',
                        //             })
                        //             return Responder({ status: HttpStatusCode.Created, data })
                        //         } else {
                        //             return Responder({ status: HttpStatusCode.BadRequest, data: "Le paiement n'a pas pu être effectué !" })
                        //         }
                        //     })
                        //     .catch(err => {
                        //         return Responder({ status: HttpStatusCode.InternalServerError, data: err })
                        //     })
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
            return this.documentModel.findAll({
                include: [
                    {
                        model: SessionSuivi,
                        required: true,
                        // attributes:
                    },
                    {
                        model: Users,
                        required: true,
                        as: "Student",
                        attributes: ['id', 'fs_name', 'ls_name', 'phone', 'email']
                    }
                ],
                where: {
                    group: String(group).toUpperCase(),
                    id_student: idStudent,
                    id_session: idSession,
                    id_session_student: id
                }
            })
                .then(pref => Responder({ status: HttpStatusCode.Ok, data: { length: pref.length, list: pref } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
            // switch (group) {
            //     case 'after':
            //         return this.documentModel.findAll({
            //             include: [
            //                 {
            //                     model: StagiaireHasSession,
            //                     required: true
            //                 }
            //             ],
            //             where: {
            //                 id_student: idStudent,
            //                 id_session: id
            //             }
            //         })
            //             .then(pref => Responder({ status: HttpStatusCode.Ok, data: { length: pref.length, list: pref } }))
            //             .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
            //         break;

            //     case 'before':
            //         return this.adocsModel.findOne({
            //             // include: [
            //             //     'QuestionnaireSatisfactionDoc',
            //             //     'PaiementDoc',
            //             //     'DocumentsFinanceurDoc',
            //             //     'FicheControleFinaleDoc',
            //             // ],
            //             where: {
            //                 user_id: idStudent,
            //                 session_id: id
            //             }
            //         })
            //             .then(pref => {
            //                 if (pref instanceof ApresFormationDocs) return Responder({ status: HttpStatusCode.Ok, data: pref })
            //                 else return Responder({ status: HttpStatusCode.Ok, data: {} })
            //             })
            //             .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
            //         break;

            //     case 'during':
            //         return this.pdocsModel.findOne({
            //             // include: [
            //             //     'QuestionnaireSatisfactionDoc',
            //             //     'PaiementDoc',
            //             //     'DocumentsFinanceurDoc',
            //             //     'FicheControleFinaleDoc',
            //             // ],
            //             where: {
            //                 user_id: idStudent,
            //                 session_id: id
            //             }
            //         })
            //             .then(pref => {
            //                 if (pref instanceof ApresFormationDocs) return Responder({ status: HttpStatusCode.Ok, data: pref })
            //                 else return Responder({ status: HttpStatusCode.Ok, data: {} })
            //             })
            //             .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
            //         break;

            //     default:
            //         return Responder({ status: HttpStatusCode.InternalServerError, data: `Key group must be included in before | during | after` })
            //         break;
            // }

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
    async listAllSessionsByOwnAndStatus(user: IJwtSignin, status: number): Promise<ResponseServer> {

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
                status: status,
                id_stagiaire: id_user
            }
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
                id_stagiaire: id_user,
                status: 1 // Assuming 1 means active sessions
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
                        model: Survey,
                        required: false,
                        include: [
                            {
                                model: Questionnaires,
                                required: true,
                                include: [
                                    {
                                        model: Options,
                                        required: false
                                    }
                                ]
                            }
                        ],
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
    async webhookStripePayment(event: Stripe.Event): Promise<ResponseServer> {
        try {
            if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                const pay = await this.payementModel.findOne({ where: { id_stripe_payment: paymentIntent.id } });

                if (pay instanceof Payement) {
                    let newStatus = 0; // par défaut non payé

                    switch (paymentIntent.status) {
                        case 'succeeded':
                            newStatus = 1; // payé
                            break;
                        case 'requires_payment_method':
                        case 'requires_confirmation':
                            newStatus = 0; // pas encore payé
                            break;
                        case 'requires_action':
                        case 'processing':
                            newStatus = 0; // en attente
                            break;
                        case 'canceled':
                            newStatus = 2; // failed
                            break;
                        default:
                            newStatus = 2; // failed (catch-all)
                    }

                    await pay.update({ status: newStatus });

                    if (newStatus === 1) {
                        await this.hasSessionStudentModel.update(
                            { id_payement: pay.id, status: 1 },
                            { where: { id: pay.id_session_student } },
                        );
                    }
                }
            }

            return Responder({ status: HttpStatusCode.Ok, data: 'Event received' });
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }
    async applyToSession(applySessionDto: CreateSessionPaiementDto, user: IJwtSignin): Promise<ResponseServer> {
        const { id_session, payment, roi_accepted, responses_survey } = applySessionDto;
        const { id_user } = user;
        const transaction = await this.sequelize.transaction();

        try {
            if (!roi_accepted) {
                await transaction.rollback();
                return Responder({ status: HttpStatusCode.BadRequest, data: "Vous devez accepter le ROI pour postuler à cette session !" });
            }

            const student = await this.usersModel.findOne({ where: { id: id_user, status: 1 } });
            if (!student) {
                await transaction.rollback();
                return Responder({ status: HttpStatusCode.NotFound, data: "Targeted user not found" });
            }

            const { fs_name, ls_name, phone, email } = student.toJSON();
            const fullname = this.allServices.fullName({ fs: fs_name, ls: ls_name });

            const inst = await this.sessionModel.findOne({
                include: [{ model: Formations, required: true }],
                where: { id: id_session }
            });

            if (!(inst instanceof SessionSuivi)) {
                await transaction.rollback();
                return Responder({ status: HttpStatusCode.BadRequest, data: "La session ciblée n'a pas été retrouvée !" });
            }

            const { id_formation, designation, Formation, prix, nb_places_disponible } = inst.toJSON() as any;
            const { titre } = Formation;

            const [record, isNew] = await this.hasSessionStudentModel.findOrCreate({
                transaction,
                where: { id_sessionsuivi: id_session, id_stagiaire: id_user },
                defaults: {
                    id_sessionsuivi: id_session,
                    id_stagiaire: id_user,
                    date_mise_a_jour: this.allServices.nowDate(),
                    id_formation,
                    status: 0,
                }
            });

            if (!isNew) {
                await transaction.rollback();
                return Responder({ status: HttpStatusCode.BadRequest, data: "Vous êtes déjà inscrit à cette session" });
            }

            if (nb_places_disponible <= 0) {
                await transaction.rollback();
                return Responder({ status: HttpStatusCode.Forbidden, data: "Il n'y a plus de place disponible !" });
            }

            const { id } = record.toJSON();

            // await this.apdocsModel.create({ session_id: id, user_id: id_user }, { transaction });
            // await this.adocsModel.create({ session_id: id, user_id: id_user }, { transaction });
            // await this.pdocsModel.create({ session_id: id, user_id: id_user }, { transaction });

            if (responses_survey && responses_survey.length > 0) {
                await this.surveyResponseModel.bulkCreate(
                    responses_survey.map((r: ISurveyResponse) => ({
                        id_question: r.id_question,
                        id_stagiaire_session: id,
                        id_user,
                        answer: r.answer,
                    })),
                    { transaction }
                );
            }

            if (payment?.method) {
                switch (payment.method) {
                    case 'CARD':
                        const card = payment.card as CreatePaymentSessionDto;
                        const base = String(card.callback).endsWith("/")
                            ? String(card.callback)
                            : String(card.callback) + "/";
                        const stripeResp = await this.allServices.onPay({
                            amount: parseFloat(prix as string) * 100,
                            currency: 'eur',
                            payment_method_types: ['card'],
                            return_url: `${base}trainings/${id_formation}/${id_session}/success-payment?amount=${prix}&trainingId=${id_formation}&sessionId=${id_session}`
                        });

                        if (stripeResp.code !== 200) {
                            await transaction.rollback();
                            console.error(stripeResp.data);
                            return Responder({ status: HttpStatusCode.BadRequest, data: "Erreur lors de la création du paiement Stripe" });
                        }

                        const { clientSecret, id: id_stripe_payment } = stripeResp.data;

                        await this.payementModel.create({
                            id_session,
                            id_session_student: id,
                            id_user,
                            full_name: fullname,
                            card_number: card.card_number,
                            amount: prix,
                            month: card.month,
                            year: card.year,
                            cvv: card.cvv,
                            id_stripe_payment: id_stripe_payment
                        }, { transaction });

                        this.serviceMail.onWelcomeToSessionStudent({
                            to: email,
                            formation_name: titre,
                            fullname,
                            session_name: designation,
                            asAttachement: true
                        });
                        await transaction.commit();
                        return Responder({
                            status: HttpStatusCode.Created,
                            data: {
                                message: "Inscription et paiement initiés avec succès",
                                record,
                                callback: {
                                    clientSecret,
                                    paymentId: id_stripe_payment,
                                    amount: prix,
                                    currency: 'eur',
                                    returnUrl: `${base}trainings/${id_formation}/${id_session}/success-payment`
                                }
                            }
                        });
                        break;

                    case 'OPCO':
                        const opco = payment.opco as PayementOpcoDto;
                        await this.payementOpcoModel.create({
                            id_session,
                            id_session_student: id as number,
                            id_user,
                            siren: opco.siren,
                            nom_opco: opco.nom_opco,
                            nom_entreprise: opco.nom_entreprise,
                            nom_responsable: opco.nom_responsable,
                            telephone_responsable: opco.telephone_responsable,
                            email_responsable: opco.email_responsable,
                        }, { transaction });
                        break;

                    case 'CPF':
                        this.allServices.onPay({
                            amount: prix,
                            currency: 'EUR',
                            payment_method_types: ['card']
                        })
                        await transaction.commit();
                        return Responder({ status: HttpStatusCode.Created, data: "Méthode de paiement CPF non prise en charge" });

                    default:
                        await transaction.rollback();
                        return Responder({ status: HttpStatusCode.BadRequest, data: "Méthode de paiement non prise en charge" });
                }
            }

            this.serviceMail.onWelcomeToSessionStudent({
                to: email,
                formation_name: titre,
                fullname,
                session_name: designation,
                asAttachement: true
            });

            await transaction.commit();
            return Responder({ status: HttpStatusCode.Created, data: record });

        } catch (error) {
            await transaction.rollback();
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
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
    async handleCreationOfSession(createSessionDto: any, transaction: any, user: IJwtSignin | null): Promise<IInternalResponse> {
        const {
            description,
            date_session_debut,
            date_session_fin,
            id_superviseur,
            id_formation,
            id_controleur,
            text_reglement,
            required_documents,
            nb_places,
            payment_methods
        } = createSessionDto;

        const form = await this.formationModel.findOne({
            where: { status: 1, id: id_formation },
        });

        if (!(form instanceof Formations)) {
            return {
                code: HttpStatusCode.NotFound,
                data: 'La formation ciblée na pas été retrouvée sur notre serveur !',
            };
        }

        const s_on = this.allServices.parseDate(date_session_debut as any);
        const e_on = this.allServices.parseDate(date_session_fin as any);

        const { code, data, message } = this.allServices.calcHoursBetweenDates(
            { start: date_session_debut, end: date_session_fin },
            true,
        );
        if (code !== 200) return { code: HttpStatusCode.BadRequest, data };

        const designation_start = this.allServices.formatDate({ dateString: s_on as any });
        const designation_end = this.allServices.formatDate({ dateString: e_on as any });
        if (!designation_end || !designation_start)
            return {
                code: HttpStatusCode.BadRequest,
                data: 'Date_start and Date_end must be type of date !',
            };

        const designation = this.allServices.createDesignationSessionName({
            start: designation_start,
            end: designation_end,
        });
        const uuid = this.allServices.generateUuid();

        try {
            const {
                id_category,
                prix,
                type_formation,
            } = form.toJSON();

            const formation = await this.sessionModel.create({
                description,
                duree: data as string,
                date_session_debut,
                date_session_fin,
                id_category,
                id_controleur,
                text_reglement,
                id_superviseur: [id_superviseur ?? 0],
                prix: prix as number > 0 ? this.allServices.calcTotalAmount(prix as number) : 0,
                initial_price: prix as number,
                type_formation,
                required_documents: required_documents ?? [],
                id_formation,
                payment_methods: payment_methods ?? [],
                nb_places,
                designation: designation.toUpperCase(),
                date_mise_a_jour: null,
                status: 1,
                uuid,
                createdBy: user?.id_user ?? id_superviseur ?? 0,
            },
                { transaction },
            );

            if (!(formation instanceof SessionSuivi)) {
                return { code: HttpStatusCode.BadRequest, data: formation };
            }

            const { id } = formation?.toJSON();

            if (!id_superviseur) {
                return { code: HttpStatusCode.Created, data: formation };
            }

            // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: 'RoleId' });
            // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: 'UserId', otherKey: 'RoleId' });

            const formateur = await this.usersModel.findOne({
                include: [
                    {
                        model: Roles,
                        required: true,
                        where: { id: 3 },
                    },
                ],
                where: { id: id_superviseur },
            });

            if (!formateur) {
                return {
                    code: HttpStatusCode.BadRequest,
                    data: 'Les identifiants fournis du formateur sont incorrects [id_formateur]',
                };
            }

            await this.hasSessionFormateurModel.create(
                {
                    SessionId: id as number,
                    UserId: id_superviseur,
                    is_complited: 0,
                    status: 1,
                },
                { transaction },
            );

            return { code: HttpStatusCode.Created, data: formation };
        } catch (err) {
            return { code: HttpStatusCode.InternalServerError, data: err };
        }
    }
    async handleCreationOfSurvey(createSurveyDto: CreateSurveyDto, user: IJwtSignin, transaction: any): Promise<IInternalResponse> {
        const { questions } = createSurveyDto;

        try {
            const survey = await this.surveyModel.create({
                ...createSurveyDto,
                created_by: user.id_user,
            }, { transaction });

            if (!(survey instanceof Survey)) {
                return { code: HttpStatusCode.InternalServerError, data: "Échec de la création du questionnaire." };
            }

            const { id } = survey.toJSON();

            for (const question of questions) {
                const { is_required, options, titre, type_question, description } = question;

                const qst = await this.questionModel.create({
                    titre,
                    is_required,
                    id_questionnaire: id,
                    type: type_question,
                    description,
                }, { transaction });

                if (qst instanceof Questionnaires) {
                    for (const option of options) {
                        await this.optionsModel.create({
                            text: option.text,
                            is_correct: option.is_correct,
                            id_question: qst.id,
                        }, { transaction });
                    }
                }
            }

            return { code: HttpStatusCode.Created, data: survey };
        } catch (error) {
            return { code: HttpStatusCode.InternalServerError, data: error };
        }
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
        return this.handleCreationOfSession(createSessionDto, null, null)
            .then(({ code, data }) => {
                if (code === HttpStatusCode.Created) {
                    return Responder({ status: code, data })
                } else {
                    return Responder({ status: code, data })
                }
            })
            .catch(err => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
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

        // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId", });
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
