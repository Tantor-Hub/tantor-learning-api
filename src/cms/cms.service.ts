import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { AppInfos } from 'src/models/model.appinfos';
import { AllSercices } from 'src/services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { CreationAttributes, literal } from 'sequelize';
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
import { log } from 'console';
import { CreateNewsLetterDto } from './dto/newsletter-sub.dto';
import { Newsletter } from 'src/models/model.newsletter';

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

    @InjectModel(Newsletter)
    private readonly newsletterModel: typeof Newsletter,

    private readonly configService: ConfigService,
  ) {}
  async getMessageByThread(
    user: IJwtSignin,
    thread: string,
  ): Promise<ResponseServer> {
    Messages.belongsTo(Users, { foreignKey: 'id_user_receiver' });
    Messages.belongsTo(Users, { foreignKey: 'id_user_sender' });
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    const id_user = user.id_user;
    return this.messageModel
      .findAll({
        subQuery: false,
        include: [
          {
            model: Users,
            as: 'Sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [],
          },
          {
            model: Users,
            as: 'Receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [],
          },
        ],
        where: {
          thread: thread,
          [Op.and]: [
            literal(`NOT ('${id_user}' = ANY("is_deletedto"))`),
            literal(`NOT ('${id_user}' = ANY("is_archievedto"))`),
          ],
        },
      })
      .then(async (_) => {
        return Responder({
          status: HttpStatusCode.Ok,
          data: { length: _.length, list: _ },
        });
      })
      .catch((err) => {
        log('Error when getting message by thread', err);
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: err,
        });
      });
  }
  async getMessageById(
    user: IJwtSignin,
    id_message: number,
  ): Promise<ResponseServer> {
    Messages.belongsTo(Users, { foreignKey: 'id_user_receiver' });
    Messages.belongsTo(Users, { foreignKey: 'id_user_sender' });
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.messageModel
      .findOne({
        include: [
          {
            model: Users,
            as: 'Sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [],
          },
          {
            model: Users,
            as: 'Receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [
              {
                // roles removed
                attributes: ['role'],
                through: {
                  attributes: [],
                },
              },
            ],
          },
        ],
        where: {
          id: id_message,
          // id_user_sender: user.id_user
        },
      })
      .then(async (_) => {
        if (_ instanceof Messages) {
          const allInThread = await this.messageModel.findAll({
            include: [
              {
                model: Users,
                as: 'Sender',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                required: true,
                include: [],
              },
              {
                model: Users,
                as: 'Receiver',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                required: true,
                include: [
                  {
                    // roles removed
                    attributes: ['role'],
                    through: {
                      attributes: [],
                    },
                  },
                ],
              },
            ],
            where: {
              thread: _.toJSON()['thread'],
              status: {
                [Op.lt]: 3,
              },
              id: {
                [Op.ne]: _.toJSON()['id'],
              },
            },
          });
          _.update({
            is_readed:
              _.toJSON()['id_user_receiver'] === user.id_user
                ? 1
                : _.toJSON()['is_readed'],
          });
          return Responder({
            status: HttpStatusCode.Ok,
            data: { ..._.toJSON(), Thread: allInThread },
          });
        } else {
          return Responder({ status: HttpStatusCode.NotFound, data: _ });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async archiveMessage(
    user: IJwtSignin,
    id_message: number,
  ): Promise<ResponseServer> {
    return this.messageModel
      .update(
        {
          is_archievedto: [user.id_user],
        },
        {
          where: {
            id: id_message,
            id_user_sender: user.id_user,
          },
        },
      )
      .then((_) => Responder({ status: HttpStatusCode.Ok, data: null }))
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async deleteMessage(
    user: IJwtSignin,
    id_message: number,
  ): Promise<ResponseServer> {
    return this.messageModel
      .update(
        {
          is_deletedto: [user.id_user],
        },
        {
          where: {
            id: id_message,
            id_user_sender: user.id_user,
          },
        },
      )
      .then((_) => Responder({ status: HttpStatusCode.Ok, data: null }))
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async sendMessage(
    user: IJwtSignin,
    createMessageDto: CreateMessageDto,
  ): Promise<ResponseServer> {
    const { id_user } = user;
    const {
      content,
      date_d_envoie,
      id_user_receiver,
      id_user_sender,
      date_de_lecture,
      is_readed,
      is_replied_to,
      piece_jointe,
      subject,
      thread,
    } = createMessageDto;
    const newThread = this.allSercices.randomLongNumber({ length: 10 });
    try {
      return this.messageModel
        .create({
          content,
          date_d_envoie: this.allSercices.nowDate(),
          id_user_sender: id_user,
          id_user_receiver: id_user_receiver || '',
          is_readed: 0,
          piece_jointe: piece_jointe || null,
          is_replied_to,
          subject,
          thread: thread || newThread,
        })
        .then((me) => Responder({ status: HttpStatusCode.Created, data: me }))
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getAllMessagesByGroupe(
    user: IJwtSignin,
    groupe: string,
  ): Promise<ResponseServer> {
    const { id_user } = user;
    if (Object.keys(typeMessages).indexOf(groupe) === -1)
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: "Key groupe n'a pas été retrouvé",
      });

    Messages.belongsTo(Users, { foreignKey: 'id_user_receiver' });
    Messages.belongsTo(Users, { foreignKey: 'id_user_sender' });
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    const clause = this.allSercices.buildClauseMessage(
      typeMessages[groupe],
      id_user,
    );
    return this.messageModel
      .findAndCountAll({
        order: [['id', 'DESC']],
        include: [
          {
            model: Users,
            as: 'Sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [],
          },
          {
            model: Users,
            as: 'Receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [],
          },
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          ...clause,
          is_replied_to: 0,
        },
      })
      .then(({ rows, count }) => {
        return Responder({
          status: HttpStatusCode.Ok,
          data: { length: count, list: rows },
        });
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async getAllMessages(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user } = user;
    Messages.belongsTo(Users, { foreignKey: 'id_user_receiver' });
    Messages.belongsTo(Users, { foreignKey: 'id_user_sender' });
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.messageModel
      .findAndCountAll({
        order: [['id', 'DESC']],
        include: [
          {
            model: Users,
            as: 'Sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [
              {
                // roles removed
                attributes: ['role'],
                through: {
                  attributes: [],
                },
              },
            ],
          },
          {
            model: Users,
            as: 'Receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: true,
            include: [
              {
                // roles removed
                attributes: ['role'],
                through: {
                  attributes: [],
                },
              },
            ],
          },
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          status: {
            [Op.lt]: 3,
          },
          is_replied_to: 0,
          [Op.or]: {
            id_user_sender: id_user,
            id_user_receiver: id_user,
          },
        },
      })
      .then(({ rows, count }) => {
        return Responder({
          status: HttpStatusCode.Ok,
          data: { length: count, list: rows },
        });
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async onContactForm(infos: CreateContactDto): Promise<ResponseServer> {
    const { content, from_mail, from_name, subject } = infos;
    return this.contactModel
      .create({
        content,
        from_mail,
        from_name,
        subject,
      })
      .then((infos) => {
        this.mailService
          .sendMail({
            to: 'support@tantorlearning.com', //this.configService.get<string>('APPSMTPUSER') as string,
            content,
            subject,
          })
          .then((_) => {})
          .catch((__) => {});
        return Responder({ status: HttpStatusCode.Created, data: infos });
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async getSubsribersOnTheNewsLetter(): Promise<ResponseServer> {
    try {
      return this.newsletterModel
        .findAll({
          where: {
            status: 1,
          },
        })
        .then((list) => {
          return Responder({
            status: HttpStatusCode.Ok,
            data: { length: list.length, list },
          });
        })
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async onSubscribeToNewsLetter(
    createNewsLetter: CreateNewsLetterDto,
  ): Promise<ResponseServer> {
    const { user_email } = createNewsLetter;
    try {
      // Check for any existing record with this email (regardless of status)
      const existing = await this.newsletterModel.findOne({
        where: { user_email },
      });

      if (existing) {
        if (existing.status === 1) {
          // Already actively subscribed
          return Responder({
            status: HttpStatusCode.Conflict,
            data: 'Vous êtes déjà inscrit à la newsletter.',
          });
        } else {
          // Previously unsubscribed, reactivate subscription
          await existing.update({ status: 1 });

          // Send welcome email
          try {
            await this.mailService.sendMail({
              to: user_email,
              subject: 'Bienvenue dans notre newsletter !',
              content: this.mailService.templates({
                as: 'newsletter-subscribe',
              }),
            });
          } catch (emailError) {
            // Log email error but don't fail the subscription
            console.error(
              'Failed to send newsletter subscription email:',
              emailError,
            );
          }

          return Responder({
            status: HttpStatusCode.Created,
            data: existing,
          });
        }
      }

      // Create new subscription
      const infos = await this.newsletterModel.create({
        user_email,
      });

      // Send welcome email
      try {
        await this.mailService.sendMail({
          to: user_email,
          subject: 'Bienvenue dans notre newsletter !',
          content: this.mailService.templates({ as: 'newsletter-subscribe' }),
        });
      } catch (emailError) {
        // Log email error but don't fail the subscription
        console.error(
          'Failed to send newsletter subscription email:',
          emailError,
        );
      }

      return Responder({ status: HttpStatusCode.Created, data: infos });
    } catch (err) {
      // Handle Sequelize unique constraint error
      if (err.name === 'SequelizeUniqueConstraintError') {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: 'Vous êtes déjà inscrit à la newsletter.',
        });
      }

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: err,
      });
    }
  }
  async unsubscribeFromNewsLetter(
    createNewsLetter: CreateNewsLetterDto,
  ): Promise<ResponseServer> {
    const { user_email } = createNewsLetter;
    try {
      const result = await this.newsletterModel.update(
        { status: 0 },
        { where: { user_email } },
      );
      if (result[0] > 0) {
        // Send unsubscription confirmation email
        try {
          await this.mailService.sendMail({
            to: user_email,
            subject: 'Confirmation de désinscription',
            content: this.mailService.templates({
              as: 'newsletter-unsubscribe',
            }),
          });
        } catch (emailError) {
          // Log email error but don't fail the unsubscription
          console.error(
            'Failed to send newsletter unsubscription email:',
            emailError,
          );
        }

        return Responder({
          status: HttpStatusCode.Ok,
          data: 'Vous avez été désinscrit de la newsletter.',
        });
      } else {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Email non trouvé dans la newsletter.',
        });
      }
    } catch (err) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: err,
      });
    }
  }
  async onGetAppInfos(): Promise<ResponseServer> {
    return this.appInfosModel
      .findOne({
        where: { id: 1 },
      })
      .then((infos) => Responder({ status: HttpStatusCode.Ok, data: infos }))
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async onAddAppInfos(
    createAppInfosDto: CreateAppInfosDto,
  ): Promise<ResponseServer> {
    const { adresse, contacts_numbers, email_contact, about_app } =
      createAppInfosDto;
    return this.appInfosModel
      .findOrCreate({
        where: {
          id: 1,
        },
        defaults: {
          contacts_numbers,
          email_contact,
          adresse,
          about_app,
        } as CreationAttributes<AppInfos>,
      })
      .then(([record, isNew]) =>
        Responder({ status: HttpStatusCode.Created, data: record }),
      )
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
}
