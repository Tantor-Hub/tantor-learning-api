import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AttributeRoleDto } from './dto/attribute-role.dto';
import { MailService } from 'src/services/service.mail';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService, private mailService: MailService) { }

  @Put('role/attribute')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async attributeRole(@Body() attributeToUserDto: AttributeRoleDto) {
    return this.rolesService.attributeRole(attributeToUserDto);
  }

  @Post('role/add')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async addRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.addRole(createRoleDto);
  }

  @Get('list')
  // @UseGuards(JwtAuthGuardAsFormateur);
  async getRoles() {
    return this.rolesService.getRoles()
  }
}