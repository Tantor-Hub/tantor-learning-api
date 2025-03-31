import { Controller, Post, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto'; 

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('role/add')
  async addRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.addRole(createRoleDto);
  }
}