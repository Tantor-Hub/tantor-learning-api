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
// import { JwtService } from '@nestjs/jwt';

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
        private readonly cryptoService: CryptoService

    ) { }

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
        return Responder({ status: 200, data: signInStudentDto })
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

        return this.jwtService.signinPayloadAndEncrypt({
            id_user: 1,
            roles_user: [2, 3, 1],
            uuid_user: uuid_user,
            level_indicator: 1
        })
            .then(async ({ code, data, message }) => {
                return Responder({ status: HttpStatusCode.Ok, data })
                // return this.userModel.create({
                //     email,
                //     fs_name,
                //     ls_name,
                //     password,
                //     nick_name,
                //     phone: email,
                //     uuid: 'uuid',
                //     verification_code: '',
                //     is_verified: 0,
                //     status: 1
                // })
                //     .then(strudent => {
                //         if (strudent instanceof Users) return Responder({ status: HttpStatusCode.Created, data: {} })
                //         else return Responder({ status: 400, data: {} })
                //     })
                //     .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err, }))
            })
            .catch(err => {
                return Responder({ status: 500, data: err })
            })
    }

    async findByEmail(email: string, mailService?: MailService, allService?: AllSercices, cryptoService?: CryptoService, jwtService?: JwtService): Promise<ResponseServer> {
        return Responder({ status: HttpStatusCode.Ok, data: {} })
    }
}
