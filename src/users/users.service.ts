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

    async onWelcomeNewStudent({ to, otp, nom, postnom }): Promise<void> {

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
    }

    async getAllUsers(): Promise<ResponseServer> {
        return this.userModel.findAll({
            where: {
                // status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async signInAsStudent(signInStudentDto: SignInStudentDto): Promise<ResponseServer> {
        return this.mailService.sendMail({
            content: this.mailService.templates({ as: 'welcome', nom: "David", postnom: "Maene" }),
            to: "davidmened@gmail.com",
            subject: "Greetings"
        })
            .then(({ code, data, message }) => {
                log(data)
                return Responder({ status: 200, data: signInStudentDto })
            })
            .catch(err => Responder({ status: 500, data: err }))
    }

    async registerAsStudent(createUserDto: CreateUserDto): Promise<ResponseServer> {
        const { email, fs_name, ls_name, password, id, nick_name, phone, uuid, verification_code } = createUserDto
        const existingUser = await this.userModel.findOne({ where: { email } });
        if (existingUser) {
            return Responder({ status: HttpStatusCode.Conflict, data: null })
        }

        const verif_code = this.allService.randomLongNumber({ length: 6 })
        const hashed_password = await this.cryptoService.hashPassword(password)
        const uuid_user = this.allService.generateUuid()

        return this.userModel.create({
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
                        id_role: 2, // this Means Student Or Stageaire
                        id_user: as_id_user as number,
                        status: 1
                    })
                        .then(hasrole => {
                            if (hasrole instanceof HasRoles) {
                                this.onWelcomeNewStudent({ to: email, otp: verif_code, nom: fs_name, postnom: ls_name })
                                return Responder({ status: HttpStatusCode.Created, data: `A vérification code was sent to the user ::: [${email}]` })
                            } else {
                                return Responder({ status: HttpStatusCode.BadRequest })
                            }
                        })
                        .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                } else return Responder({ status: HttpStatusCode.BadRequest, data: {} })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async findByEmail(email: string, mailService?: MailService, allService?: AllSercices, cryptoService?: CryptoService, jwtService?: JwtService): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: {} })
    }
}
