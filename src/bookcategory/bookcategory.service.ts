import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BookCategory } from 'src/models/model.bookcategory';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { CreateBookCategoryDto } from './dto/create-bookcategory.dto';
import { UpdateBookCategoryDto } from './dto/update-bookcategory.dto';

@Injectable()
export class BookCategoryService {
  constructor(
    @InjectModel(BookCategory)
    private readonly bookCategoryModel: typeof BookCategory,
  ) {}

  async create(
    createDto: CreateBookCategoryDto,
  ): Promise<ResponseServer> {
    try {
      // Check if category with same title already exists
      const existing = await this.bookCategoryModel.findOne({
        where: { title: createDto.title },
      });

      if (existing) {
        return Responder({
          status: HttpStatusCode.Conflict,
          data: 'Une catégorie avec ce titre existe déjà',
        });
      }

      const bookCategory = await this.bookCategoryModel.create({
        title: createDto.title,
      } as any);

      return Responder({
        status: HttpStatusCode.Created,
        data: bookCategory.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la création de la catégorie de livre',
          details: error.message,
        },
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const categories = await this.bookCategoryModel.findAll({
        order: [['title', 'ASC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: categories.map((category) => category.toJSON()),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération des catégories de livre',
          details: error.message,
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const category = await this.bookCategoryModel.findByPk(id);

      if (!category) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Catégorie de livre non trouvée',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: category.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération de la catégorie de livre',
          details: error.message,
        },
      });
    }
  }

  async update(
    id: string,
    updateDto: UpdateBookCategoryDto,
  ): Promise<ResponseServer> {
    try {
      const category = await this.bookCategoryModel.findByPk(id);

      if (!category) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Catégorie de livre non trouvée',
        });
      }

      // Check if another category with the same title exists (excluding current one)
      if (updateDto.title && updateDto.title !== category.title) {
        const existing = await this.bookCategoryModel.findOne({
          where: { title: updateDto.title },
        });

        if (existing) {
          return Responder({
            status: HttpStatusCode.Conflict,
            data: 'Une catégorie avec ce titre existe déjà',
          });
        }
      }

      await category.update({
        title: updateDto.title !== undefined ? updateDto.title : category.title,
      });

      await category.reload();

      return Responder({
        status: HttpStatusCode.Ok,
        data: category.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la mise à jour de la catégorie de livre',
          details: error.message,
        },
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const category = await this.bookCategoryModel.findByPk(id);

      if (!category) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Catégorie de livre non trouvée',
        });
      }

      await category.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          message: 'Catégorie de livre supprimée avec succès',
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la suppression de la catégorie de livre',
          details: error.message,
        },
      });
    }
  }
}

