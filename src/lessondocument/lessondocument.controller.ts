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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LessondocumentService } from './lessondocument.service';
import { CreateLessondocumentDto } from './dto/create-lessondocument.dto';
import { UpdateLessondocumentDto } from './dto/update-lessondocument.dto';
import { JwtAuthGuard } from 'src/guard/guard.jwt';

@ApiTags('lessondocument')
@ApiBearerAuth()
@Controller('document')
@UseGuards(JwtAuthGuard)
export class LessondocumentController {
  constructor(private readonly lessondocumentService: LessondocumentService) {}

  @Post()
  create(@Body() createLessondocumentDto: CreateLessondocumentDto) {
    return this.lessondocumentService.create(createLessondocumentDto);
  }

  @Get()
  findAll() {
    return this.lessondocumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessondocumentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessondocumentDto: UpdateLessondocumentDto,
  ) {
    return this.lessondocumentService.update(+id, updateLessondocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessondocumentService.remove(+id);
  }
}
