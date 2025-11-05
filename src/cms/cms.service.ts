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
  async onContactForm(
    infos: CreateContactDto,
    piece_jointe?: string,
  ): Promise<ResponseServer> {
    const { content, from_mail, from_name, subject } = infos;
    const contactData: any = {
      content,
      from_mail,
      from_name,
      subject,
    };

    // Only include piece_jointe if it has a value
    if (piece_jointe) {
      contactData.piece_jointe = piece_jointe;
    }

    try {
      const infos = await this.contactModel.create(contactData);

      // Send email notification (don't wait for it)
      this.mailService
        .sendMail({
          to: 'support@tantorlearning.com', //this.configService.get<string>('APPSMTPUSER') as string,
          content,
          subject,
        })
        .then((_) => {})
        .catch((__) => {});

      return Responder({ status: HttpStatusCode.Created, data: infos });
    } catch (err) {
      console.error('❌ [CONTACT FORM] Error creating contact:', err);
      console.error('❌ [CONTACT FORM] Error name:', err.name);
      console.error('❌ [CONTACT FORM] Error message:', err.message);

      // Log the actual database error if available
      if (err.original) {
        console.error(
          '❌ [CONTACT FORM] Database error:',
          err.original.message,
        );
        console.error(
          '❌ [CONTACT FORM] Database error code:',
          err.original.code,
        );
        console.error(
          '❌ [CONTACT FORM] Database error detail:',
          err.original.detail,
        );
      }

      if (err.parent) {
        console.error('❌ [CONTACT FORM] Parent error:', err.parent.message);
      }

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data:
          err.original?.message ||
          err.message ||
          'Une erreur interne est survenue lors de la création du contact.',
      });
    }
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
    console.log('📧 [NEWSLETTER] ===== SUBSCRIPTION STARTED =====');
    console.log(
      '📧 [NEWSLETTER] Input data:',
      JSON.stringify(createNewsLetter, null, 2),
    );

    const { user_email } = createNewsLetter;
    console.log('📧 [NEWSLETTER] Extracted email:', user_email);

    try {
      console.log('📧 [NEWSLETTER] Checking for existing subscription...');
      // Check for any existing record with this email (regardless of status)
      const existing = await this.newsletterModel.findOne({
        where: { user_email },
      });
      console.log(
        '📧 [NEWSLETTER] Existing record found:',
        existing ? 'YES' : 'NO',
      );
      if (existing) {
        console.log(
          '📧 [NEWSLETTER] Existing record details:',
          JSON.stringify(existing.toJSON(), null, 2),
        );
      }

      if (existing) {
        console.log('📧 [NEWSLETTER] Processing existing record...');
        if (existing.status === 1) {
          console.log('📧 [NEWSLETTER] User already actively subscribed');
          // Already actively subscribed
          return Responder({
            status: HttpStatusCode.Conflict,
            data: 'Vous êtes déjà inscrit à la newsletter.',
          });
        } else {
          console.log(
            '📧 [NEWSLETTER] Reactivating previously unsubscribed user...',
          );
          // Previously unsubscribed, reactivate subscription
          await existing.update({ status: 1 });
          console.log('📧 [NEWSLETTER] Status updated to active (1)');

          // Send welcome email
          try {
            console.log(
              '📧 [NEWSLETTER] Sending reactivation welcome email...',
            );
            await this.mailService.sendMail({
              to: user_email,
              subject: 'Bienvenue dans notre newsletter !',
              content: this.mailService.templates({
                as: 'newsletter-subscribe',
              }),
            });
            console.log(
              '📧 [NEWSLETTER] Reactivation welcome email sent successfully',
            );
          } catch (emailError) {
            // Log email error but don't fail the subscription
            console.error(
              '❌ [NEWSLETTER] Failed to send newsletter subscription email:',
              emailError,
            );
          }

          console.log(
            '📧 [NEWSLETTER] Returning reactivation success response',
          );
          return Responder({
            status: HttpStatusCode.Created,
            data: existing,
          });
        }
      }

      // Create new subscription
      console.log('📧 [NEWSLETTER] Creating new subscription...');
      const infos = await this.newsletterModel.create({
        user_email,
      });
      console.log(
        '📧 [NEWSLETTER] New subscription created:',
        JSON.stringify(infos.toJSON(), null, 2),
      );

      // Send welcome email
      try {
        console.log(
          '📧 [NEWSLETTER] Sending welcome email to new subscriber...',
        );
        await this.mailService.sendMail({
          to: user_email,
          subject: 'Bienvenue dans notre newsletter !',
          content: this.mailService.templates({ as: 'newsletter-subscribe' }),
        });
        console.log('📧 [NEWSLETTER] Welcome email sent successfully');
      } catch (emailError) {
        // Log email error but don't fail the subscription
        console.error(
          '❌ [NEWSLETTER] Failed to send newsletter subscription email:',
          emailError,
        );
      }

      console.log(
        '📧 [NEWSLETTER] Returning success response for new subscription',
      );
      return Responder({ status: HttpStatusCode.Created, data: infos });
    } catch (err) {
      console.error('❌ [NEWSLETTER] Error in subscription process:', err);
      console.error('❌ [NEWSLETTER] Error name:', err.name);
      console.error('❌ [NEWSLETTER] Error message:', err.message);
      console.error('❌ [NEWSLETTER] Error stack:', err.stack);

      // Handle Sequelize unique constraint error
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log(
          '📧 [NEWSLETTER] Unique constraint error - user already exists',
        );
        return Responder({
          status: HttpStatusCode.Conflict,
          data: 'Vous êtes déjà inscrit à la newsletter.',
        });
      }

      console.error('❌ [NEWSLETTER] Returning internal server error');
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: err,
      });
    }
  }
  async unsubscribeFromNewsLetter(
    createNewsLetter: CreateNewsLetterDto,
  ): Promise<ResponseServer> {
    console.log('📧 [NEWSLETTER] ===== UNSUBSCRIPTION STARTED =====');
    console.log(
      '📧 [NEWSLETTER] Input data:',
      JSON.stringify(createNewsLetter, null, 2),
    );

    const { user_email } = createNewsLetter;
    console.log('📧 [NEWSLETTER] Extracted email:', user_email);

    try {
      console.log(
        '📧 [NEWSLETTER] Updating subscription status to inactive...',
      );
      const result = await this.newsletterModel.update(
        { status: 0 },
        { where: { user_email } },
      );
      console.log('📧 [NEWSLETTER] Update result:', result);

      if (result[0] > 0) {
        console.log('📧 [NEWSLETTER] Successfully unsubscribed user');
        // Send unsubscription confirmation email
        try {
          console.log(
            '📧 [NEWSLETTER] Sending unsubscribe confirmation email...',
          );
          await this.mailService.sendMail({
            to: user_email,
            subject: 'Confirmation de désinscription',
            content: this.mailService.templates({
              as: 'newsletter-unsubscribe',
            }),
          });
          console.log(
            '📧 [NEWSLETTER] Unsubscribe confirmation email sent successfully',
          );
        } catch (emailError) {
          // Log email error but don't fail the unsubscription
          console.error(
            '❌ [NEWSLETTER] Failed to send newsletter unsubscription email:',
            emailError,
          );
        }

        console.log('📧 [NEWSLETTER] Returning unsubscribe success response');
        return Responder({
          status: HttpStatusCode.Ok,
          data: 'Vous avez été désinscrit de la newsletter.',
        });
      } else {
        console.log('📧 [NEWSLETTER] No records updated - email not found');
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Email non trouvé dans la newsletter.',
        });
      }
    } catch (err) {
      console.error('❌ [NEWSLETTER] Error in unsubscription process:', err);
      console.error('❌ [NEWSLETTER] Error name:', err.name);
      console.error('❌ [NEWSLETTER] Error message:', err.message);
      console.error('❌ [NEWSLETTER] Error stack:', err.stack);

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
