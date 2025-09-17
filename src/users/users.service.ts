import { Injectable } from '@nestjs/common';
import { ResponseServer } from 'src/interface/interface.response';
import { CreateUserDto } from './dto/create-student.dto';
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { AllSercices } from 'src/services/serices.all';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from '../services/service.crypto';
import { SignInStudentDto } from './dto/signin-student.dto';
import { JwtService } from 'src/services/service.jwt';
import { log } from 'console';
import { FindByEmailDto } from './dto/find-by-email.dto';
import { Op } from 'sequelize';
import { VerifyAsStudentDto } from './dto/verify-student.dto';
import { ResentCodeDto } from './dto/resent-code.dto';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { IAuthWithGoogle } from 'src/interface/interface.authwithgoogle';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StagiaireHasSession } from 'src/models/model.stagiairehassession';
import { IHomeWorks } from 'src/interface/interface.homework';
import { Messages } from 'src/models/model.messages';
import { SeanceSessions } from 'src/models/model.courshasseances';
import { Formations } from 'src/models/model.formations';
import { SessionSuivi } from 'src/models/model.suivisession';
import { Categories } from 'src/models/model.categoriesformations';
import { Thematiques } from 'src/models/model.groupeformations';
import { HomeworksSession } from 'src/models/model.homework';
import { StagiaireHasHomeWork } from 'src/models/model.stagiairehashomeworks';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserMagicLinkDto } from './dto/create-user-withmagiclink.dto';
import { Response } from 'express';
import { base64decode, base64encode } from 'nodejs-base64';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users)
    private readonly userModel: typeof Users,

    @InjectModel(Roles)
    private readonly rolesModel: typeof Roles,

    @InjectModel(HasRoles)
    private readonly hasRoleModel: typeof HasRoles,

    @InjectModel(StagiaireHasSession)
    private readonly hasSessionModel: typeof StagiaireHasSession,

    @InjectModel(HomeworksSession)
    private readonly homeworkModel: typeof HomeworksSession,

    @InjectModel(StagiaireHasHomeWork)
    private readonly hashomeworkModel: typeof StagiaireHasHomeWork,

    @InjectModel(Messages)
    private readonly messagesModel: typeof Messages,

    @InjectModel(SeanceSessions)
    private readonly hasseancesModel: typeof SeanceSessions,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly allService: AllSercices,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  readonly roleMap: Record<string, number> = {
    instructor: 5,
    teacher: 3,
    admin: 1,
    student: 4,
    secretary: 2,
  };
  async loadPerformances(user: IJwtSignin) {
    const { id_user, roles_user, level_indicator } = user;
    try {
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async loadScores(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user, roles_user, level_indicator } = user;

    try {
      const getSemesterScores = async (
        id_user: number,
      ): Promise<{
        scoreOngoingSemester: number;
        totalOngoingSemester: number;
        scoreLastSemester: number;
        totalLastSemeter: number;
      }> => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        let semesterStart: Date, semesterEnd: Date;
        let lastSemesterStart: Date, lastSemesterEnd: Date;

        if (currentMonth <= 6) {
          // S1 actuel (janv-juin), S2 précédent (juil-déc de l'année précédente)
          semesterStart = new Date(now.getFullYear(), 0, 1);
          semesterEnd = new Date(now.getFullYear(), 5, 30);
          lastSemesterStart = new Date(now.getFullYear() - 1, 6, 1);
          lastSemesterEnd = new Date(now.getFullYear() - 1, 11, 31);
        } else {
          // S2 actuel (juil-déc), S1 précédent (janv-juin de la même année)
          semesterStart = new Date(now.getFullYear(), 6, 1);
          semesterEnd = new Date(now.getFullYear(), 11, 31);
          lastSemesterStart = new Date(now.getFullYear(), 0, 1);
          lastSemesterEnd = new Date(now.getFullYear(), 5, 30);
        }

        const [ongoing, last] = await Promise.all([
          this.hashomeworkModel.findAll({
            where: {
              id_user,
              date_de_creation: {
                [Op.between]: [semesterStart, semesterEnd],
              },
            },
            attributes: [
              [Sequelize.fn('SUM', Sequelize.col('score')), 'score'],
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            ],
            raw: true,
          }) as any,
          this.hashomeworkModel.findAll({
            where: {
              id_user,
              date_de_creation: {
                [Op.between]: [lastSemesterStart, lastSemesterEnd],
              },
            },
            attributes: [
              [Sequelize.fn('SUM', Sequelize.col('score')), 'score'],
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            ],
            raw: true,
          }) as any,
        ]);

        return {
          scoreOngoingSemester: Number(ongoing[0]?.score || 0),
          totalOngoingSemester: Number(ongoing[0]?.total || 0),
          scoreLastSemester: Number(last[0]?.score || 0),
          totalLastSemeter: Number(last[0]?.total || 0),
        };
      };

      const resul = await getSemesterScores(id_user);
      return Responder({ status: HttpStatusCode.Ok, data: resul });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async loadStudentNextLiveSession(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user, uuid_user, roles_user } = user;
    try {
      // StagiaireHasSession.belongsTo(Formations, { foreignKey: "id_formation" })
      // StagiaireHasSession.belongsTo(SessionSuivi, { foreignKey: "id_sessionsuivi" })
      // Formations.belongsTo(Categories, { foreignKey: "id_category" })
      // Formations.belongsTo(Thematiques, { foreignKey: "id_thematic" })
      // SeanceSessions.belongsTo(SessionSuivi, { foreignKey: "id_session" });
      // SeanceSessions.belongsTo(Formations, { foreignKey: "id_formation" })
      // SessionSuivi.belongsTo(Users, { foreignKey: "id_superviseur" })

      const mylistsession = await this.hasSessionModel.findAll({
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
                attributes: ['id', 'thematic'],
              },
              {
                model: Categories,
                required: true,
                attributes: ['id', 'category'],
              },
            ],
          },
        ],
        where: {
          id_stagiaire: id_user,
        },
      });

      const mylistids = mylistsession
        .map((sess) => {
          return sess.toJSON().id;
        })
        .filter((id) => id !== undefined);

      // SessionSuivi.belongsTo(Users, { foreignKey: "id_superviseur" })
      const nextLivesSessions = await this.hasseancesModel.findAll({
        include: [
          {
            model: SessionSuivi,
            required: true,
            attributes: ['id', 'designation', 'id_superviseur'],
            include: [
              {
                model: Users,
                required: false,
              },
            ],
          },
          {
            model: Formations,
            required: true,
            attributes: ['id', 'titre', 'sous_titre', 'description'],
          },
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          id: {
            [Op.in]: [...mylistids],
          },
          seance_date_on: {
            [Op.gte]: Date.now() / 1000,
          },
        },
      });
      return Responder({
        status: HttpStatusCode.Ok,
        data: nextLivesSessions.map((sessionLive) => {
          const { seance_date_on } = sessionLive.toJSON();
          const ins = sessionLive?.toJSON();
          delete (ins as any).seance_date_on;
          return {
            date: this.allService.unixToDate({ stringUnix: seance_date_on }),
            ...ins,
          };
        }),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async loadStudentDashboard(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user, uuid_user, roles_user } = user;
    try {
      // card 1
      const enroledCours = await this.hasSessionModel.count({
        where: { id_stagiaire: id_user },
      });
      const onGoingCours = await this.hasSessionModel.count({
        where: { id_stagiaire: id_user, is_started: 1 },
      });

      // card 2
      const enroledHomeworks = await this.hashomeworkModel.count({
        where: { id_user, is_returned: 0 },
      });
      const allPendingHomeworks = await this.hashomeworkModel.findAll({
        where: {
          id_user,
          is_returned: 0,
          date_de_remise: { [Op.gte]: Date.now() / 1000 },
        },
        order: [['date_de_remise', 'ASC']],
      });

      const grouped = allPendingHomeworks.reduce(
        (acc, hw) => {
          const date = hw.date_de_remise;
          if (!acc[date]) acc[date] = [];
          acc[date].push(hw);
          return acc;
        },
        {} as Record<string, IHomeWorks[]>,
      );

      const unreadMessages = await this.messagesModel.count({
        where: { id_user_receiver: id_user, is_readed: 0 },
      });
      // const as_groupe = Object.keys(grouped).map(key => {
      //     return {
      //         length: Object.keys(grouped).length,
      //         date: Object.keys(grouped).length ? this.allService.unixToDate({ stringUnix: Object.keys(grouped)[0] }) : null
      //     }
      // })

      return Responder({
        status: HttpStatusCode.Ok,
        data: [
          {
            enrolledCourses: enroledCours,
            ongoingCourses: onGoingCours,
          },
          {
            homework: enroledHomeworks,
            nextDelivery: {
              length: Object.keys(grouped).length,
              date: Object.keys(grouped).length
                ? this.allService.unixToDate({
                    stringUnix: Object.keys(grouped)[0],
                  })
                : null,
            },
          },
          // {
          //     scoreOngoingSemester: number,
          //     totalOngoingSemester: number,
          //     scoreLastSemester: number,
          //     totalLastSemeter: number
          // },
          {
            unreadMessageNumber: unreadMessages,
          },
        ],
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  protected async onWelcomeNewStudent({
    to,
    otp,
    nom,
    postnom,
    all,
  }: {
    to: string;
    nom: string;
    postnom: string;
    all?: boolean;
    otp: string;
  }): Promise<void> {
    if (all && all === true) {
      this.mailService
        .sendMail({
          content: this.mailService.templates({ as: 'welcome', nom, postnom }),
          to,
          subject: 'Félicitations',
        })
        .then(({ code, data, message }) => {})
        .catch((err) => {});

      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'otp',
          nom,
          postnom,
          code: otp,
        }),
        to,
        subject: 'Code de vérification',
      });
    } else {
      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'otp',
          nom,
          postnom,
          code: otp,
        }),
        to,
        subject: 'Code de vérification',
      });
    }
  }
  async getAllUsers(): Promise<ResponseServer> {
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
    return this.userModel
      .findAll({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status', 'description'],
            },
          },
        ],
        attributes: {
          exclude: ['password', 'verification_code', 'status', 'is_verified'],
        },
        where: {
          status: 1,
        },
      })
      .then((list) =>
        Responder({
          status: HttpStatusCode.Ok,
          data: { length: list.length, rows: list },
        }),
      )
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async getAllUsersAsSimplifiedList(): Promise<ResponseServer> {
    return this.userModel
      .findAll({
        attributes: ['id', 'fs_name', 'ls_name', 'avatar'],
        where: {
          status: 1,
        },
      })
      .then((list) =>
        Responder({
          status: HttpStatusCode.Ok,
          data: { length: list.length, rows: list },
        }),
      )
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async getAllUsersByRole(
    group: 'instructor' | 'teacher' | 'admin' | 'student' | 'secretary' | 'all',
  ): Promise<ResponseServer> {
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findAll({
        include: [
          {
            model: Roles,
            required: true,
            attributes: ['id', 'role'],
            ...(group !== 'all' && {
              where: {
                id: this.roleMap[group],
              },
            }),
          },
        ],
        attributes: {
          exclude: [
            'password',
            'verification_code',
            'status',
            'is_verified',
            'createdAt',
            'updatedAt',
            'can_update_password',
            'last_login',
          ],
        },
        where: {
          status: 1,
        },
      })
      .then((list) =>
        Responder({
          status: HttpStatusCode.Ok,
          data: { length: list.length, list },
        }),
      )
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async signInAsStudent(
    signInStudentDto: SignInStudentDto,
  ): Promise<ResponseServer> {
    const { user_name, password } = signInStudentDto;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
    return this.userModel
      .findOne({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status', 'description'],
            },
          },
        ],
        where: {
          status: 1,
          [Op.or]: [{ email: user_name }, { nick_name: user_name }],
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            fs_name,
            ls_name,
            nick_name,
            password: as_hashed_password,
            is_verified,
            uuid,
            id,
            roles,
          } = student?.toJSON();
          const _roles = this.allService.formatRoles(roles as any);

          if (is_verified === 1) {
            const matched = await this.cryptoService.comparePassword(
              password,
              as_hashed_password,
            );
            if (matched) {
              return this.jwtService
                .signinPayloadAndEncrypt({
                  id_user: id as number,
                  roles_user: _roles,
                  uuid_user: uuid as string,
                  level_indicator: 90,
                })
                .then(async ({ code, data, message }) => {
                  const { cleared, hashed, refresh } = data;
                  const record = this.allService.filterUserFields(
                    student.toJSON(),
                  );
                  return Responder({
                    status: HttpStatusCode.Ok,
                    data: {
                      auth_token: hashed,
                      refresh_token: refresh,
                      user: record,
                    },
                  });
                })
                .catch((err) => {
                  return Responder({ status: 500, data: err });
                });
            } else {
              return Responder({
                status: HttpStatusCode.Forbidden,
                data: "Mot de passe ou nom d'utilisateur incorrect !",
              });
            }
          } else {
            const verif_code = this.allService.randomLongNumber({ length: 6 });
            return student
              .update({
                verification_code: verif_code,
              })
              .then((_) => {
                const newInstance = student.toJSON();

                delete (newInstance as any).password;
                delete (newInstance as any).verification_code;
                delete (newInstance as any).last_login;
                delete (newInstance as any).status;
                delete (newInstance as any).is_verified;
                delete (newInstance as any).createdAt;
                delete (newInstance as any).updatedAt;

                this.onWelcomeNewStudent({
                  to: email,
                  nom: fs_name,
                  postnom: ls_name,
                  otp: verif_code,
                  all: false,
                });
                return Responder({
                  status: HttpStatusCode.Unauthorized,
                  data: null,
                });
              })
              .catch((err) =>
                Responder({
                  status: HttpStatusCode.InternalServerError,
                  data: err,
                }),
              );
          }
        } else {
          return Responder({
            status: HttpStatusCode.Forbidden,
            data: "Mot de passe ou nom d'utilisateur incorrect !",
          });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async registerAsStudent(
    createUserDto: CreateUserDto,
  ): Promise<ResponseServer> {
    const {
      email,
      fs_name,
      ls_name,
      password,
      id,
      nick_name,
      phone,
      uuid,
      verification_code,
      date_of_birth,
    } = createUserDto;
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      return Responder({
        status: HttpStatusCode.Conflict,
        data: `[Email]: ${email} est déjà utilisé`,
      });
    }

    const verif_code = this.allService.randomLongNumber({ length: 6 });
    const num_record = this.allService.randomLongNumber({ length: 8 });
    const hashed_password = await this.cryptoService.hashPassword(password);
    const uuid_user = this.allService.generateUuid();

    return this.userModel
      .create({
        num_record: num_record,
        email,
        fs_name,
        ls_name,
        phone: phone,
        password: hashed_password,
        nick_name,
        date_of_birth,
        uuid: uuid_user,
        verification_code: verif_code,
        is_verified: 0,
        status: 1,
      })
      .then((student) => {
        if (student instanceof Users) {
          const { id: as_id_user, email } = student?.toJSON();
          return this.hasRoleModel
            .create({
              RoleId: 4, // this Means Student Or Stagiaire
              UserId: as_id_user as number,
              status: 1,
            })
            .then((hasrole) => {
              if (hasrole instanceof HasRoles) {
                this.onWelcomeNewStudent({
                  to: email,
                  otp: verif_code,
                  nom: fs_name,
                  postnom: ls_name,
                  all: true,
                });
                const newInstance = student.toJSON();

                delete (newInstance as any).password;
                delete (newInstance as any).verification_code;
                delete (newInstance as any).last_login;
                delete (newInstance as any).status;
                delete (newInstance as any).is_verified;
                delete (newInstance as any).createdAt;
                delete (newInstance as any).updatedAt;
                const record = this.allService.filterUserFields(newInstance);
                return Responder({
                  status: HttpStatusCode.Created,
                  data: { user: record },
                });
              } else {
                return Responder({ status: HttpStatusCode.BadRequest });
              }
            })
            .catch((err) => {
              log(err);
              return Responder({ status: HttpStatusCode.Conflict, data: err });
            });
        } else {
          return Responder({ status: HttpStatusCode.BadRequest, data: {} });
        }
      })
      .catch((err) => {
        log(err);
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: err,
        });
      });
  }
  async registerThanSendMagicLink(
    createUserDto: CreateUserMagicLinkDto,
  ): Promise<ResponseServer> {
    const { email, id_role } = createUserDto;
    try {
      const existingUser = await this.userModel.findOne({ where: { email } });
      const role = await this.rolesModel.findOne({ where: { id: id_role } });
      if (existingUser) {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: `[Email]: ${email} est déjà utilisé`,
        });
      }
      if (!role)
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: `Ce role n'est pas configurable`,
        });

      const password = '123456';
      const verif_code = this.allService.randomLongNumber({ length: 6 });
      const num_record = this.allService.randomLongNumber({ length: 8 });
      const hashed_password = await this.cryptoService.hashPassword(password);
      const uuid_user = this.allService.generateUuid();
      const escape = this.configService.get<string>('ESCAPESTRING') || '---';
      const { role: as_role } = role.toJSON();

      return this.userModel
        .create({
          num_record: num_record,
          email,
          fs_name: escape,
          ls_name: escape,
          password: hashed_password,
          nick_name: escape,
          uuid: uuid_user,
          verification_code: verif_code,
          is_verified: 0,
          status: 1,
        })
        .then(async (u) => {
          if (u instanceof Users) {
            const { id } = u.toJSON();
            return this.hasRoleModel
              .create({
                RoleId: id_role || 2, // ie. sec. role
                UserId: id as number,
                status: 1,
              })
              .then((hasrole) => {
                if (hasrole instanceof HasRoles) {
                  const { id } = u.toJSON();
                  return this.jwtService
                    .signinPayloadAndEncrypt({
                      id_user: id as any,
                      roles_user: id_role as any,
                      uuid_user,
                      level_indicator: 95,
                    })
                    .then(({ data, code }) => {
                      const { hashed, refresh, cleared } = data;
                      this.mailService.onInviteViaMagicLink({
                        to: email,
                        link: `https://tantor-learning-frontend-eight.vercel.app/auth/magic-link?email=${email}&verify=${hashed}`,
                        role: as_role,
                      });
                      return Responder({
                        status: HttpStatusCode.Created,
                        data: 'Magic link envoyé avec succès !',
                      });
                    })
                    .catch((err) =>
                      Responder({
                        status: HttpStatusCode.InternalServerError,
                        data: err,
                      }),
                    );
                } else
                  return Responder({
                    status: HttpStatusCode.BadRequest,
                    data: null,
                  });
              })
              .catch((err) =>
                Responder({ status: HttpStatusCode.BadRequest, data: err }),
              );
          } else {
            return Responder({
              status: HttpStatusCode.InternalServerError,
              data: u,
            });
          }
        })
        .catch((er) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: er }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async registerAsNewUser(
    createUserDto: CreateUserDto,
  ): Promise<ResponseServer> {
    const {
      email,
      fs_name,
      ls_name,
      password,
      id,
      nick_name,
      phone,
      uuid,
      verification_code,
      id_role,
      date_of_birth,
    } = createUserDto;
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      return Responder({
        status: HttpStatusCode.Conflict,
        data: `[Email]: ${email} est déjà utilisé`,
      });
    }

    const verif_code = this.allService.randomLongNumber({ length: 6 });
    const num_record = this.allService.randomLongNumber({ length: 8 });
    const hashed_password = await this.cryptoService.hashPassword(password);
    const uuid_user = this.allService.generateUuid();

    return this.userModel
      .create({
        num_record: num_record,
        email,
        fs_name,
        ls_name,
        phone: phone,
        password: hashed_password,
        nick_name,
        uuid: uuid_user,
        date_of_birth,
        verification_code: verif_code,
        is_verified: id_role && id_role === 4 ? 0 : 1,
        status: 1,
      })
      .then((student) => {
        if (student instanceof Users) {
          const { id: as_id_user, email } = student?.toJSON();
          return this.hasRoleModel
            .create({
              RoleId: id_role || 2, // ie. sec. role
              UserId: as_id_user as number,
              status: 1,
            })
            .then((hasrole) => {
              if (hasrole instanceof HasRoles) {
                if (id_role && id_role === 4)
                  this.onWelcomeNewStudent({
                    to: email,
                    otp: verif_code,
                    nom: fs_name,
                    postnom: ls_name,
                    all: true,
                  });
                const newInstance = student.toJSON();

                delete (newInstance as any).password;
                delete (newInstance as any).verification_code;
                delete (newInstance as any).last_login;
                delete (newInstance as any).status;
                delete (newInstance as any).is_verified;
                delete (newInstance as any).createdAt;
                delete (newInstance as any).updatedAt;

                const record = this.allService.filterUserFields(newInstance);
                return Responder({
                  status: HttpStatusCode.Created,
                  data: { user: record },
                });
              } else {
                return Responder({ status: HttpStatusCode.BadRequest });
              }
            })
            .catch((err) => {
              return Responder({ status: HttpStatusCode.Conflict, data: err });
            });
        } else {
          return Responder({ status: HttpStatusCode.BadRequest, data: {} });
        }
      })
      .catch((err) => {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: err,
        });
      });
  }
  async registerAsNewUserFormMagicLink(
    createUserDto: CreateUserDto,
    emailmagic: string,
    token: string,
  ): Promise<ResponseServer> {
    const {
      email,
      fs_name,
      ls_name,
      password,
      id,
      nick_name,
      phone,
      uuid,
      verification_code,
      date_of_birth,
    } = createUserDto;
    const decoded: IJwtSignin =
      await this.jwtService.checkTokenWithRound(token);
    if (!decoded)
      return Responder({
        status: HttpStatusCode.Unauthorized,
        data: 'Le token fournie est invalide',
      });
    const { id_user } = decoded;
    const existingUser = await this.userModel.findOne({
      where: { email, id: id_user },
    });

    if (existingUser) {
      const hashed_password = await this.cryptoService.hashPassword(password);
      return this.userModel
        .update(
          {
            email,
            fs_name,
            ls_name,
            phone: phone,
            password: hashed_password,
            nick_name,
            date_of_birth,
            status: 1,
          },
          {
            where: {
              email,
              id: id_user,
            },
          },
        )
        .then((student) => {
          if (student instanceof Users) {
            const { id: as_id_user, email } = student?.toJSON();
            const newInstance = student.toJSON();

            delete (newInstance as any).password;
            delete (newInstance as any).verification_code;
            delete (newInstance as any).last_login;
            delete (newInstance as any).status;
            delete (newInstance as any).is_verified;
            delete (newInstance as any).createdAt;
            delete (newInstance as any).updatedAt;

            return Responder({
              status: HttpStatusCode.Created,
              data: { user: newInstance },
            });
          } else {
            return Responder({ status: HttpStatusCode.BadRequest, data: {} });
          }
        })
        .catch((err) => {
          return Responder({
            status: HttpStatusCode.InternalServerError,
            data: err,
          });
        });
    } else
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: `Les informations fournies ne sont pas conformes`,
      });
  }
  async setNewPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseServer> {
    const {
      new_password,
      repet_new_password,
      user_name,
      verification_code,
      description,
    } = resetPasswordDto;

    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
    return this.userModel
      .findOne({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        attributes: {
          exclude: ['password'],
        },
        where: {
          status: 1,
          [Op.or]: [{ email: user_name }, { nick_name: user_name }],
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            fs_name,
            ls_name,
            nick_name,
            password: as_hashed_password,
            is_verified,
            uuid,
            id,
            verification_code: as_code,
            roles,
            can_update_password,
          } = student?.toJSON();
          if (can_update_password === 1) {
            if (repet_new_password && repet_new_password.length > 0) {
              if (new_password !== repet_new_password)
                return Responder({
                  status: HttpStatusCode.BadRequest,
                  data: 'Les deux mot de passe ne sont pas identiques !',
                });
            }

            const hashed_password =
              await this.cryptoService.hashPassword(new_password);
            const _roles = this.allService.formatRoles(roles as any);

            return student
              .update({
                password: hashed_password,
              })
              .then((_) => {
                return this.jwtService
                  .signinPayloadAndEncrypt({
                    id_user: id as number,
                    roles_user: _roles,
                    uuid_user: uuid as string,
                    level_indicator: 90,
                  })
                  .then(async ({ code, data, message }) => {
                    const { cleared, hashed, refresh } = data;
                    const newInstance = student.toJSON();

                    delete (newInstance as any).password;
                    delete (newInstance as any).verification_code;
                    delete (newInstance as any).last_login;
                    delete (newInstance as any).status;
                    delete (newInstance as any).is_verified;
                    delete (newInstance as any).createdAt;
                    delete (newInstance as any).updatedAt;

                    return Responder({
                      status: HttpStatusCode.Ok,
                      data: {
                        auth_token: hashed,
                        refresh_token: refresh,
                        user: newInstance,
                      },
                    });
                  })

                  .catch((err) => {
                    return Responder({ status: 500, data: err });
                  });
              })
              .catch((err) =>
                Responder({
                  status: HttpStatusCode.InternalServerError,
                  data: err,
                }),
              );
          } else {
            return Responder({
              status: HttpStatusCode.Forbidden,
              data: `Le code de vérification envoyé n'est pas correct !`,
            });
          }
        } else {
          return Responder({ status: HttpStatusCode.Forbidden, data: null });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async resentVerificationCode(
    resentCodeDto: ResentCodeDto,
    forgetPasswordCase: boolean = false,
  ): Promise<ResponseServer> {
    const { user_email } = resentCodeDto;
    const verif_code = this.allService.randomLongNumber({ length: 6 });

    return this.userModel
      .findOne({
        attributes: {
          exclude: ['password'],
        },
        where: {
          status: 1,
          [Op.or]: [{ email: user_email }, { nick_name: user_email }],
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            fs_name,
            ls_name,
            nick_name,
            password: as_hashed_password,
            is_verified,
            uuid,
            id,
            verification_code: as_code,
            roles,
          } = student?.toJSON();
          this.onWelcomeNewStudent({
            to: email,
            nom: fs_name,
            postnom: ls_name,
            all: false,
            otp: verif_code,
          });
          await student.update({
            verification_code: verif_code,
          });
          return Responder({
            status: HttpStatusCode.Ok,
            data: { fs_name, ls_name, email, nick_name },
          });
        } else {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: `${user_email} n'est pas reconnu !`,
          });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.NotFound, data: err }),
      );
  }
  async verifyBeforeResetPassword(
    verifyAsStudentDto: VerifyAsStudentDto,
  ): Promise<ResponseServer> {
    const { email_user, verication_code } = verifyAsStudentDto;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        where: {
          status: 1,
          email: email_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            fs_name,
            ls_name,
            nick_name,
            password: as_hashed_password,
            is_verified,
            uuid,
            id,
            verification_code: as_code,
            roles,
          } = student?.toJSON();
          const _roles = this.allService.formatRoles(roles as any);
          if (1) {
            if (as_code?.toString() === verication_code.toString()) {
              student.update({
                can_update_password: 1,
                verification_code: '000000',
              });
              return Responder({
                status: HttpStatusCode.Ok,
                data: 'Le mot de passe peut maintenant etre modifier ',
              });
            } else {
              return Responder({
                status: HttpStatusCode.Forbidden,
                data: `Le code de vérification est invalide`,
              });
            }
          } else {
            return Responder({
              status: HttpStatusCode.BadRequest,
              data: `User still verified ::: [${email}]`,
            });
          }
        } else {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: `${email_user} n'est pas reconnu !`,
          });
        }
      })
      .catch((err) => {
        return Responder({ status: HttpStatusCode.NotFound, data: err });
      });
  }
  async verifyAsStudent(
    verifyAsStudentDto: VerifyAsStudentDto,
  ): Promise<ResponseServer> {
    const { email_user, verication_code } = verifyAsStudentDto;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        where: {
          status: 1,
          email: email_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            fs_name,
            ls_name,
            nick_name,
            password: as_hashed_password,
            is_verified,
            uuid,
            id,
            verification_code: as_code,
            roles,
          } = student?.toJSON();
          const _roles = this.allService.formatRoles(roles as any);

          if (is_verified === 0) {
            if (as_code?.toString() === verication_code.toString()) {
              return this.jwtService
                .signinPayloadAndEncrypt({
                  id_user: id as number,
                  roles_user: [..._roles],
                  uuid_user: uuid as string,
                  level_indicator: 90,
                })
                .then(async ({ code, data, message }) => {
                  const { cleared, hashed, refresh } = data;
                  student.update({
                    is_verified: 1,
                  });
                  return Responder({
                    status: HttpStatusCode.Ok,
                    data: {
                      auth_token: hashed,
                      refresh_token: refresh,
                      user: student.toJSON(),
                    },
                  });
                })
                .catch((err) => {
                  return Responder({ status: 500, data: err });
                });
            } else {
              return Responder({
                status: HttpStatusCode.Forbidden,
                data: `Le code de vérification est invalide`,
              });
            }
          } else {
            return Responder({
              status: HttpStatusCode.BadRequest,
              data: `User still verified ::: [${email}]`,
            });
          }
        } else {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: `${email_user} n'est pas reconnu !`,
          });
        }
      })
      .catch((err) => {
        return Responder({ status: HttpStatusCode.NotFound, data: err });
      });
  }
  async refreshTokenUser(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseServer> {
    const { refresh_token } = refreshTokenDto;
    return this.jwtService
      .verifyRefreshToken(refresh_token)
      .then((_) => {
        if (_ && _ !== null) {
          delete _.iat;
          delete _.exp;

          return this.jwtService
            .refreshTokens(_)
            .then(({ code, data, message }) => {
              if (code === 200) {
                const { hashed, refresh, cleared } = data;
                return Responder({
                  status: HttpStatusCode.Ok,
                  data: { auth_token: hashed, refresh_token: refresh },
                });
              } else {
                return Responder({
                  status: HttpStatusCode.InternalServerError,
                  data: _,
                });
              }
            })
            .catch((_) =>
              Responder({
                status: HttpStatusCode.InternalServerError,
                data: _,
              }),
            );
        } else {
          return Responder({
            status: HttpStatusCode.Unauthorized,
            data: 'La clé de rafreshissement a aussi expirée !',
          });
        }
      })
      .catch((_) => {
        return Responder({
          status: HttpStatusCode.Unauthorized,
          data: 'La clé de rafreshissement a aussi expirée !',
        });
      });
  }
  async findByEmail(findByEmailDto: FindByEmailDto): Promise<ResponseServer> {
    const { email } = findByEmailDto;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        attributes: {
          exclude: [
            'password',
            'verification_code',
            'is_verified',
            'last_login',
          ],
        },
        where: {
          status: 1,
          email: email,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const record = this.allService.filterUserFields(student.toJSON());
          return Responder({ status: HttpStatusCode.Ok, data: record });
        } else {
          return Responder({ status: HttpStatusCode.NotFound, data: student });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async updateUserProfile(
    user: IJwtSignin,
    profile: any,
    req: Request,
  ): Promise<ResponseServer> {
    const { id_user, roles_user, uuid_user, level_indicator } = user;
    if (Object.keys(profile as {}).length <= 0) {
      return Responder({
        status: HttpStatusCode.NotAcceptable,
        data: 'Le body de la requete ne peut etre vide',
      });
    }

    delete profile.password;
    delete profile.avatar;
    delete profile.verification_code;
    delete profile.is_verified;
    delete profile.last_login;
    delete profile.id;
    delete profile.roles;

    return this.userModel
      .findOne({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        where: {
          status: 1,
          id: id_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          student.update({ ...profile, avatar: profile['as_avatar'] });
          const record = this.allService.filterUserFields(student.toJSON());
          return Responder({ status: HttpStatusCode.Ok, data: record });
        } else {
          return Responder({ status: HttpStatusCode.NotFound, data: null });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async profileAsStudent(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user, roles_user, uuid_user, level_indicator } = user;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        include: [
          {
            model: Roles,
            required: true,
            attributes: {
              exclude: ['status'],
            },
          },
        ],
        attributes: {
          exclude: [
            'password',
            'verification_code',
            'is_verified',
            'last_login',
          ],
        },
        where: {
          status: 1,
          id: id_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const record = this.allService.filterUserFields(student.toJSON());
          return Responder({ status: HttpStatusCode.Ok, data: record });
        } else
          return Responder({ status: HttpStatusCode.NotFound, data: null });
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async authWithGoogle(user: IAuthWithGoogle, res: Response): Promise<any> {
    const { email, firstName, lastName, picture, accessToken } = user;

    const verif_code = this.allService.randomLongNumber({ length: 6 });
    const num_record = this.allService.randomLongNumber({ length: 8 });
    const hashed_password = await this.cryptoService.hashPassword(
      (this.configService.get<string>('DEFAULTUSERPASSWORD') || '').concat(
        num_record,
      ),
    );
    const uuid_user = this.allService.generateUuid();
    const base = 'https://tantor-learning.vercel.app';

    try {
      return this.userModel
        .findOrCreate({
          where: { email },
          include: [
            {
              model: Roles,
              required: false,
              attributes: { exclude: ['status', 'description'] },
            },
          ],
          defaults: {
            email,
            ls_name: lastName,
            fs_name: firstName,
            is_verified: 0,
            password: hashed_password,
            avatar: picture,
            nick_name: firstName,
            num_record,
            phone: email,
            uuid: uuid_user,
            verification_code: verif_code,
          },
        })
        .then(async ([student, isNewStudent]) => {
          const {
            id: as_id_user,
            email,
            fs_name,
            ls_name,
            roles,
            uuid,
            is_verified,
          } = student?.toJSON();

          if (isNewStudent) {
            return this.hasRoleModel
              .create({
                RoleId: 4,
                UserId: as_id_user as number,
                status: 1,
              })
              .then((hasrole) => {
                if (hasrole instanceof HasRoles) {
                  const _roles = this.allService.formatRoles(roles as any);
                  return this.jwtService
                    .signinPayloadAndEncrypt({
                      id_user: as_id_user as number,
                      roles_user: _roles,
                      uuid_user: uuid as string,
                      level_indicator: 90,
                    })
                    .then(async ({ code, data, message }) => {
                      this.onWelcomeNewStudent({
                        to: email,
                        otp: verif_code,
                        nom: fs_name,
                        postnom: ls_name,
                        all: true,
                      });
                      const { hashed, cleared, refresh } = data;
                      const newInstance = student.toJSON();

                      delete (newInstance as any).password;
                      delete (newInstance as any).verification_code;
                      delete (newInstance as any).last_login;
                      delete (newInstance as any).status;
                      delete (newInstance as any).is_verified;
                      delete (newInstance as any).createdAt;
                      delete (newInstance as any).updatedAt;
                      const record =
                        this.allService.filterUserFields(newInstance);
                      return res.redirect(
                        `${base}/signin?success=${base64encode(JSON.stringify({ status: 200, user: record, auth_token: hashed, refresh_token: refresh }))}`,
                      );
                    })
                    .catch((err) => {
                      return res.redirect(
                        `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: err?.toString() }))}`,
                      );
                    });
                } else {
                  return res.redirect(
                    `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: null }))}`,
                  );
                }
              })
              .catch((err) => {
                return res.redirect(
                  `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: err?.toString() }))}`,
                );
              });
          } else {
            const _roles = this.allService.formatRoles(roles as any);
            return this.jwtService
              .signinPayloadAndEncrypt({
                id_user: as_id_user as number,
                roles_user: _roles,
                uuid_user: uuid as string,
                level_indicator: 90,
              })
              .then(async ({ code, data, message }) => {
                const verif_code = this.allService.randomLongNumber({
                  length: 6,
                });
                return student
                  .update({ verification_code: verif_code })
                  .then((_) => {
                    const newInstance = student.toJSON();

                    delete (newInstance as any).password;
                    delete (newInstance as any).verification_code;
                    delete (newInstance as any).last_login;
                    delete (newInstance as any).status;
                    delete (newInstance as any).is_verified;
                    delete (newInstance as any).createdAt;
                    delete (newInstance as any).updatedAt;
                    const { hashed, refresh, cleared } = data;
                    // if (is_verified) this.onWelcomeNewStudent({ to: email, nom: fs_name, postnom: ls_name, otp: verif_code, all: false })
                    return res.redirect(
                      `${base}/signin?success=${base64encode(JSON.stringify({ status: 200, user: student, auth_token: hashed, refresh_token: refresh }))}`,
                    );
                  })
                  .catch((err) =>
                    res.redirect(
                      `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: err?.toString() }))}`,
                    ),
                  );
              })
              .catch((err) => {
                return res.redirect(
                  `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: err?.toString() }))}`,
                );
              });
          }
        })
        .catch((err) => {
          return res.redirect(
            `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: err?.toString() }))}`,
          );
        });
    } catch (error) {
      return res.redirect(
        `${base}/signin?error=${base64encode(JSON.stringify({ code: 500, message: 'Impossible to initialize roles', data: error?.toString() }))}`,
      );
    }
  }
}
