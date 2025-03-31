import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from 'src/models/model.roles';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Roles)
        private readonly rolesModel: typeof Roles,
    ) { }

    async addRole(createRoleDto: CreateRoleDto): Promise<Roles> {
        const { role, description } = createRoleDto;

        return this.rolesModel.create({
            role,
            description,
            status: 1
        });
    }

    // async getRoles(): Promise<Roles> {
    //     return this.rolesModel.findAll({
    //         where: {
    //             status: 1
    //         }
    //     })
    // }
}