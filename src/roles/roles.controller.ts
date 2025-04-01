import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto'; 
import { AttributeRoleDto } from './dto/attribute-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('role/add')
  async addRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.addRole(createRoleDto);
  }

  @Put('role/attribute')
  async attributeRole(@Body() attributeToUser: AttributeRoleDto){
    return this.attributeRole(attributeToUser)
  }

  @Get('list')
  async getRoles(){
    return this.rolesService.getRoles()
  }
}