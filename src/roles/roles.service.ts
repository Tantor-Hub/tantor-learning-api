import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from 'src/models/model.roles';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { HasRoles } from 'src/models/model.userhasroles';
import { AttributeRoleDto } from './dto/attribute-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Roles)
        private readonly rolesModel: typeof Roles,

        @InjectModel(HasRoles)
        private readonly hasRoleModel: typeof HasRoles
    ) { }

    async addRole(createRoleDto: CreateRoleDto): Promise<ResponseServer> {
        const { role, description } = createRoleDto;
        return this.rolesModel.create({
            role,
            description,
            status: 1
        }, {
            raw: true
        })
            .then(role => {
                return Responder({ status: HttpStatusCode.Created, data: role })
            })
            .catch(err => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: err });
            })
    }

    async getRoles(): Promise<ResponseServer> {
        return this.rolesModel.findAll({
            where: {
                status: 1
            }
        })
            .then(list => {
                return Responder({ status: HttpStatusCode.Ok, data: { length: list.length, rows: list } })
            })
            .catch(err => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async attributeRole(createRoleDto: AttributeRoleDto): Promise<ResponseServer> {
        const { id_role, id_user, description } = createRoleDto
        return this.hasRoleModel.findOrCreate({
            where: {
                id_role,
                id_user,
            },
            defaults: {
                id_role,
                id_user,
                status: 1
            }
        })
            .then(([record, isNewRecord]) => {
                return Responder({ status: HttpStatusCode.InternalServerError, data: record })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}