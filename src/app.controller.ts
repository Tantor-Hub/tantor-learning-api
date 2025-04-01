import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './services/service.mail';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getFallBackEndPoint(): any {
    return this.appService.getFallBackEndPoint();
  }
}
