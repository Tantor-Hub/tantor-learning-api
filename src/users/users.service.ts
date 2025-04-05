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
import { GetUserByRoleDto } from 'src/roles/dto/get-users-byrole.dto';
import { VerifyAsStudentDto } from './dto/verify-student.dto';
import { ResentCodeDto } from './dto/resent-code.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users)
        private readonly userModel: typeof Users,

        @InjectModel(Roles)
        private readonly rolesModel: typeof Roles,

        @InjectModel(HasRoles)
        private readonly hasRoleModel: typeof HasRoles,

        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly allService: AllSercices,
        private readonly cryptoService: CryptoService,
    ) { }

    async onWelcomeNewStudent({ to, otp, nom, postnom, all }: { to: string, nom: string, postnom: string, all?: boolean, otp: string }): Promise<void> {
        if (all && all === true) {
            this.mailService.sendMail({
                content: this.mailService.templates({ as: 'welcome', nom, postnom }),
                to,
                subject: "Félicitations"
            })
                .then(({ code, data, message }) => { })
                .catch(err => { })

            this.mailService.sendMail({
                content: this.mailService.templates({ as: 'otp', nom, postnom, code: otp }),
                to,
                subject: "Code de vérification"
            })
        } else {
            this.mailService.sendMail({
                content: this.mailService.templates({ as: 'otp', nom, postnom, code: otp }),
                to,
                subject: "Code de vérification"
            })
        }
    }

    async getAllUsers(): Promise<ResponseServer> {

        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
        // Roles.belongsToMany(Users, { through: HasRoles });
        return this.userModel.findAll({
            include: [
                {
                    model: Roles,
                    required: true,
                    attributes: {
                        exclude: ['status']
                    }
                }
            ],
            attributes: {
                exclude: ['password', 'verification_code', 'status', 'is_verified']
            },
            where: {
                status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async getAllUsersByRole(getUserByRoleDto: GetUserByRoleDto): Promise<ResponseServer> {
        return this.userModel.findAll({
            where: {
                // status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async signInAsStudent(signInStudentDto: SignInStudentDto): Promise<ResponseServer> {
        const { user_name, password } = signInStudentDto
        return this.userModel.findOne({
            where: {
                status: 1,
                [Op.or]: [{ email: user_name }, { nick_name: user_name }],
            }
        })
            .then(async student => {
                if (student instanceof Users) {
                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, roles } = student?.toJSON()
                    if (is_verified === 1) {
                        const matched = await this.cryptoService.comparePassword(password, as_hashed_password);
                        if (matched) {
                            return this.jwtService.signinPayloadAndEncrypt({
                                id_user: id as number,
                                roles_user: [...roles as any],
                                uuid_user: uuid as string,
                                level_indicator: 90
                            })
                                .then(async ({ code, data, message }) => {
                                    const { cleared, hashed } = data
                                    return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, user: student.toJSON() } })
                                })
                                .catch(err => {
                                    return Responder({ status: 500, data: err })
                                })
                        } else {
                            return Responder({ status: HttpStatusCode.Forbidden, data: null })
                        }
                    } else {
                        const verif_code = this.allService.randomLongNumber({ length: 6 })
                        return student.update({
                            verification_code: verif_code
                        })
                            .then(_ => {

                                const newInstance = student.toJSON();

                                delete (newInstance as any).password;
                                delete (newInstance as any).verification_code;
                                delete (newInstance as any).last_login;
                                delete (newInstance as any).status;
                                delete (newInstance as any).is_verified;
                                delete (newInstance as any).createdAt;
                                delete (newInstance as any).updatedAt;

                                this.onWelcomeNewStudent({ to: email, nom: fs_name, postnom: ls_name, otp: verif_code, all: false })
                                return Responder({ status: HttpStatusCode.Unauthorized, data: { message: `Compte non vérifié | a verification code was sent to the user ::: [${email}]`, user: newInstance } })
                            })
                            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    }
                } else {
                    return Responder({ status: HttpStatusCode.Forbidden, data: null })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async registerAsStudent(createUserDto: CreateUserDto): Promise<ResponseServer> {
        const { email, fs_name, ls_name, password, id, nick_name, phone, uuid, verification_code } = createUserDto
        const existingUser = await this.userModel.findOne({ where: { email } });
        if (existingUser) {
            return Responder({ status: HttpStatusCode.Conflict, data: `[Email]: ${email} est déjà utilisé` })
        }

        const verif_code = this.allService.randomLongNumber({ length: 6 })
        const num_record = this.allService.randomLongNumber({ length: 6 })
        const hashed_password = await this.cryptoService.hashPassword(password)
        const uuid_user = this.allService.generateUuid()

        return this.userModel.create({
            num_record: num_record,
            email,
            fs_name,
            ls_name,
            password: hashed_password,
            nick_name,
            phone: email,
            uuid: uuid_user,
            verification_code: verif_code,
            is_verified: 0,
            status: 1
        })
            .then(student => {
                if (student instanceof Users) {
                    const { id: as_id_user, email } = student?.toJSON()
                    return this.hasRoleModel.create({
                        RoleId: 4, // this Means Student Or Stagiaire
                        UserId: as_id_user as number,
                        status: 1
                    })
                        .then(hasrole => {
                            if (hasrole instanceof HasRoles) {
                                this.onWelcomeNewStudent({ to: email, otp: verif_code, nom: fs_name, postnom: ls_name, all: true })
                                const newInstance = student.toJSON();

                                delete (newInstance as any).password;
                                delete (newInstance as any).verification_code;
                                delete (newInstance as any).last_login;
                                delete (newInstance as any).status;
                                delete (newInstance as any).is_verified;
                                delete (newInstance as any).createdAt;
                                delete (newInstance as any).updatedAt;

                                return Responder({ status: HttpStatusCode.Created, data: { message: `A verification code was sent to the user ::: [${email}]`, user: newInstance } })
                            } else {
                                return Responder({ status: HttpStatusCode.BadRequest })
                            }
                        })
                        .catch(err => {
                            log(err)
                            return Responder({ status: HttpStatusCode.Conflict, data: err })
                        })
                } else {
                    log("You are here ")
                    return Responder({ status: HttpStatusCode.BadRequest, data: {} })
                }
            })
            .catch(err => {
                log(err)
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async resentVerificationCode(resentCodeDto: ResentCodeDto): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.BadGateway, })
    }

    async verifyAsStudent(verifyAsStudentDto: VerifyAsStudentDto): Promise<ResponseServer> {
        const { email_user, verication_code } = verifyAsStudentDto
        return this.userModel.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                status: 1,
                email: email_user
                // [Op.or]: [{ id: uuid_user }, { uuid: uuid_user }],
            }
        })
            .then(async student => {
                log(student?.toJSON())
                if (student instanceof Users) {
                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, verification_code: as_code, roles } = student?.toJSON()
                    if (is_verified === 0) {
                        if (as_code?.toString() === verication_code.toString()) {
                            return this.jwtService.signinPayloadAndEncrypt({
                                id_user: id as number,
                                roles_user: [...roles as any],
                                uuid_user: uuid as string,
                                level_indicator: 90
                            })
                                .then(async ({ code, data, message }) => {
                                    const { cleared, hashed } = data
                                    student.update({
                                        is_verified: 1
                                    })
                                    return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, user: student.toJSON() } })
                                })
                                .catch(err => {
                                    return Responder({ status: 500, data: err })
                                })
                        } else {
                            return Responder({ status: HttpStatusCode.Forbidden, data: `Le code de vérification est invalide` })
                        }
                    } else {
                        return Responder({ status: HttpStatusCode.BadRequest, data: `User still verified ::: [${email}]` })
                    }
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: `${email_user} n'est pas reconnu !` })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.NotFound, data: err }))
    }

    async findByEmail(email: string): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: {} })
    }
}
