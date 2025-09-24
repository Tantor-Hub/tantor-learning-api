import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessiondocumentService } from './sessiondocument.service';
import { CreateSessiondocumentDto } from './dto/create-sessiondocument.dto';
import { UpdateSessiondocumentDto } from './dto/update-sessiondocument.dto';
import { DeleteSessiondocumentDto } from './dto/delete-sessiondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.jwt';
import { JwtAuthGuardAsSecretary } from 'src/guard/guard.assecretary';

@ApiTags('sessiondocument')
@ApiBearerAuth()
@Controller('sessiondocument')
@UseGuards(JwtAuthGuard, JwtAuthGuardAsSecretary)
export class SessiondocumentController {
  constructor(
    private readonly sessiondocumentService: SessiondocumentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session document' })
  create(@Body() createSessiondocumentDto: CreateSessiondocumentDto) {
    return this.sessiondocumentService.create(createSessiondocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all session documents' })
  findAll() {
    return this.sessiondocumentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session document by ID' })
  findOne(@Param('id') id: string) {
    return this.sessiondocumentService.findOne(+id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a session document by ID from body' })
  update(@Body() updateSessiondocumentDto: UpdateSessiondocumentDto) {
    return this.sessiondocumentService.update(
      updateSessiondocumentDto.id,
      updateSessiondocumentDto,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a session document by ID from body' })
  remove(@Body() deleteSessiondocumentDto: DeleteSessiondocumentDto) {
    return this.sessiondocumentService.remove(deleteSessiondocumentDto.id);
  }
}
