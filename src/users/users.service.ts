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
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { IAuthWithGoogle } from 'src/interface/interface.authwithgoogle';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
        private readonly configService: ConfigService
    ) { }

    private formatRoles(roles: any[]): number[] {
        return roles.map(role => role?.id)
    }

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

        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
        return this.userModel.findOne({
            include: [
                {
                    model: Roles,
                    required: true,
                    attributes: {
                        exclude: ['status']
                    }
                }
            ],
            where: {
                status: 1,
                [Op.or]: [{ email: user_name }, { nick_name: user_name }],
            }
        })
            .then(async student => {
                if (student instanceof Users) {
                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, roles } = student?.toJSON()
                    const _roles = this.formatRoles(roles as any)

                    if (is_verified === 1) {
                        const matched = await this.cryptoService.comparePassword(password, as_hashed_password);
                        if (matched) {
                            return this.jwtService.signinPayloadAndEncrypt({
                                id_user: id as number,
                                roles_user: _roles,
                                uuid_user: uuid as string,
                                level_indicator: 90
                            })
                                .then(async ({ code, data, message }) => {
                                    const { cleared, hashed, refresh } = data
                                    return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, refresh_token: refresh, user: student.toJSON() } })
                                })
                                .catch(err => {
                                    return Responder({ status: 500, data: err })
                                })
                        } else {
                            return Responder({ status: HttpStatusCode.Forbidden, data: "Mot de passe ou nom d'utilisateur incorrect !" })
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
                    return Responder({ status: HttpStatusCode.Forbidden, data: "Mot de passe ou nom d'utilisateur incorrect !" })
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
        const num_record = this.allService.randomLongNumber({ length: 8 })
        const hashed_password = await this.cryptoService.hashPassword(password)
        const uuid_user = this.allService.generateUuid()

        return this.userModel.create({
            num_record: num_record,
            email,
            fs_name,
            ls_name,
            phone: phone,
            password: hashed_password,
            nick_name,
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
                    return Responder({ status: HttpStatusCode.BadRequest, data: {} })
                }
            })
            .catch(err => {
                log(err)
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async registerAsNewUser(createUserDto: CreateUserDto): Promise<ResponseServer> {
        const { email, fs_name, ls_name, password, id, nick_name, phone, uuid, verification_code, id_role } = createUserDto
        const existingUser = await this.userModel.findOne({ where: { email } });
        if (existingUser) {
            return Responder({ status: HttpStatusCode.Conflict, data: `[Email]: ${email} est déjà utilisé` })
        }

        const verif_code = this.allService.randomLongNumber({ length: 6 })
        const num_record = this.allService.randomLongNumber({ length: 8 })
        const hashed_password = await this.cryptoService.hashPassword(password)
        const uuid_user = this.allService.generateUuid()

        return this.userModel.create({
            num_record: num_record,
            email,
            fs_name,
            ls_name,
            phone: phone,
            password: hashed_password,
            nick_name,
            uuid: uuid_user,
            verification_code: verif_code,
            is_verified: id_role && id_role === 4 ? 0 : 1,
            status: 1
        })
            .then(student => {
                if (student instanceof Users) {
                    const { id: as_id_user, email } = student?.toJSON()
                    return this.hasRoleModel.create({
                        RoleId: id_role || 2, // ie. sec. role
                        UserId: as_id_user as number,
                        status: 1
                    })
                        .then(hasrole => {
                            if (hasrole instanceof HasRoles) {
                                if (id_role && id_role === 4) this.onWelcomeNewStudent({ to: email, otp: verif_code, nom: fs_name, postnom: ls_name, all: true });
                                const newInstance = student.toJSON();

                                delete (newInstance as any).password;
                                delete (newInstance as any).verification_code;
                                delete (newInstance as any).last_login;
                                delete (newInstance as any).status;
                                delete (newInstance as any).is_verified;
                                delete (newInstance as any).createdAt;
                                delete (newInstance as any).updatedAt;

                                return Responder({ status: HttpStatusCode.Created, data: { user: newInstance } })
                            } else {
                                return Responder({ status: HttpStatusCode.BadRequest })
                            }
                        })
                        .catch(err => {
                            return Responder({ status: HttpStatusCode.Conflict, data: err })
                        })
                } else {
                    return Responder({ status: HttpStatusCode.BadRequest, data: {} })
                }
            })
            .catch(err => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async setNewPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseServer> {
        const { new_password, repet_new_password, user_name, verification_code, description } = resetPasswordDto

        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
        return this.userModel.findOne({
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
                exclude: ['password']
            },
            where: {
                status: 1,
                [Op.or]: [{ email: user_name }, { nick_name: user_name }]
            }
        })
            .then(async student => {
                if (student instanceof Users) {
                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, verification_code: as_code, roles } = student?.toJSON()
                    if (as_code === verification_code) {
                        if (repet_new_password && repet_new_password.length > 0) {
                            if (new_password !== repet_new_password) return Responder({ status: HttpStatusCode.BadRequest, data: "Les deux mot de passe ne sont pas identiques !" })
                        }

                        const hashed_password = await this.cryptoService.hashPassword(new_password)
                        const _roles = this.formatRoles(roles as any)

                        return student.update({
                            password: hashed_password
                        })
                            .then(_ => {
                                return this.jwtService.signinPayloadAndEncrypt({
                                    id_user: id as number,
                                    roles_user: _roles,
                                    uuid_user: uuid as string,
                                    level_indicator: 90
                                })
                                    .then(async ({ code, data, message }) => {
                                        const { cleared, hashed, refresh } = data
                                        const newInstance = student.toJSON();

                                        delete (newInstance as any).password;
                                        delete (newInstance as any).verification_code;
                                        delete (newInstance as any).last_login;
                                        delete (newInstance as any).status;
                                        delete (newInstance as any).is_verified;
                                        delete (newInstance as any).createdAt;
                                        delete (newInstance as any).updatedAt;

                                        return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, refresh_token: refresh, user: newInstance } })
                                    })

                                    .catch(err => {
                                        return Responder({ status: 500, data: err })
                                    })
                            })
                            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    } else {
                        return Responder({ status: HttpStatusCode.Forbidden, data: `Le code de vérification envoyé n'est pas correct !` })
                    }
                } else {
                    return Responder({ status: HttpStatusCode.Forbidden, data: null })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async resentVerificationCode(resentCodeDto: ResentCodeDto): Promise<ResponseServer> {

        const { user_email } = resentCodeDto
        const verif_code = this.allService.randomLongNumber({ length: 6 })

        return this.userModel.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                status: 1,
                [Op.or]: [{ email: user_email }, { nick_name: user_email }]
            }
        })
            .then(async student => {
                if (student instanceof Users) {
                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, verification_code: as_code, roles } = student?.toJSON()
                    this.onWelcomeNewStudent({ to: email, nom: fs_name, postnom: ls_name, all: false, otp: verif_code })
                    await student.update({
                        verification_code: verif_code
                    })
                    return Responder({ status: HttpStatusCode.Ok, data: { message: `Un nouveau code de vérification a été envoyé à ${email}`, user: { fs_name, ls_name, email, nick_name } } })
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: `${user_email} n'est pas reconnu !` })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.NotFound, data: err }))
    }

    async verifyAsStudent(verifyAsStudentDto: VerifyAsStudentDto): Promise<ResponseServer> {

        const { email_user, verication_code } = verifyAsStudentDto
        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

        return this.userModel.findOne({
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: Roles,
                    required: true,
                    attributes: {
                        exclude: ['status']
                    }
                }
            ],
            where: {
                status: 1,
                email: email_user
            }
        })
            .then(async student => {
                if (student instanceof Users) {

                    const { email, fs_name, ls_name, nick_name, password: as_hashed_password, is_verified, uuid, id, verification_code: as_code, roles } = student?.toJSON()
                    const _roles = this.formatRoles(roles as any)

                    if (is_verified === 0) {
                        if (as_code?.toString() === verication_code.toString()) {
                            return this.jwtService.signinPayloadAndEncrypt({
                                id_user: id as number,
                                roles_user: [..._roles],
                                uuid_user: uuid as string,
                                level_indicator: 90
                            })
                                .then(async ({ code, data, message }) => {
                                    const { cleared, hashed, refresh } = data
                                    student.update({
                                        is_verified: 1
                                    })
                                    return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, refresh_token: refresh, user: student.toJSON() } })
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
            .catch(err => {
                return Responder({ status: HttpStatusCode.NotFound, data: err })
            })
    }

    async refreshTokenUser(refreshTokenDto: RefreshTokenDto): Promise<ResponseServer> {
        const { refresh_token } = refreshTokenDto
        return this.jwtService.verifyRefreshToken(refresh_token)
            .then(_ => {
                if (_ && _ !== null) {

                    delete _.iat;
                    delete _.exp;

                    return this.jwtService.refreshTokens(_)
                        .then(({ code, data, message }) => {
                            if (code === 200) {
                                const { hashed, refresh, cleared } = data
                                return Responder({ status: HttpStatusCode.Ok, data: { auth_token: hashed, refresh_token: refresh } })
                            } else {
                                return Responder({ status: HttpStatusCode.InternalServerError, data: _ })
                            }
                        })
                        .catch(_ => Responder({ status: HttpStatusCode.InternalServerError, data: _ }))
                } else {
                    return Responder({ status: HttpStatusCode.Unauthorized, data: "La clé de rafreshissement a aussi expirée !" })
                }
            })
            .catch(_ => {
                return Responder({ status: HttpStatusCode.Unauthorized, data: "La clé de rafreshissement a aussi expirée !" })
            })
    }

    async findByEmail(findByEmailDto: FindByEmailDto): Promise<ResponseServer> {
        const { email } = findByEmailDto
        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

        return this.userModel.findOne({
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
                exclude: ['password', 'verification_code', 'is_verified', 'last_login']
            },
            where: {
                status: 1,
                email: email
            }
        })
            .then(async student => {
                return Responder({ status: HttpStatusCode.Ok, data: student })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async updateUserProfile(user: IJwtSignin, profile: any, req: Request): Promise<ResponseServer> {
        const { id_user, roles_user, uuid_user, level_indicator } = user
        if (Object.keys(profile as {}).length <= 0) {
            return Responder({ status: HttpStatusCode.NotAcceptable, data: "Le body de la requete ne peut etre vide" })
        }

        delete (profile as any).password;
        delete (profile as any).avatar;
        delete (profile as any).verification_code;
        delete (profile as any).is_verified;
        delete (profile as any).last_login;
        delete (profile as any).id;
        delete (profile as any).roles;

        return this.userModel.findOne({
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
                exclude: ['password', 'verification_code', 'is_verified', 'last_login']
            },
            where: {
                status: 1,
                id: id_user
            }
        })
            .then(async student => {
                if (student instanceof Users) {
                    student.update({ ...profile })
                    return Responder({ status: HttpStatusCode.Ok, data: student })
                } else {
                    return Responder({ status: HttpStatusCode.NotFound, data: null })
                }
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async profileAsStudent(user: IJwtSignin): Promise<ResponseServer> {

        const { id_user, roles_user, uuid_user, level_indicator } = user
        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });

        return this.userModel.findOne({
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
                exclude: ['password', 'verification_code', 'is_verified', 'last_login']
            },
            where: {
                status: 1,
                id: id_user
            }
        })
            .then(async student => {
                return Responder({ status: HttpStatusCode.Ok, data: student })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async authWithGoogle(user: IAuthWithGoogle): Promise<ResponseServer> {
        const { email, firstName, lastName, picture, accessToken } = user;

        const verif_code = this.allService.randomLongNumber({ length: 6 })
        const num_record = this.allService.randomLongNumber({ length: 8 })
        const hashed_password = await this.cryptoService.hashPassword((this.configService.get<string>('DEFAULTUSERPASSWORD') || '').concat(num_record) as string)
        const uuid_user = this.allService.generateUuid()

        Users.belongsToMany(Roles, { through: HasRoles, foreignKey: "RoleId" });
        return this.userModel.findOrCreate({
            where: {
                email
            },
            include: [
                {
                    model: Roles,
                    required: false,
                    attributes: {
                        exclude: ['status']
                    }
                }
            ],
            defaults: {
                email,
                ls_name: lastName,
                fs_name: firstName,
                is_verified: 0,
                password: hashed_password,
                avatar: picture,
                nick_name: firstName,
                num_record: num_record,
                phone: email,
                uuid: uuid_user,
                verification_code: verif_code
            }
        })
            .then(([student, isNewStudent]) => {
                const { id: as_id_user, email, fs_name, ls_name, roles, uuid, is_verified } = student?.toJSON()
                if (isNewStudent) {
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
                            return Responder({ status: HttpStatusCode.Conflict, data: err })
                        })
                } else {
                    if (is_verified === 1) {
                        const _roles = this.formatRoles(roles as any)
                        return this.jwtService.signinPayloadAndEncrypt({
                            id_user: as_id_user as number,
                            roles_user: _roles,
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
                }
            })
            .catch(err => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }
}
