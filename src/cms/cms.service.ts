import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { AppInfos } from 'src/models/model.appinfos';
import { AllSercices } from 'src/services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { CreationAttributes } from 'sequelize';
import { CreateContactDto } from './dto/contact-form.dto';
import { Contacts } from '../models/model.contactform';
import { MailService } from '../services/service.mail';
import { ConfigService } from '@nestjs/config';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { Messages } from 'src/models/model.messages';
import { Op } from 'sequelize';
import { typeMessages } from 'src/utils/utiles.messagestypes';
import { CreateMessageDto } from './dto/send-message.dto';
import { Users } from 'src/models/model.users';
import { CreateEvenementDto } from './dto/create-planing.dto';
import { Planings } from 'src/models/model.planings';
import { log } from 'console';

@Injectable()
export class CmsService {
    constructor(
        private readonly allSercices: AllSercices,
        private readonly mailService: MailService,
        @InjectModel(AppInfos)
        private readonly appInfosModel: typeof AppInfos,

        @InjectModel(Contacts)
        private readonly contactModel: typeof Contacts,

        @InjectModel(Messages)
        private readonly messageModel: typeof Messages,

        @InjectModel(Planings)
        private readonly planingModel: typeof Planings,

        private readonly configService: ConfigService
    ) { }

