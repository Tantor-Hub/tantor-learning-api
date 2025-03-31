import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize'; 
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from 'src/models/model.roles';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Roles)
    private readonly rolesModel: typeof Roles,
  ) {}

  // Method to add a new role
  async addRole(createRoleDto: CreateRoleDto): Promise<Roles> {
    const { role, description } = createRoleDto;

    // Create and return the role
    return this.rolesModel.create({
      role,
      description,
    });
  }
}