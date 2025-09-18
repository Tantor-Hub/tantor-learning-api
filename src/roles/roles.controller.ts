import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AttributeRoleDto } from './dto/attribute-role.dto';
import { MailService } from 'src/services/service.mail';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private mailService: MailService,
  ) {}

  @Put('role/attribute')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiResponse({
    status: 200,
    description: 'Role attributed successfully',
    schema: {
      type: 'object',
      properties: {
        statuscode: { type: 'integer', example: 200 },
        status: { type: 'string', example: 'Success' },
        data: { type: 'object' },
      },
    },
  })
  async attributeRole(@Body() attributeToUserDto: AttributeRoleDto) {
    return this.rolesService.attributeRole(attributeToUserDto);
  }

  @Post('role/add')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiResponse({
    status: 201,
    description: 'Role added successfully',
    schema: {
      type: 'object',
      properties: {
        statuscode: { type: 'integer', example: 201 },
        status: { type: 'string', example: 'Success' },
        data: { type: 'object' },
      },
    },
  })
  async addRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.addRole(createRoleDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuardAsFormateur)
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statuscode: { type: 'integer', example: 200 },
        status: { type: 'string', example: 'Success' },
        data: { type: 'array' },
      },
    },
  })
  async getRoles() {
    return this.rolesService.getRoles();
  }
}
