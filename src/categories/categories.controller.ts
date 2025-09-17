import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { CreateThematicFormationDto } from './dto/create-thematic.dto';
import { log } from 'console';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateThematicFormationDto } from './dto/update-thematic.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('category/add')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async addCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Put('category/:idCategory')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('idCategory') idCategory: number,
  ) {
    return this.categoriesService.updateCategorieFormations(
      idCategory,
      updateCategoryDto,
    );
  }

  @Put('thematic/:idCategory')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async updateThematic(
    @Body() updateCategoryDto: UpdateThematicFormationDto,
    @Param('idCategory') idCategory: number,
  ) {
    return this.categoriesService.updateThematicFormations(
      idCategory,
      updateCategoryDto,
    );
  }

  @Post('thematic/add')
  @UseGuards(JwtAuthGuardAsManagerSystem)
  async addNewThematicFormation(
    @Body() createThematicFormationDto: CreateThematicFormationDto,
  ) {
    return this.categoriesService.createThematic(createThematicFormationDto);
  }

  @Get('thematics')
  async getThematicsFormations() {
    return this.categoriesService.getThematicsFormations();
  }

  @Get('list')
  async getCategoriesFormations() {
    return this.categoriesService.getCategoriesFormations();
  }
}
