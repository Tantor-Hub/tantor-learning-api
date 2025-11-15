import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from 'src/models/model.book';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Op } from 'sequelize';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
  ) {}

  async create(
    createDto: CreateBookDto,
    userId: string,
  ): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.create({
        title: createDto.title,
        description: createDto.description,
        session: createDto.session || [],
        author: createDto.author,
        createby: userId,
        status: createDto.status,
        category: createDto.category || [],
        icon: createDto.icon,
        piece_joint: createDto.piece_joint,
        views: 0,
        download: 0,
        public: createDto.public !== undefined ? createDto.public : false,
      } as any);

      return Responder({
        status: HttpStatusCode.Created,
        data: book.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la création du livre',
          details: error.message,
        },
      });
    }
  }

  async findAll(): Promise<ResponseServer> {
    try {
      const books = await this.bookModel.findAll({
        order: [['createdAt', 'DESC']],
        include: ['creator'],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: books.map((book) => book.toJSON()),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération des livres',
          details: error.message,
        },
      });
    }
  }

  async findOne(id: string): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.findByPk(id, {
        include: ['creator'],
      });

      if (!book) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Livre non trouvé',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: book.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la récupération du livre',
          details: error.message,
        },
      });
    }
  }

  async update(
    id: string,
    updateDto: UpdateBookDto,
  ): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.findByPk(id);

      if (!book) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Livre non trouvé',
        });
      }

      await book.update({
        title: updateDto.title !== undefined ? updateDto.title : book.title,
        description:
          updateDto.description !== undefined
            ? updateDto.description
            : book.description,
        session:
          updateDto.session !== undefined ? updateDto.session : book.session,
        author: updateDto.author !== undefined ? updateDto.author : book.author,
        status:
          updateDto.status !== undefined ? updateDto.status : book.status,
        category:
          updateDto.category !== undefined ? updateDto.category : book.category,
        icon: updateDto.icon !== undefined ? updateDto.icon : book.icon,
        piece_joint:
          updateDto.piece_joint !== undefined
            ? updateDto.piece_joint
            : book.piece_joint,
        public:
          updateDto.public !== undefined ? updateDto.public : book.public,
      });

      await book.reload();

      return Responder({
        status: HttpStatusCode.Ok,
        data: book.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la mise à jour du livre',
          details: error.message,
        },
      });
    }
  }

  async remove(id: string): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.findByPk(id);

      if (!book) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Livre non trouvé',
        });
      }

      await book.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          message: 'Livre supprimé avec succès',
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de la suppression du livre',
          details: error.message,
        },
      });
    }
  }

  async incrementViews(id: string): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.findByPk(id);

      if (!book) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Livre non trouvé',
        });
      }

      await book.increment('views');

      await book.reload();

      return Responder({
        status: HttpStatusCode.Ok,
        data: book.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de l\'incrémentation des vues',
          details: error.message,
        },
      });
    }
  }

  async incrementDownload(id: string): Promise<ResponseServer> {
    try {
      const book = await this.bookModel.findByPk(id);

      if (!book) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Livre non trouvé',
        });
      }

      await book.increment('download');

      await book.reload();

      return Responder({
        status: HttpStatusCode.Ok,
        data: book.toJSON(),
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          error: 'Erreur lors de l\'incrémentation des téléchargements',
          details: error.message,
        },
      });
    }
  }
}

