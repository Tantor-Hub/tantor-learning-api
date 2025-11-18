import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RepliesChatService } from './replieschat.service';
import { CreateRepliesChatDto } from './dto/create-replieschat.dto';
import { UpdateRepliesChatDto } from './dto/update-replieschat.dto';
import { DeleteRepliesChatDto } from './dto/delete-replieschat.dto';
import { JwtAuthGuard } from 'src/guard/guard.asglobal';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';
import { RepliesChatStatus } from 'src/models/model.replieschat';
import { User } from 'src/strategy/strategy.globaluser';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';

@ApiTags('RepliesChat')
@Controller('replieschat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RepliesChatController {
  constructor(private readonly repliesChatService: RepliesChatService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new reply to a chat or transfer chat message',
    description:
      "Create a new reply to either a regular chat message or a transfer chat message. The id_sender is automatically set from the authenticated user's JWT token. You must provide either id_chat (for regular chat) or id_transferechat (for transfer chat), but not both.",
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully. Can be for either a regular chat (id_chat) or transfer chat (id_transferechat).',
    schema: {
      example: {
        status: 201,
        message: 'Reply created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Thank you for your message. I will get back to you soon.',
          id_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_chat: '550e8400-e29b-41d4-a716-446655440002',
          id_transferechat: null,
          status: 'alive',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
        },
      },
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Reply created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            id_sender: { type: 'string', format: 'uuid' },
            id_chat: { type: 'string', format: 'uuid', nullable: true, description: 'UUID of the chat (if reply is for regular chat)' },
            id_transferechat: { type: 'string', format: 'uuid', nullable: true, description: 'UUID of the transfer chat (if reply is for transfer chat)' },
            status: { type: 'string', enum: ['alive', 'archive', 'deleted'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, missing required fields, or user/chat/transfer chat not found. Possible errors: "Either id_chat or id_transferechat must be provided", "Sender user not found", "Chat message not found", or "Transfer chat not found".',
    schema: {
      example: {
        status: 400,
        message: 'Either id_chat or id_transferechat must be provided',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while creating reply',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  create(
    @Body() createRepliesChatDto: CreateRepliesChatDto,
    @User() user: IJwtSignin,
  ) {
    const replyData = {
      ...createRepliesChatDto,
      id_sender: user.id_user,
    };
    return this.repliesChatService.create(replyData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all replies' })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Replies retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              content:
                'Thank you for your message. I will get back to you soon.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_chat: '550e8400-e29b-41d4-a716-446655440002',
              id_transferechat: null,
              status: 'alive',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              chat: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                subject: 'Meeting Discussion',
                content: "Hello everyone, let's discuss the project updates.",
                id_user_sender: '550e8400-e29b-41d4-a716-446655440003',
                id_user_receiver: ['550e8400-e29b-41d4-a716-446655440001'],
              },
              transferChat: null,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440005',
              content: 'I have received the transferred message.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_chat: null,
              id_transferechat: '550e8400-e29b-41d4-a716-446655440006',
              status: 'alive',
              createdAt: '2025-01-25T11:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
              chat: null,
              transferChat: {
                id: '550e8400-e29b-41d4-a716-446655440006',
                id_chat: '550e8400-e29b-41d4-a716-446655440002',
                sender: '550e8400-e29b-41d4-a716-446655440003',
                receivers: ['550e8400-e29b-41d4-a716-446655440001'],
              },
            },
          ],
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
        data: {
          message: 'Internal server error while retrieving replies',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findAll() {
    return this.repliesChatService.findAll();
  }

  @Get('chat/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all replies for a specific chat message' })
  @ApiParam({ name: 'chatId', description: 'Chat message UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat replies retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat replies retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              content:
                'Thank you for your message. I will get back to you soon.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_chat: '550e8400-e29b-41d4-a716-446655440002',
              status: 'alive',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat message not found',
    schema: {
      example: {
        status: 404,
        message: 'Chat message not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving chat replies',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findByChat(@Param('chatId', ParseUUIDPipe) chatId: string) {
    return this.repliesChatService.findByChat(chatId);
  }

  @Get('transfer/:transferChatId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all replies for a specific transfer chat',
    description:
      'Get all replies for a transfer chat. If the authenticated user is the creator of the transfer chat, all replies (public and private) are returned. If the user is among the receivers, only public replies are returned.',
  })
  @ApiParam({
    name: 'transferChatId',
    description: 'Transfer chat UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description:
      'Transfer chat replies retrieved successfully. If user is the creator, all replies are returned. If user is a receiver, only public replies are returned.',
    schema: {
      example: {
        status: 200,
        message: 'Transfer chat replies retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              content:
                'Thank you for your message. I will get back to you soon.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_chat: null,
              id_transferechat: '550e8400-e29b-41d4-a716-446655440002',
              status: 'alive',
              is_public: true,
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440003',
              content: 'This is a private reply.',
              id_sender: '550e8400-e29b-41d4-a716-446655440004',
              id_chat: null,
              id_transferechat: '550e8400-e29b-41d4-a716-446655440002',
              status: 'alive',
              is_public: false,
              createdAt: '2025-01-25T11:00:00.000Z',
              updatedAt: '2025-01-25T11:00:00.000Z',
              sender: {
                id: '550e8400-e29b-41d4-a716-446655440004',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You do not have access to replies for this transfer chat (user is neither the creator nor a receiver)',
    schema: {
      example: {
        status: 403,
        message:
          'You do not have access to replies for this transfer chat',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transfer chat not found',
    schema: {
      example: {
        status: 404,
        message: 'Transfer chat not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message:
            'Internal server error while retrieving transfer chat replies',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findByTransferChat(
    @Param('transferChatId', ParseUUIDPipe) transferChatId: string,
    @User() user: IJwtSignin,
  ) {
    return this.repliesChatService.findByTransferChat(
      transferChatId,
      user.id_user,
    );
  }

  @Get('sender/:senderId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all replies from a specific sender' })
  @ApiParam({ name: 'senderId', description: 'Sender user UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Sender replies retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Sender replies retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              content:
                'Thank you for your message. I will get back to you soon.',
              id_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_chat: '550e8400-e29b-41d4-a716-446655440002',
              id_transferechat: null,
              status: 'alive',
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              chat: {
                id: '550e8400-e29b-41d4-a716-446655440002',
                subject: 'Meeting Discussion',
                content: "Hello everyone, let's discuss the project updates.",
                id_user_sender: '550e8400-e29b-41d4-a716-446655440003',
                id_user_receiver: ['550e8400-e29b-41d4-a716-446655440001'],
              },
              transferChat: null,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sender user not found',
    schema: {
      example: {
        status: 404,
        message: 'Sender user not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving sender replies',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findBySender(@Param('senderId', ParseUUIDPipe) senderId: string) {
    return this.repliesChatService.findBySender(senderId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a reply by ID' })
  @ApiParam({ name: 'id', description: 'Reply UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Reply retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Reply retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Thank you for your message. I will get back to you soon.',
          id_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_chat: '550e8400-e29b-41d4-a716-446655440002',
          id_transferechat: null,
          status: 'alive',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          sender: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
            uuid: '550e8400-e29b-41d4-a716-446655440001',
          },
          chat: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            subject: 'Meeting Discussion',
            content: "Hello everyone, let's discuss the project updates.",
            id_user_sender: '550e8400-e29b-41d4-a716-446655440003',
            id_user_receiver: ['550e8400-e29b-41d4-a716-446655440001'],
          },
          transferChat: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reply not found',
    schema: {
      example: {
        status: 404,
        message: 'Reply not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while retrieving reply',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.repliesChatService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a reply' })
  @ApiResponse({
    status: 200,
    description: 'Reply updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Reply updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Updated reply content.',
          id_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_chat: '550e8400-e29b-41d4-a716-446655440002',
          id_transferechat: null,
          status: 'alive',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T11:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reply not found',
    schema: {
      example: {
        status: 404,
        message: 'Reply not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while updating reply',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  update(@Body() updateRepliesChatDto: UpdateRepliesChatDto) {
    return this.repliesChatService.update(updateRepliesChatDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a reply (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Reply deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Reply deleted successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reply not found',
    schema: {
      example: {
        status: 404,
        message: 'Reply not found',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        status: 500,
        data: {
          message: 'Internal server error while deleting reply',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  remove(@Body() deleteRepliesChatDto: DeleteRepliesChatDto) {
    return this.repliesChatService.remove(deleteRepliesChatDto);
  }
}
