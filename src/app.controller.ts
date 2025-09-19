import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuardAsManagerSystem } from './guard/guard.asadmin';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuardAsManagerSystem)
  getFallBackEndPoint(): any {
    return this.appService.getFallBackEndPoint();
  }
}
