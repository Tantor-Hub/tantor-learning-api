import { Injectable } from '@nestjs/common';
import { ResponseServer } from 'src/interface/interface.response';
import { CreateUserDto } from './dto/create-student.dto';
import { Users } from 'src/models/model.users';
import { InjectModel } from '@nestjs/sequelize';
import {
  Responder,
  PasswordlessLoginResponder,
} from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { AllSercices } from 'src/services/serices.all';
import { MailService } from 'src/services/service.mail';
import { CryptoService } from '../services/service.crypto';
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
import { IHomeWorks } from 'src/interface/interface.homework';
import { Messages } from 'src/models/model.messages';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserMagicLinkDto } from './dto/create-user-withmagiclink.dto';
import { RegisterPasswordlessDto } from './dto/register-passwordless.dto';
import { LoginPasswordlessDto } from './dto/login-passwordless.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Response } from 'express';
import { base64decode, base64encode } from 'nodejs-base64';
import { UserRole } from 'src/interface/interface.users';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users)
    private readonly userModel: typeof Users,

    @InjectModel(Messages)
    private readonly messagesModel: typeof Messages,

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
    const { id_user, level_indicator } = user;
    try {
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async loadScores(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user, level_indicator } = user;

    try {
      const getSemesterScores = async (
        id_user: string,
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

        // TODO: Implement homework scores when StagiaireHasHomeWork model is restored
        const [ongoing, last] = await Promise.all([
          // this.hashomeworkModel.findAll({
          //   where: {
          //     id_user,
          //     date_de_creation: {
          //       [Op.between]: [semesterStart, semesterEnd],
          //     },
          //   },
          //   attributes: [
          //     [Sequelize.fn('SUM', Sequelize.col('score')), 'score'],
          //     [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          //   ],
          //   raw: true,
          // }) as any,
          [{ score: 0, total: 0 }] as any,
          // this.hashomeworkModel.findAll({
          //   where: {
          //     id_user,
          //     date_de_creation: {
          //       [Op.between]: [lastSemesterStart, lastSemesterEnd],
          //     },
          //   },
          //   attributes: [
          //     [Sequelize.fn('SUM', Sequelize.col('score')), 'score'],
          //     [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          //   ],
          //   raw: true,
          // }) as any,
          [{ score: 0, total: 0 }] as any,
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
  async loadStudentDashboard(user: IJwtSignin): Promise<ResponseServer> {
    const { id_user } = user;
    try {
      // card 1
      // TODO: Implement session counts when StagiaireHasSession model is restored
      const enroledCours = 0; // await this.hasSessionModel.count({ where: { id_stagiaire: id_user } });
      const onGoingCours = 0; // await this.hasSessionModel.count({ where: { id_stagiaire: id_user, is_started: 1 } });

      // card 2
      // TODO: Implement homework counts when StagiaireHasHomeWork model is restored
      const enroledHomeworks = 0; // await this.hashomeworkModel.count({ where: { id_user, is_returned: 0 } });
      const allPendingHomeworks: IHomeWorks[] = []; // await this.hashomeworkModel.findAll({
      //   where: {
      //     id_user,
      //     is_returned: 0,
      //     date_de_remise: { [Op.gte]: Date.now() / 1000 },
      //   },
      //   order: [['date_de_remise', 'ASC']],
      // });

      const grouped = allPendingHomeworks.reduce(
        (acc, hw) => {
          const date = hw.date_de_remise?.toString() || 'unknown';
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
    firstName,
    lastName,
    all,
  }: {
    to: string;
    firstName: string;
    lastName: string;
    all?: boolean;
    otp: string;
  }): Promise<void> {
    if (all && all === true) {
      this.mailService
        .sendMail({
          content: this.mailService.templates({
            as: 'welcome',
            firstName: firstName ?? '',
            lastName: lastName ?? '',
          }),
          to,
          subject: 'Félicitations',
        })
        .then(({ code, data, message }) => {})
        .catch((err) => {});

      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'otp',
          firstName: firstName || '',
          lastName: lastName || '',
          code: otp,
        }),
        to,
        subject: 'Code de vérification',
      });
    } else {
      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'otp',
          firstName,
          lastName,
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
        include: [],
        attributes: {
          exclude: ['verification_code', 'is_verified'],
        },
        where: {},
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
        attributes: ['id', 'firstName', 'lastName', 'avatar'],
        where: {},
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
    group: 'instructor' | 'admin' | 'student' | 'secretary' | 'all',
  ): Promise<ResponseServer> {
    console.log('=== getAllUsersByRole: Starting ===');
    console.log('Requested group:', group);
    console.log('Group type:', typeof group);

    const whereCondition = {
      ...(group !== 'all' && { role: group.toLowerCase() }),
    };

    console.log('=== getAllUsersByRole: Database query ===');
    console.log('Where condition:', JSON.stringify(whereCondition, null, 2));
    console.log('Group to lowercase:', group.toLowerCase());
    console.log('Is group "all"?', group === 'all');

    return this.userModel
      .findAll({
        include: [],
        attributes: {
          exclude: [
            'verification_code',
            'is_verified',
            'createdAt',
            'updatedAt',
            'last_login',
          ],
        },
        where: whereCondition,
      })
      .then((list) => {
        console.log('=== getAllUsersByRole: Database success ===');
        console.log('Found users count:', list.length);
        console.log(
          'Users data:',
          list.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          })),
        );

        const response = Responder({
          status: HttpStatusCode.Ok,
          data: { length: list.length, list },
        });

        console.log('=== getAllUsersByRole: Response created ===');
        console.log('Response status:', response.status);
        console.log('Response data length:', response.data?.length);

        return response;
      })
      .catch((err) => {
        console.error('=== getAllUsersByRole: Database error ===');
        console.error('Error type:', typeof err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        console.error('Full error object:', JSON.stringify(err, null, 2));

        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: err,
        });
      });
  }

  async getUserWithRoles(id: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: { id },
    });

    if (!user) return null;

    const json = user.toJSON();
    const record = this.allService.filterUserFields(json);
    // roles now derived from user.role only
    return { ...record, roles: [this.roleMap[user.role] || 4] };
  }
  async registerAsStudent(
    createUserDto: CreateUserDto,
  ): Promise<ResponseServer> {
    const {
      email,
      firstName,
      lastName,
      id,
      phone,
      uuid,
      verification_code,
      dateBirth,
    } = createUserDto;
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      return Responder({
        status: HttpStatusCode.Conflict,
        data: `[Email]: ${email} est déjà utilisé`,
      });
    }

    const verif_code = this.allService.randomLongNumber({ length: 6 });

    return this.userModel
      .create({
        email,
        firstName,
        lastName,
        phone: phone ?? '',
        dateBirth: dateBirth ?? '',
        verification_code: verif_code,
        is_verified: false,
        role: UserRole.STUDENT,
      } as any)
      .then((student) => {
        if (student instanceof Users) {
          const { id: as_id_user, email } = student?.toJSON();
          this.onWelcomeNewStudent({
            to: email,
            otp: verif_code,
            firstName: firstName,
            lastName: lastName,
            all: true,
          });
          const newInstance = student.toJSON();

          delete (newInstance as any).verification_code;
          delete (newInstance as any).last_login;
          delete (newInstance as any).is_verified;
          delete (newInstance as any).createdAt;
          delete (newInstance as any).updatedAt;

          const record = this.allService.filterUserFields(newInstance);
          return Responder({
            status: HttpStatusCode.Created,
            data: { user: record as any } as any,
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
  async registerThanSendMagicLink(
    createUserDto: CreateUserMagicLinkDto,
  ): Promise<ResponseServer> {
    const { email, id_role } = createUserDto;
    try {
      const existingUser = await this.userModel.findOne({ where: { email } });
      // No roles table now; validate role value against enum if needed
      const role = { role: id_role ? id_role : 2 } as any;
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

      const verif_code = this.allService.randomLongNumber({ length: 6 });
      const uuid_user = this.allService.generateUuid();
      const escape = this.configService.get<string>('ESCAPESTRING') || '---';
      const { role: as_role } = role as any;

      return this.userModel
        .create({
          email,
          firstName: escape,
          lastName: escape,
          verification_code: verif_code,
          is_verified: false,
          role: UserRole.STUDENT,
        })
        .then(async (u) => {
          if (u instanceof Users) {
            const { id } = u.toJSON();
            const { id: uid } = u.toJSON();
            return this.jwtService
              .signinPayloadAndEncrypt({
                id_user: uid as any,
                uuid_user,
                level_indicator: 95,
              })
              .then(({ data, code }) => {
                const { hashed, refresh, cleared } = data;
                this.mailService.onInviteViaMagicLink({
                  to: email,
                  link: `${process.env.BASECLIENTURL}/auth/magic-link?email=${email}&verify=${hashed}`,
                  role: as_role,
                });

                // Send welcome email after account creation
                this.mailService.sendMail({
                  content: this.mailService.templates({
                    as: 'welcome',
                    firstName: escape,
                    lastName: escape,
                  }),
                  to: email,
                  subject: 'Bienvenue chez Tantor',
                });

                return Responder({
                  status: HttpStatusCode.Created,
                  data: 'Magic link envoyé avec succès !',
                });
              })
              .catch((er) =>
                Responder({
                  status: HttpStatusCode.InternalServerError,
                  data: er,
                }),
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
      firstName,
      lastName,
      id,
      phone,
      uuid,
      verification_code,
      id_role,
      dateBirth,
    } = createUserDto;
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      return Responder({
        status: HttpStatusCode.Conflict,
        data: `[Email]: ${email} est déjà utilisé`,
      });
    }

    const verif_code = this.allService.randomLongNumber({ length: 6 });
    const uuid_user = this.allService.generateUuid();

    return this.userModel
      .create({
        email,
        firstName,
        lastName,
        phone: phone || '',
        dateBirth: dateBirth || '',
        verification_code: verif_code,
        is_verified: id_role && id_role === 4 ? false : true,
        role: UserRole.STUDENT,
      } as any)
      .then((student) => {
        if (student instanceof Users) {
          const { id: as_id_user, email } = student?.toJSON();
          this.onWelcomeNewStudent({
            to: email,
            otp: verif_code,
            firstName: firstName,
            lastName: lastName,
            all: true,
          });
          const newInstance = student.toJSON();

          delete (newInstance as any).verification_code;
          delete (newInstance as any).last_login;
          delete (newInstance as any).is_verified;
          delete (newInstance as any).createdAt;
          delete (newInstance as any).updatedAt;

          const record = this.allService.filterUserFields(newInstance);
          return Responder({
            status: HttpStatusCode.Created,
            data: { user: record } as any,
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
      firstName,
      lastName,
      id,
      phone,
      uuid,
      verification_code,
      dateBirth,
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
      return this.userModel
        .update(
          {
            email,
            firstName,
            lastName,
            phone: phone || '',
            dateBirth: dateBirth || '',
          } as any,
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

            delete (newInstance as any).verification_code;
            delete (newInstance as any).last_login;
            delete (newInstance as any).is_verified;
            delete (newInstance as any).createdAt;
            delete (newInstance as any).updatedAt;

            // Send welcome email after completing registration
            this.onWelcomeNewStudent({
              to: existingUser.email,
              otp: existingUser.verification_code || '000000',
              firstName: existingUser.firstName || '',
              lastName: existingUser.lastName || '',
              all: true,
            });

            return Responder({
              status: HttpStatusCode.Created,
              data: { user: newInstance } as any,
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
  async resentVerificationCode(
    resentCodeDto: ResentCodeDto,
    forgetPasswordCase: boolean = false,
  ): Promise<ResponseServer> {
    const { user_email } = resentCodeDto;
    const verif_code = this.allService.randomLongNumber({ length: 6 });

    console.log(
      `[Resend OTP] Generating new OTP: ${verif_code} for email: ${user_email}`,
    );

    return this.userModel
      .findOne({
        where: {
          [Op.or]: [{ email: user_email }],
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            firstName,
            lastName,
            is_verified,
            id,
            verification_code: as_code,
            otp: current_otp,
          } = student?.toJSON();

          console.log(`[Resend OTP] Found user: ${email}`);
          console.log(`[Resend OTP] Current verification_code: ${as_code}`);
          console.log(`[Resend OTP] Current otp: ${current_otp}`);

          this.onWelcomeNewStudent({
            to: email,
            firstName: firstName || 'User',
            lastName: lastName || '',
            all: false,
            otp: verif_code,
          });

          // Update both fields to be safe
          await student.update({
            verification_code: verif_code,
            otp: verif_code,
          });

          console.log(
            `[Resend OTP] ✅ Updated both verification_code and otp to: ${verif_code}`,
          );

          return Responder({
            status: HttpStatusCode.Ok,
            data: { firstName, lastName, email },
          });
        } else {
          console.log(`[Resend OTP] ❌ User not found: ${user_email}`);
          return Responder({
            status: HttpStatusCode.NotFound,
            data: `${user_email} n'est pas reconnu !`,
          });
        }
      })
      .catch((err) => {
        console.log(`[Resend OTP] ❌ Error: ${err}`);
        return Responder({ status: HttpStatusCode.NotFound, data: err });
      });
  }
  async verifyBeforeResetPassword(
    verifyAsStudentDto: VerifyAsStudentDto,
  ): Promise<ResponseServer> {
    const { email_user, verication_code } = verifyAsStudentDto;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        attributes: {
          exclude: ['verification_code', 'is_verified', 'last_login'],
        },
        include: [],
        where: {
          email: email_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            firstName,
            lastName,
            is_verified,
            id,
            verification_code: as_code,
          } = student?.toJSON();
          if (1) {
            if (as_code?.toString() === verication_code.toString()) {
              student.update({
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
          exclude: ['verification_code', 'is_verified', 'last_login'],
        },
        include: [],
        where: {
          email: email_user,
        },
      })
      .then(async (student) => {
        if (student instanceof Users) {
          const {
            email,
            firstName,
            lastName,
            is_verified,
            id,
            verification_code: as_code,
          } = student?.toJSON();

          if (is_verified === false) {
            if (as_code?.toString() === verication_code.toString()) {
              return this.jwtService
                .signinPayloadAndEncrypt({
                  id_user: id!,
                  uuid_user: id!,
                  level_indicator: 90,
                })
                .then(async ({ code, data, message }) => {
                  const { cleared, hashed, refresh } = data;
                  student.update({
                    is_verified: true,
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
        include: [],
        attributes: {
          exclude: ['verification_code', 'is_verified', 'last_login'],
        },
        where: {
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
    const { id_user, uuid_user, level_indicator } = user;
    if (Object.keys(profile as {}).length <= 0) {
      return Responder({
        status: HttpStatusCode.NotAcceptable,
        data: 'Le body de la requete ne peut etre vide',
      });
    }

    delete profile.avatar;
    delete profile.verification_code;
    delete profile.is_verified;
    delete profile.last_login;
    delete profile.id;
    delete profile.roles;

    return this.userModel
      .findOne({
        include: [],
        where: {
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
    const { id_user, uuid_user, level_indicator } = user;
    // Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

    return this.userModel
      .findOne({
        include: [],
        attributes: {
          exclude: ['verification_code', 'is_verified', 'last_login'],
        },
        where: {
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
  async registerPasswordless(
    registerDto: RegisterPasswordlessDto,
  ): Promise<ResponseServer> {
    const {
      email,
      firstName,
      lastName,
      avatar,
      address,
      country,
      city,
      dateBirth,
    } = registerDto;

    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      return Responder({
        status: HttpStatusCode.Conflict,
        data: {
          message: `[Email]: ${email} est déjà utilisé`,
        },
      });
    }

    const otp = this.allService.randomLongNumber({ length: 6 });

    try {
      const user = await this.userModel.create({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        avatar,
        address,
        country,
        city,
        dateBirth: dateBirth ?? '',
        role: UserRole.STUDENT,
        otp,
        is_verified: false,
      } as any);

      // Send OTP email
      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'otp',
          firstName: firstName || '',
          lastName: lastName || '',
          code: otp,
        }),
        to: email,
        subject: 'Code de vérification pour inscription',
      });

      // Send welcome email after account creation
      this.mailService.sendMail({
        content: this.mailService.templates({
          as: 'welcome',
          firstName: firstName || '',
          lastName: lastName || '',
        }),
        to: email,
        subject: 'Bienvenue chez Tantor',
      });

      return Responder({
        status: HttpStatusCode.Created,
        data: {
          message:
            "Inscription réussie. OTP envoyé à votre email pour finaliser l'inscription",
          user: this.allService.filterUserFields(user.toJSON()),
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: "Erreur lors de l'inscription de l'utilisateur",
          error,
        },
      });
    }
  }

  async loginPasswordless(loginDto: LoginPasswordlessDto): Promise<any> {
    const { email } = loginDto;

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return PasswordlessLoginResponder({
        status: HttpStatusCode.NotFound,
        message: 'Utilisateur non trouvé',
      });
    }

    const otp = this.allService.randomLongNumber({ length: 6 });

    await user.update({ otp });

    // Send OTP email
    this.mailService.sendMail({
      content: this.mailService.templates({
        as: 'otp',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        code: otp,
      }),
      to: email,
      subject: 'Code de vérification pour connexion',
    });

    return PasswordlessLoginResponder({
      status: HttpStatusCode.Ok,
      message: 'OTP envoyé à votre email',
    });
  }

  async verifyOtp(verifyDto: VerifyOtpDto): Promise<ResponseServer> {
    const { email, otp } = verifyDto;

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      console.log(`[OTP Verification] User not found for email: ${email}`);
      return Responder({
        status: HttpStatusCode.NotFound,
        data: 'Utilisateur non trouvé',
      });
    }

    console.log(
      `[OTP Verification] Attempting verification for email: ${email}`,
    );
    console.log(`[OTP Verification] OTP from request body: ${otp}`);
    console.log(`[OTP Verification] OTP stored in database: ${user.otp}`);

    if (!user.otp || user.otp !== otp) {
      console.log(
        `[OTP Verification] ❌ INVALID OTP - Email: ${email}, Requested OTP: ${otp}, Stored OTP: ${user.otp}`,
      );
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: 'OTP invalide',
      });
    }

    console.log(
      `[OTP Verification] ✅ SUCCESSFUL OTP verification for email: ${email}`,
    );

    // Clear OTP
    await user.update({ otp: undefined });

    console.log('User logged in:', user.toJSON());

    // Generate JWT
    return this.jwtService
      .signinPayloadAndEncrypt({
        id_user: user.id,
        uuid_user: user.id,
        level_indicator: 90,
      })
      .then(({ code, data, message }) => {
        const { cleared, hashed, refresh } = data;
        return Responder({
          status: HttpStatusCode.Ok,
          data: {
            auth_token: hashed,
            refresh_token: refresh,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              avatar: user.avatar,
              role: user.role,
            } as any,
          },
        });
      })
      .catch((err) => {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: err,
        });
      });
  }
  async changeRole(changeRoleDto: {
    email: string;
    role: string;
  }): Promise<ResponseServer> {
    const { email, role } = changeRoleDto;

    const roleId = this.roleMap[role];
    if (!roleId) {
      return Responder({
        status: HttpStatusCode.BadRequest,
        data: `Rôle invalide: ${role}`,
      });
    }

    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      return Responder({
        status: HttpStatusCode.NotFound,
        data: `Utilisateur avec l'email ${email} non trouvé`,
      });
    }

    const userId = user.id;

    // Update the role in the users table
    await user.update({ role: role as UserRole });

    return Responder({
      status: HttpStatusCode.Ok,
      data: `Rôle de l'utilisateur ${email} changé avec succès à ${role}`,
    });
  }
  async getUserRoleByEmail(email: string): Promise<ResponseServer> {
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      return Responder({
        status: HttpStatusCode.NotFound,
        data: `Utilisateur avec l'email ${email} non trouvé`,
      });
    }

    const roles = [this.roleMap[user.role] || 4];

    return Responder({
      status: HttpStatusCode.Ok,
      data: {
        email: user.email,
        roles: roles,
        userId: user.id,
      },
    });
  }

  async authWithGoogle(user: IAuthWithGoogle, res: Response): Promise<any> {
    const { email, firstName, lastName, picture, accessToken } = user;

    const verif_code = this.allService.randomLongNumber({ length: 6 });
    const uuid_user = this.allService.generateUuid();
    const base =
      (process.env.APPBASEURLFRONT as string) || 'http://localhost:3000';
    try {
      return this.userModel
        .findOrCreate({
          where: { email },
          defaults: {
            email,
            lastName: lastName,
            firstName: firstName,
            is_verified: false,
            avatar: picture,
            phone: email,
            verification_code: verif_code,
            role: UserRole.STUDENT,
          } as any,
        })
        .then(async ([student, isNewStudent]) => {
          const {
            id: as_id_user,
            email,
            firstName,
            lastName,
            is_verified,
          } = student?.toJSON();
          if (!isNewStudent && as_id_user) {
            return this.jwtService
              .signinPayloadAndEncrypt({
                id_user: as_id_user,
                uuid_user: uuid_user,
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

                    delete (newInstance as any).verification_code;
                    delete (newInstance as any).last_login;
                    delete (newInstance as any).is_verified;
                    delete (newInstance as any).createdAt;
                    delete (newInstance as any).updatedAt;
                    const { hashed, refresh, cleared } = data;
                    // if (is_verified) this.onWelcomeNewStudent({ to: email, nom: firstName, postnom: lastName, otp: verif_code, all: false })
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
          // New student path: create token and welcome
          if (as_id_user) {
            return this.jwtService
              .signinPayloadAndEncrypt({
                id_user: as_id_user,
                uuid_user: uuid_user,
                level_indicator: 90,
              })
              .then(async ({ code, data, message }) => {
                this.onWelcomeNewStudent({
                  to: email,
                  otp: verif_code,
                  firstName: firstName || 'User',
                  lastName: lastName || '',
                  all: true,
                });
                const { hashed, cleared, refresh } = data;
                const newInstance = student.toJSON();

                delete (newInstance as any).verification_code;
                delete (newInstance as any).last_login;
                delete (newInstance as any).is_verified;
                delete (newInstance as any).createdAt;
                delete (newInstance as any).updatedAt;
                const record = this.allService.filterUserFields(newInstance);
                return res.redirect(
                  `${base}/signin?success=${base64encode(JSON.stringify({ status: 200, user: record as any, auth_token: hashed, refresh_token: refresh }))}`,
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
