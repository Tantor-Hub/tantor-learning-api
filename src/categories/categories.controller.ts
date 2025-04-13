import { Body, Controller, Post } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {

    @Post("categories/category/add")
    async addCategory(@Body() createCategoryDto: CreateCategoryDto) {

    }
}
