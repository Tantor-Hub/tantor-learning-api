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
  ApiConsumes,
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
  @UseInterceptors(
    FileInterceptor('piece_jointe', { limits: { fileSize: 10_000_000 } }),
  )
  @ApiOperation({
    summary: 'Submit contact form with optional file attachment',
    description: `
# Contact Form Submission

Submit a contact form message to the Tantor Learning support team with an optional file attachment (image, PDF, document, etc.).

## Features
- **Public Endpoint**: No authentication required
- **File Upload Support**: Attach images, PDFs, documents, or other files
- **Automatic Email Notification**: Contact form submissions are automatically sent to support team
- **Secure File Storage**: Files are uploaded to Cloudinary and stored securely

## Request Format
- **Content-Type**: multipart/form-data
- **Required Fields**: from_name, from_mail, subject, content
- **Optional Fields**: piece_jointe (file attachment)

## Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX
- **Images**: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- **Maximum File Size**: 10MB

## Example Usage

### With cURL:
\`\`\`bash
curl -X POST "http://localhost:3737/cms/contactus" \\
  -F "from_name=John Doe" \\
  -F "from_mail=john.doe@example.com" \\
  -F "subject=Course Enrollment Question" \\
  -F "content=I would like to know more about your course offerings." \\
  -F "piece_jointe=@/path/to/document.pdf"
\`\`\`

### With JavaScript/TypeScript:
\`\`\`javascript
const formData = new FormData();
formData.append('from_name', 'John Doe');
formData.append('from_mail', 'john.doe@example.com');
formData.append('subject', 'Course Enrollment Question');
formData.append('content', 'I would like to know more about your course offerings.');
formData.append('piece_jointe', fileInput.files[0]); // Optional file

const response = await fetch('http://localhost:3737/cms/contactus', {
  method: 'POST',
  body: formData
});

const result = await response.json();
\`\`\`
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Contact form data with optional file attachment',
    schema: {
      type: 'object',
      properties: {
        from_name: {
          type: 'string',
          description: 'Name of the person sending the contact form',
          example: 'John Doe',
        },
        from_mail: {
          type: 'string',
          format: 'email',
          description: 'Email address of the person sending the contact form',
          example: 'john.doe@example.com',
        },
        subject: {
          type: 'string',
          description: 'Subject of the contact form message',
          example: 'Question about course enrollment',
        },
        content: {
          type: 'string',
          description: 'Content/body of the contact form message',
          example: 'I would like to know more about your course offerings and how to enroll.',
        },
        piece_jointe: {
          type: 'string',
          format: 'binary',
          description:
            'Optional file attachment. Supported formats: PDF, DOC, DOCX, TXT, JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, PPT, PPTX, XLS, XLSX. Maximum size: 10MB.',
        },
      },
      required: ['from_name', 'from_mail', 'subject', 'content'],
    },
    examples: {
      withAttachment: {
        summary: 'Submit contact form with PDF attachment',
        description: 'Example of submitting a contact form with a PDF file attached',
        value: {
          from_name: 'John Doe',
          from_mail: 'john.doe@example.com',
          subject: 'Course Enrollment Question',
          content: 'I would like to know more about your course offerings and how to enroll.',
          piece_jointe: '[Binary file data - PDF document]',
        },
      },
      withoutAttachment: {
        summary: 'Submit contact form without attachment',
        description: 'Example of submitting a contact form without any file attachment',
        value: {
          from_name: 'Jane Smith',
          from_mail: 'jane.smith@example.com',
          subject: 'General Inquiry',
          content: 'I have a question about your training programs.',
        },
      },
      withImage: {
        summary: 'Submit contact form with image attachment',
        description: 'Example of submitting a contact form with an image file attached',
        value: {
          from_name: 'Robert Johnson',
          from_mail: 'robert.johnson@example.com',
          subject: 'Certificate Question',
          content: 'I would like to inquire about my certificate.',
          piece_jointe: '[Binary file data - JPEG/PNG image]',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contact form submitted successfully',
    schema: {
      example: {
        status: 201,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          from_name: 'John Doe',
          from_mail: 'john.doe@example.com',
          subject: 'Course Enrollment Question',
          content: 'I would like to know more about your course offerings and how to enroll.',
          piece_jointe: 'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or file type',
    schema: {
      examples: {
        invalidEmail: {
          summary: 'Invalid email format',
          value: {
            status: 400,
            data: 'from_mail must be an email',
          },
        },
        missingField: {
          summary: 'Missing required field',
          value: {
            status: 400,
            data: 'from_name should not be empty',
          },
        },
        invalidFileType: {
          summary: 'Invalid file type',
          value: {
            status: 400,
            data: 'File type application/zip is not allowed',
          },
        },
        fileTooLarge: {
          summary: 'File too large',
          value: {
            status: 400,
            data: 'File size exceeds 10MB limit',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
        data: 'Database connection error or file upload failure',
      },
    },
  })
  async onContactForm(
    @Body() form: CreateContactDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let piece_jointe: string | undefined = undefined;
    if (file) {
      const result = await this.googleDriveService.uploadBufferFile(file);
      if (result) {
        piece_jointe = result.link;
      }
    }
    return this.cmsService.onContactForm(form, piece_jointe);
  }
  @Post('newsletter')
  @ApiOperation({ summary: 'Subscribe to the newsletter' })
  @ApiBody({ type: CreateNewsLetterDto })
  @ApiResponse({ status: 201, description: 'Subscription successful' })
  @ApiResponse({ status: 409, description: 'Already subscribed' })
  async subscribeToNewsLetter(@Body() form: CreateNewsLetterDto) {
    console.log(
      '📧 [NEWSLETTER CONTROLLER] ===== SUBSCRIPTION REQUEST RECEIVED =====',
    );
    console.log(
      '📧 [NEWSLETTER CONTROLLER] Request body:',
      JSON.stringify(form, null, 2),
    );
    console.log('📧 [NEWSLETTER CONTROLLER] Calling service method...');

    try {
      const result = await this.cmsService.onSubscribeToNewsLetter(form);
      console.log(
        '📧 [NEWSLETTER CONTROLLER] Service response:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('❌ [NEWSLETTER CONTROLLER] Error in controller:', error);
      throw error;
    }
  }
  @Post('newsletter/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from the newsletter' })
  @ApiBody({ type: CreateNewsLetterDto })
  @ApiResponse({ status: 200, description: 'Unsubscription successful' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async unsubscribeFromNewsLetter(@Body() form: CreateNewsLetterDto) {
    console.log(
      '📧 [NEWSLETTER CONTROLLER] ===== UNSUBSCRIPTION REQUEST RECEIVED =====',
    );
    console.log(
      '📧 [NEWSLETTER CONTROLLER] Request body:',
      JSON.stringify(form, null, 2),
    );
    console.log('📧 [NEWSLETTER CONTROLLER] Calling service method...');

    try {
      const result = await this.cmsService.unsubscribeFromNewsLetter(form);
      console.log(
        '📧 [NEWSLETTER CONTROLLER] Service response:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('❌ [NEWSLETTER CONTROLLER] Error in controller:', error);
      throw error;
    }
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
