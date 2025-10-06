import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { JwtAuthGuardAsStudent } from 'src/guard/guard.asstudent';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { CreateContactDto } from './dto/contact-form.dto';
import { CreateMessageDto } from './dto/send-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from '../services/service.googledrive';
import { JwtAuthGuardAsFormateur } from 'src/guard/guard.assecretaireandformateur';
import { CreateNewsLetterDto } from './dto/newsletter-sub.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(
    private readonly cmsService: CmsService,
    private readonly usersService: UsersService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  @Post('contactus')
  async onContactForm(@Body() form: CreateContactDto) {
    return this.cmsService.onContactForm(form);
  }
  @Post('newsletter')
  @ApiOperation({ summary: 'Subscribe to the newsletter' })
  @ApiBody({ type: CreateNewsLetterDto })
  @ApiResponse({ status: 201, description: 'Subscription successful' })
  @ApiResponse({ status: 409, description: 'Already subscribed' })
  async subscribeToNewsLetter(@Body() form: CreateNewsLetterDto) {
    return this.cmsService.onSubscribeToNewsLetter(form);
  }
  @Post('newsletter/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from the newsletter' })
  @ApiBody({ type: CreateNewsLetterDto })
  @ApiResponse({ status: 200, description: 'Unsubscription successful' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async unsubscribeFromNewsLetter(@Body() form: CreateNewsLetterDto) {
    return this.cmsService.unsubscribeFromNewsLetter(form);
  }
  @Get('newsletter/subscribers')
  @ApiOperation({ summary: 'Get list of active newsletter subscribers' })
  @ApiResponse({
    status: 200,
    description: 'List of subscribers',
    schema: {
      example: {
        status: 200,
        data: {
          length: 3,
          list: [
            {
              id: 1,
              user_email: 'user1@example.com',
              status: 1,
              createdAt: '2025-01-15T10:30:00.000Z',
              updatedAt: '2025-01-15T10:30:00.000Z',
            },
            {
              id: 2,
              user_email: 'user2@example.com',
              status: 1,
              createdAt: '2025-01-16T14:20:00.000Z',
              updatedAt: '2025-01-16T14:20:00.000Z',
            },
            {
              id: 3,
              user_email: 'user3@example.com',
              status: 1,
              createdAt: '2025-01-17T09:15:00.000Z',
              updatedAt: '2025-01-17T09:15:00.000Z',
            },
          ],
        },
      },
    },
  })
  async newsLetterList() {
    return this.cmsService.getSubsribersOnTheNewsLetter();
  }
  @Get('admin/newsletter/subscribers')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get list of active newsletter subscribers' })
  @ApiResponse({
    status: 200,
    description: 'List of subscribers',
    schema: {
      example: {
        status: 200,
        data: {
          length: 3,
          list: [
            {
              id: 1,
              user_email: 'user1@example.com',
              status: 1,
              createdAt: '2025-01-15T10:30:00.000Z',
              updatedAt: '2025-01-15T10:30:00.000Z',
            },
            {
              id: 2,
              user_email: 'user2@example.com',
              status: 1,
              createdAt: '2025-01-16T14:20:00.000Z',
              updatedAt: '2025-01-16T14:20:00.000Z',
            },
            {
              id: 3,
              user_email: 'user3@example.com',
              status: 1,
              createdAt: '2025-01-17T09:15:00.000Z',
              updatedAt: '2025-01-17T09:15:00.000Z',
            },
          ],
        },
      },
    },
  })
  async adminNewsLetterList() {
    return this.cmsService.getSubsribersOnTheNewsLetter();
  }
  @Get('messages/list')
  @UseGuards(JwtAuthGuard)
  async messagesListAll(@User() user: IJwtSignin) {
    return this.cmsService.getAllMessages(user);
  }
  @Get('messages/message/:idmessage')
  @UseGuards(JwtAuthGuard)
  async getOneMessage(
    @User() user: IJwtSignin,
    @Param('idmessage', ParseIntPipe) idmessage: number,
  ) {
    return this.cmsService.getMessageById(user, idmessage);
  }
  @Get('messages/thread/:thread')
  @UseGuards(JwtAuthGuard)
  async getOneMessageByThread(
    @User() user: IJwtSignin,
    @Param('thread') thread: string,
  ) {
    return this.cmsService.getMessageByThread(user, thread);
  }
  @Patch('messages/message/archive/:idmessage')
  @UseGuards(JwtAuthGuard)
  async onArchiveMessage(
    @User() user,
    @Param('idmessage', ParseIntPipe) idmessage: number,
  ) {
    return this.cmsService.archiveMessage(user, idmessage);
  }
  @Delete('messages/message/delete/:idmessage')
  @UseGuards(JwtAuthGuard)
  async onDeleteMessage(
    @User() user: IJwtSignin,
    @Param('idmessage', ParseIntPipe) idmessage: number,
  ) {
    return this.cmsService.deleteMessage(user, idmessage);
  }
  @Post('messages/message/send')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }),
  )
  async sendMessage(
    @User() user: IJwtSignin,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let avatar: any = null;
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        const { id, name, link } = result;
        avatar = link;
      }
    }
    return this.cmsService.sendMessage(user, {
      ...createMessageDto,
      piece_jointe: avatar,
    });
  }
  @Get('messages/list/:groupe')
  @UseGuards(JwtAuthGuard)
  async messagesListAllByGroupe(
    @User() user: IJwtSignin,
    @Param('groupe') group: string,
  ) {
    return this.cmsService.getAllMessagesByGroupe(user, group);
  }
  @Get('infos')
  async onGetAppInfos() {
    return this.cmsService.onGetAppInfos();
  }
  @Post('infos/add')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async onAddInfosData(@Body() createAppInfosDto: CreateAppInfosDto) {
    return this.cmsService.onAddAppInfos(createAppInfosDto);
  }
  @Get('dashboard/cards')
  @UseGuards(JwtAuthGuardAsStudent)
  async onLoadStudentDashboard(@User() user: IJwtSignin) {
    return this.usersService.loadStudentDashboard(user);
  }
  @Get('/dashboard/averages')
  @UseGuards(JwtAuthGuardAsStudent)
  async onLoadScores(@User() user: IJwtSignin) {
    return this.usersService.loadScores(user);
  }
  @Get('/dashboard/performances')
  @UseGuards(JwtAuthGuardAsStudent)
  async onLoadScoresPerformances(@User() user: IJwtSignin) {
    return this.usersService.loadPerformances(user); //
  }
}
