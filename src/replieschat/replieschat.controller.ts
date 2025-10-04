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
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({
    summary: 'Create a new reply to a chat message',
    description:
      "Create a new reply to a chat message. The id_sender is automatically set from the authenticated user's JWT token.",
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Reply created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Thank you for your message. I will get back to you soon.',
          id_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_chat: '550e8400-e29b-41d4-a716-446655440002',
          status: 'alive',
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or user/chat not found',
    schema: {
      example: {
        status: 400,
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
  @UseGuards(JwtAuthGuardAsSuperviseur)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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

  @Get('sender/:senderId')
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
  @UseGuards(JwtAuthGuardAsSecretary)
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
