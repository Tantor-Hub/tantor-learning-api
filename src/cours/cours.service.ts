import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { ResponseServer } from 'src/interface/interface.response';
import { Listcours } from 'src/models/model.cours';
import { Messages } from 'src/models/model.messages';
import { Planings } from 'src/models/model.planings';
import { Cours } from 'src/models/model.sessionshascours';
import { AllSercices } from 'src/services/serices.all';
import { MailService } from 'src/services/service.mail';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateCoursDto } from './dto/create-cours.dto';
import { CreatePresetCoursDto } from './dto/create-preset-cours.dto';
import { CreationAttributes } from 'sequelize';
import { AddHomeworkSessionDto } from 'src/sessions/dto/add-homework.dto';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { FormateurHasSession } from 'src/models/model.formateurhassession';
import { HomeworksSession } from 'src/models/model.homework';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { SessionSuivi } from 'src/models/model.suivisession';
import { AssignFormateurToSessionDto } from 'src/sessions/dto/attribute-session.dto';
import { Users } from 'src/models/model.users';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { Documents } from 'src/models/model.documents';
import { CreateCoursContentDto } from './dto/create-cours-content.dto';
import { Chapitre } from 'src/models/model.chapitres';
import { log } from 'console';
import { IChapitres } from 'src/interface/interface.cours';

