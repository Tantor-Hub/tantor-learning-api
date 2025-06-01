import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

        @InjectModel(Listcours)
        private readonly listcoursModel: typeof Listcours,

        @InjectModel(SeanceSessions)
        private readonly seancesModel: typeof SeanceSessions,

        @InjectModel(SessionSuivi)
        private readonly sessionModel: typeof SessionSuivi,

        @InjectModel(StagiaireHasSession)
        private readonly hasSessionStudentModel: typeof StagiaireHasSession,

        @InjectModel(FormateurHasSession)
        private readonly hasSessionFormateurModel: typeof FormateurHasSession,

        @InjectModel(HomeworksSession)
        private readonly homeworkModel: typeof HomeworksSession,

        @InjectModel(StagiaireHasHomeWork)
        private readonly hashomeworkModel: typeof StagiaireHasHomeWork,
    ) { }

    async getListCours(): Promise<ResponseServer> {
        try {
            return this.listcoursModel.findAll()
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
                    if (cours instanceof Listcours) return Responder({ status: HttpStatusCode.Ok, data: cours })
                    else return Responder({ status: HttpStatusCode.InternalServerError, data: cours })
                })
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
                id_thematic,
                duree,
                id_formateur,
                is_published,
                ponderation,
                status: 1,
            })
                .then(cours => {
                    if (cours instanceof Cours) return Responder({ status: HttpStatusCode.Ok, data: cours })
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
}
