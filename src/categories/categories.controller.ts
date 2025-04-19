import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { JwtAuthGuardAsManagerSystem } from 'src/guard/guard.asadmin';
import { CreateThematicFormationDto } from './dto/create-thematic.dto';
import { log } from 'console';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post("category/add")
    @UseGuards(JwtAuthGuardAsManagerSystem)
    async addCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.createCategory(createCategoryDto)
    }

    @Post("thematic/add")
    async addNewThematicFormation(@Body() createThematicFormationDto: CreateThematicFormationDto) {
        return this.categoriesService.createThematic(createThematicFormationDto)
    }
}