    async myListAsFormateur(user: IJwtSignin): Promise<ResponseServer> {
        try {
            const { id_user } = user
            Planings.belongsTo(Users, { foreignKey: 'id_cibling', as: "Concerned" })
            return this.planingModel.findAll({
                include: [
                    {
                        model: Users,
                        as: 'Concerned',
                        attributes: ['id', 'fs_name', 'ls_name'],
                        required: false
                    }
                ],
                where: {
                    status: 1,
                    createdBy: id_user
                }
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async myListAsStudent(user: IJwtSignin): Promise<ResponseServer> {
        const { id_user } = user
        try {
            Planings.belongsTo(Users, { foreignKey: 'createdBy', as: "Creator" })
            return this.planingModel.findAll({
                include: [
                    {
                        model: Users,
                        as: 'Creator',
                        attributes: ['id', 'fs_name', 'ls_name']
                    }
                ],
                where: {
                    status: 1,
                    [Op.or]: [
                        { id_cibling: id_user },
                        { id_cibling: null }
                    ]
                }
            })
                .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async addPlaning(planing: CreateEvenementDto, user: IJwtSignin,): Promise<ResponseServer> {
        const { description, titre, id_cibling, type, timeline } = planing;
        const ons = timeline.map(time => this.allSercices.dateToUnixOnly(time))
        log("Line are ==> ", ons)
        try {
            return this.planingModel.create({
                description,
                titre,
                type,
                id_cibling,
                createdBy: user.id_user,
                timeline: ons
            })
                .then(plan => Responder({ status: HttpStatusCode.Created, data: plan }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            log(error)
            return Responder({ status: HttpStatusCode.InternalServerError, data: error });
        }
    }

    async getMessageById(user: IJwtSignin, id_message: number): Promise<ResponseServer> {
        Messages.belongsTo(Users, { foreignKey: "id_user_receiver", as: 'Receiver' })
        Messages.belongsTo(Users, { foreignKey: "id_user_sender", as: 'Sender' })
        return this.messageModel.findOne({
            include: [
                {
                    model: Users,
                    as: 'Sender',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                },
                {
                    model: Users,
                    as: 'Receiver',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                }
            ],
            where: {
                id: id_message,
                // id_user_sender: user.id_user
            }
        })
            .then(_ => {
                if (_ instanceof Messages) {
                    _.update({
                        is_readed: _.toJSON()['id_user_receiver'] === user.id_user ? 1 : _.toJSON()['is_readed']
                    })
                    return Responder({ status: HttpStatusCode.Ok, data: _ })
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: _ })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async archiveMessage(user: IJwtSignin, id_message: number): Promise<ResponseServer> {
        return this.messageModel.update({
            status: 3
        },
            {
                where: {
                    id: id_message,
                    id_user_sender: user.id_user
                }
            })
            .then(_ => Responder({ status: HttpStatusCode.Ok, data: null }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async deleteMessage(user: IJwtSignin, id_message: number): Promise<ResponseServer> {
        return this.messageModel.update({
            status: 3
        },
            {
                where: {
                    id: id_message,
                    id_user_sender: user.id_user
                }
            })
            .then(_ => Responder({ status: HttpStatusCode.Ok, data: null }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async sendMessage(user: IJwtSignin, createMessageDto: CreateMessageDto): Promise<ResponseServer> {
        const { id_user } = user;
        const { content, date_d_envoie, id_user_receiver, id_user_sender, date_de_lecture, is_readed, is_replied_to, piece_jointe, subject, thread } = createMessageDto
        const newThread = this.allSercices.randomLongNumber({ length: 10 })
        try {
            return this.messageModel.create({
                content,
                date_d_envoie: this.allSercices.nowDate(),
                id_user_sender: id_user,
                id_user_receiver: id_user_receiver || 0,
                is_readed: 0,
                piece_jointe: piece_jointe || null,
                is_replied_to,
                subject,
                thread: thread || newThread
            })
                .then(me => Responder({ status: HttpStatusCode.Created, data: me }))
                .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
        } catch (error) {
            return Responder({ status: HttpStatusCode.InternalServerError, data: error })
        }
    }

    async getAllMessagesByGroupe(user: IJwtSignin, groupe: string): Promise<ResponseServer> {
        const { id_user } = user
        if (Object.keys(typeMessages).indexOf(groupe) === -1) return Responder({ status: HttpStatusCode.BadRequest, data: "Key groupe n'a pas été retrouvé" })

        Messages.belongsTo(Users, { foreignKey: "id_user_receiver", as: 'Receiver' })
        Messages.belongsTo(Users, { foreignKey: "id_user_sender", as: 'Sender' })
        const clause = this.allSercices.buildClauseMessage(typeMessages[groupe], id_user)
        return this.messageModel.findAndCountAll({
            order: [["id", "DESC"]],
            include: [
                {
                    model: Users,
                    as: 'Sender',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                },
                {
                    model: Users,
                    as: 'Receiver',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                }
            ],
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            where: {
                ...clause
            }
        })
            .then(({ rows, count }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async getAllMessages(user: IJwtSignin): Promise<ResponseServer> {
        const { id_user } = user
        Messages.belongsTo(Users, { foreignKey: "id_user_receiver", as: 'Receiver' })
        Messages.belongsTo(Users, { foreignKey: "id_user_sender", as: 'Sender' })
        return this.messageModel.findAndCountAll({
            order: [["id", "DESC"]],
            include: [
                {
                    model: Users,
                    as: 'Sender',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                },
                {
                    model: Users,
                    as: 'Receiver',
                    attributes: ['id', 'fs_name', 'ls_name', 'nick_name', 'email', 'phone'],
                    required: true
                }
            ],
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            where: {
                status: {
                    [Op.lt]: 3
                },
                [Op.or]: {
                    id_user_sender: id_user,
                    id_user_receiver: id_user,
                }
            }
        })
            .then(({ rows, count }) => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: count, list: rows } })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async onContactForm(infos: CreateContactDto): Promise<ResponseServer> {
        const { content, from_mail, from_name, subject } = infos
        return this.contactModel.create({
            content,
            from_mail,
            from_name,
            subject,
        })
            .then(infos => {
                this.mailService.sendMail({
                    to: this.configService.get<string>('APPSMTPUSER') as string,
                    content,
                    subject,
                })
                    .then(_ => { })
                    .catch(__ => { })
                return Responder({ status: HttpStatusCode.Created, data: infos })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async onGetAppInfos(): Promise<ResponseServer> {
        return this.appInfosModel.findOne({
            where: { id: 1 }
        })
            .then(infos => Responder({ status: HttpStatusCode.Ok, data: infos }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async onAddAppInfos(createAppInfosDto: CreateAppInfosDto): Promise<ResponseServer> {
        const { adresse, contacts_numbers, email_contact, about_app } = createAppInfosDto
        return this.appInfosModel.findOrCreate({
            where: {
                id: 1
            },
            defaults: {
                contacts_numbers,
                email_contact,
                adresse,
                about_app
            } as CreationAttributes<AppInfos>,
        })
            .then(([record, isNew]) => Responder({ status: HttpStatusCode.Created, data: record }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}