@Injectable()
export class CoursService {
    constructor(
        private readonly allSercices: AllSercices,
        private readonly mailService: MailService,

        @InjectModel(Messages)
        private readonly messageModel: typeof Messages,

        @InjectModel(Planings)
        private readonly planingModel: typeof Planings,

        @InjectModel(Cours)
        private readonly coursModel: typeof Cours,

        @InjectModel(SeanceSessions)
        private readonly seancesModel: typeof SeanceSessions,

        @InjectModel(SessionSuivi)
        private readonly sessionModel: typeof SessionSuivi,

        @InjectModel(Listcours)
        private readonly listcoursModel: typeof Listcours,

        @InjectModel(Users)
        private readonly usersModel: typeof Users,

        @InjectModel(StagiaireHasSession)
        private readonly hasSessionStudentModel: typeof StagiaireHasSession,

        @InjectModel(FormateurHasSession)
        private readonly hasSessionFormateurModel: typeof FormateurHasSession,

        @InjectModel(HomeworksSession)
        private readonly homeworkModel: typeof HomeworksSession,

        @InjectModel(StagiaireHasHomeWork)
        private readonly hashomeworkModel: typeof StagiaireHasHomeWork,

        @InjectModel(Chapitre)
        private readonly chapitrecoursModel: typeof Chapitre,

        @InjectModel(Documents)
        private readonly docModel: typeof Documents,
    ) { }
    async getDocumentsByCours(idcours: number): Promise<ResponseServer> {
        try {
            return this.docModel.findAll({
                where: {
                    id_cours: idcours
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'id_cours', 'id_session']
                },
                // include: [
                //     {
                //         model: Users,
                //         required: true,
                //         attributes: ['id', 'fs_name', 'ls_name', 'email']
                //     }
                // ]
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async getCoursById(idcours: number): Promise<ResponseServer> {
        try {
            return this.coursModel.findOne({
                where: {
                    id: idcours
                },
                attributes: {
                    exclude: ['id_thematic', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: Chapitre,
                        required: false,
                    },
                    {
                        model: Documents,
                        required: false,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'id_cours', 'id_session', 'createdBy']
                        }
                    },
                    {
                        model: SessionSuivi,
                        required: true,
                        attributes: ['designation', 'duree', 'type_formation']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: Listcours,
                        required: true,
                        attributes: ['id', 'title', 'description']
                    }
                ]
            })
                .then(cours => {
                    if (cours instanceof Cours) {
                        return Responder({ status: HttpStatusCode.Ok, data: cours })
                    } else {
                        return Responder({ status: HttpStatusCode.NotFound, data: "The item can not be found with the specifique ID" })
                    }
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async addCoursContent(user: IJwtSignin, content: CreateCoursContentDto): Promise<ResponseServer> {
        const { content: contents, id_cours } = content
        try {
            const cours = await this.coursModel.findOne({
                where: {
                    id: id_cours
                }
            })

            if (!cours) return Responder({ status: HttpStatusCode.NotFound, data: "The course with ID not found in the list" })
            const { createdBy } = cours?.toJSON()
            if (createdBy !== user.id_user) return Responder({ status: HttpStatusCode.Unauthorized, data: "This course is not assigned to this User as Teacher" });

            return await this.chapitrecoursModel.bulkCreate(contents.map(cont => {
                const { chapitre, paragraphes } = cont
                return ({
                    chapitre,
                    id_cours,
                    paragraphes
                }) as IChapitres
            }))
                .then(bulk => {
                    return Responder({ status: HttpStatusCode.Ok, data: bulk });
                })
                .catch(err => {
                    return Responder({ status: HttpStatusCode.InternalServerError, data: err })
                })
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async getListCoursAllBySesson(idsession: number): Promise<ResponseServer> {
        try {
            return this.coursModel.findAll({
                attributes: {
                    exclude: ['id_thematic', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: SessionSuivi,
                        required: true,
                        attributes: ['designation', 'duree', 'type_formation']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: Listcours,
                        required: true,
                        attributes: ['id', 'title', 'description']
                    }
                ],
                where: {
                    id_session: idsession
                }
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async getListCours(): Promise<ResponseServer> {
        try {
            return this.listcoursModel.findAll({
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: Users,
                        required: false,
                        as: "CreatedBy",
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    }
                ],
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async getListCoursAll(): Promise<ResponseServer> {
        try {
            return this.coursModel.findAll({
                attributes: {
                    exclude: ['id_thematic', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: SessionSuivi,
                        required: true,
                        attributes: ['designation', 'duree', 'type_formation']
                    },
                    {
                        model: Users,
                        required: true,
                        attributes: ['id', 'fs_name', 'ls_name', 'email']
                    },
                    {
                        model: Listcours,
                        required: true,
                        attributes: ['id', 'title', 'description']
                    }
                ]
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async addPresetCours(user: IJwtSignin, createCoursDto: CreatePresetCoursDto): Promise<ResponseServer> {
        const { title, description, } = createCoursDto
        try {
            const data: CreationAttributes<Listcours> = {
                title,
                description,
                createdBy: user.id_user,
            };
            return this.listcoursModel.create(data)
                .then(cours => {
                    if (cours instanceof Listcours) return Responder({ status: HttpStatusCode.Created, data: cours })
                    else return Responder({ status: HttpStatusCode.InternalServerError, data: cours })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async addCoursToLibrairie(idcours: number, user: IJwtSignin): Promise<ResponseServer> {
        try {
            const cours = await this.coursModel.findOne({
                where: {
                    id: idcours
                }
            })
            if (!cours) return Responder({ status: HttpStatusCode.NotFound, data: "The course with ID not found in the list" })
            const { createdBy, is_published } = cours?.toJSON()
            if (createdBy !== user.id_user) return Responder({ status: HttpStatusCode.Unauthorized, data: "This course is not assigned to this User as Teacher" })
            return cours.update({
                is_published: !is_published
            })
                .then(_ => Responder({ status: HttpStatusCode.Ok, data: cours }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async addCoursToSession(user: IJwtSignin, createCoursDto: CreateCoursDto): Promise<ResponseServer> {
        const { id_category, id_thematic, is_published, createdBy, id_formateur, id_preset_cours, duree, id_session, ponderation } = createCoursDto
        try {
            return this.coursModel.create({
                createdBy: user.id_user,
                id_category,
                id_preset_cours,
                id_session,
                duree,
                id_formateur,
                is_published,
                ponderation,
                status: 1,
            })
                .then(cours => {
                    if (cours instanceof Cours) return Responder({ status: HttpStatusCode.Created, data: cours })
                    else return Responder({ status: HttpStatusCode.InternalServerError, data: cours })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async createHomework(addSeanceSessionDto: AddHomeworkSessionDto): Promise<ResponseServer> {
        const { id_session, piece_jointe, id_formation, homework_date_on, score, id_cours } = addSeanceSessionDto
        try {
            const session = await this.sessionModel.findOne({ where: { id: id_session } })
            if (!session) return Responder({ status: HttpStatusCode.NotFound, data: "La session n'a pas été retrouvé !" })
            const allConcernedStudent = await this.hasSessionStudentModel.findAll({ where: { id_sessionsuivi: id_session } })
            const studentsIds = allConcernedStudent.map((s: any) => (s.toJSON()['id_stagiaire']));

            const { id_formation: as_id_formation } = session.toJSON()
            return this.homeworkModel.create({
                id_session: id_session as number,
                homework_date_on: Number(homework_date_on) as number,
                id_formation: as_id_formation,
                piece_jointe,
                score: Number(score) as number,
                id_cours
            })
                .then(seance => {
                    studentsIds.forEach(id => {
                        this.hashomeworkModel.create({
                            date_de_creation: new Date(),
                            date_de_remise: homework_date_on,
                            id_session,
                            id_user: id,
                            id_formation: as_id_formation,
                            piece_jointe,
                            is_returned: 0,
                            score: Number(score) as number,
                            score_on: 0,
                            id_cours
                        })
                    })
                    return Responder({ status: HttpStatusCode.Created, data: seance })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
    async assignFormateurToSession(manager: IJwtSignin, updateSessionDto: AssignFormateurToSessionDto): Promise<ResponseServer> {
        const { id_cours: id_session, id_user } = updateSessionDto;

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
        return this.sessionModel.findOne({
            where: {
                id: id_session
            }
        })
            .then(inst => {
                if (inst instanceof SessionSuivi) {
                    return inst.update({
                        id_superviseur: id_user,
                    })
                        .then(_ => Responder({ status: HttpStatusCode.Ok, data: inst }))
                        .catch(_ => Responder({ status: HttpStatusCode.BadRequest, data: _ }))
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: `La session n'a pas été retrouvée [id]:${id_user}` })
                }
            })
            .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
    }
    async addDocumentsToCours(user: IJwtSignin, document: CreateDocumentDto): Promise<ResponseServer> {
        const { id_user, roles_user } = user
        const { document_name, id_cours, id_document, piece_jointe, type, id_session } = document
        try {
            return this.docModel.create({
                file_name: document_name,
                url: piece_jointe,
                id_cours,
                id_session,
                type,
                createdBy: id_user
            })
                .then(doc => {
                    if (doc instanceof Documents) return Responder({ status: HttpStatusCode.Created, data: doc })
                    else return Responder({ status: HttpStatusCode.InternalServerError, data: doc })
                })
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }
}
