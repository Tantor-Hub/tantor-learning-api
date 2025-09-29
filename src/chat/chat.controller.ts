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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { DeleteChatDto } from './dto/delete-chat.dto';
import { JwtAuthGuard } from 'src/guard/guard.jwt';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';
import { JwtAuthGuardAsSuperviseur } from 'src/guard/guard.assuperviseur';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiResponse({
    status: 201,
    description: 'Chat message created successfully',
    schema: {
      example: {
        status: 201,
        message: 'Chat message created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'],
          subject: 'Meeting Discussion',
          content: 'Hello everyone, let\'s discuss the project updates.',
          reader: [],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or users not found',
    schema: {
      example: {
        status: 400,
        message: 'One or more receiver users not found',
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
          message: 'Internal server error while creating chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get()
  @UseGuards(JwtAuthGuardAsSuperviseur)
  @ApiOperation({ summary: 'Get all chat messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat messages retrieved successfully',
        data: {
          length: 2,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
              subject: 'Meeting Discussion',
              content: 'Hello everyone, let\'s discuss the project updates.',
              reader: ['550e8400-e29b-41d4-a716-446655440002'],
              status: 'alive',
              dontshowme: [],
              piece_joint: ['/uploads/file1.pdf'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
                uuid: '550e8400-e29b-41d4-a716-446655440001',
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
          message: 'Internal server error while retrieving chat messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findAll() {
    return this.chatService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get chat messages for a specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'User chat messages retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'User chat messages retrieved successfully',
        data: {
          length: 1,
          rows: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
              id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
              subject: 'Meeting Discussion',
              content: 'Hello everyone, let\'s discuss the project updates.',
              reader: ['550e8400-e29b-41d4-a716-446655440002'],
              status: 'alive',
              dontshowme: [],
              piece_joint: ['/uploads/file1.pdf'],
              createdAt: '2025-01-25T10:00:00.000Z',
              updatedAt: '2025-01-25T10:00:00.000Z',
              sender: {
                id: 1,
                fs_name: 'John',
                ls_name: 'Doe',
                email: 'john.doe@example.com',
                uuid: '550e8400-e29b-41d4-a716-446655440001',
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
          message: 'Internal server error while retrieving user chat messages',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.chatService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Get a chat message by ID' })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message retrieved successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
          subject: 'Meeting Discussion',
          content: 'Hello everyone, let\'s discuss the project updates.',
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T10:00:00.000Z',
          sender: {
            id: 1,
            fs_name: 'John',
            ls_name: 'Doe',
            email: 'john.doe@example.com',
            uuid: '550e8400-e29b-41d4-a716-446655440001',
          },
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
          message: 'Internal server error while retrieving chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Update a chat message' })
  @ApiResponse({
    status: 200,
    description: 'Chat message updated successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          id_user_sender: '550e8400-e29b-41d4-a716-446655440001',
          id_user_receiver: ['550e8400-e29b-41d4-a716-446655440002'],
          subject: 'Updated Meeting Discussion',
          content: 'Updated content for the discussion.',
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          status: 'alive',
          dontshowme: [],
          piece_joint: ['/uploads/file1.pdf'],
          createdAt: '2025-01-25T10:00:00.000Z',
          updatedAt: '2025-01-25T11:00:00.000Z',
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
          message: 'Internal server error while updating chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  update(@Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto);
  }

  @Patch(':id/read/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Mark a chat message as read by a user' })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiParam({ name: 'userId', description: 'User UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message marked as read',
    schema: {
      example: {
        status: 200,
        message: 'Chat message marked as read',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          reader: ['550e8400-e29b-41d4-a716-446655440002'],
          updatedAt: '2025-01-25T11:00:00.000Z',
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
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.chatService.markAsRead(id, userId);
  }

  @Patch(':id/hide/:userId')
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Hide a chat message for a user' })
  @ApiParam({ name: 'id', description: 'Chat message UUID', type: String })
  @ApiParam({ name: 'userId', description: 'User UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Chat message hidden successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message hidden successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          dontshowme: ['550e8400-e29b-41d4-a716-446655440002'],
          updatedAt: '2025-01-25T11:00:00.000Z',
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
  hideMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.chatService.hideMessage(id, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuardAsSecretary)
  @ApiOperation({ summary: 'Delete a chat message (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Chat message deleted successfully',
    schema: {
      example: {
        status: 200,
        message: 'Chat message deleted successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
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
          message: 'Internal server error while deleting chat message',
          errorType: 'SequelizeDatabaseError',
          errorMessage: 'Error message',
          timestamp: '2025-01-25T10:00:00.000Z',
        },
      },
    },
  })
  remove(@Body() deleteChatDto: DeleteChatDto) {
    return this.chatService.remove(deleteChatDto);
  }
}
