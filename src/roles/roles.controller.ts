import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AttributeRoleDto } from './dto/attribute-role.dto';
import { MailService } from 'src/services/service.mail';
import { log } from 'console';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService, private mailService: MailService) { }

  @Put('role/attribute')
  // @UseGuards(JwtAuthGuardAsManagerSystem)
  async attributeRole(@Body() attributeToUserDto: AttributeRoleDto) {
    return this.rolesService.attributeRole(attributeToUserDto);
  }

  @Post('role/add')
  async addRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.addRole(createRoleDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async getRoles() {
    
    // this.mailService.sendMail({
    //   to: 'davidmened@gmail.com',
    //   content: "Bonjour papa David Test SMTP",
    //   subject: "Greetings"
    // })
    // .then(mail => {
    //   log(mail)
    // })
    // .catch(err => {
    //   log(err)
    // })
    return this.rolesService.getRoles()
  }
}