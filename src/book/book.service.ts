import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book, BookStatus } from 'src/models/model.book';
import { ResponseServer } from 'src/interface/interface.response';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Op } from 'sequelize';
import { UserInSession } from 'src/models/model.userinsession';
import { UserInSessionStatus } from 'src/enums/user-in-session-status.enum';
import { TrainingSession } from 'src/models/model.trainingssession';
import { FindBookQueryDto } from './dto/find-book.query.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
    @InjectModel(UserInSession)
    private readonly userInSessionModel: typeof UserInSession,
    @InjectModel(TrainingSession)
    private readonly trainingSessionModel: typeof TrainingSession,
  ) {}

  async create(
    createDto: CreateBookDto & { icon: string; piece_joint: string },
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
        downloadable:
          createDto.downloadable !== undefined ? createDto.downloadable : false,
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

  async findAll(query: FindBookQueryDto): Promise<ResponseServer> {
    try {
      const {
        session: sessionFilter,
        category: categoryFilter,
        author,
        minViews,
        minDownload,
        page = 1,
        limit = 10,
      } = query || {};

      const books = await this.bookModel.findAll({
        where: { public: true },
        order: [['createdAt', 'DESC']],
        include: ['creator'],
      });

      if (!books.length) {
        return Responder({
          status: HttpStatusCode.Ok,
          data: [],
          customMessage:
            'Aucun livre public avec session en cours pour le moment.',
        });
      }

      const allSessionIds = Array.from(
        new Set(
          books
            .flatMap((book) =>
              Array.isArray(book.session) ? book.session : [],
            )
            .filter((sessionId): sessionId is string => !!sessionId),
        ),
      );

      const sessions = allSessionIds.length
        ? await this.trainingSessionModel.findAll({
            where: {
              id: {
                [Op.in]: allSessionIds,
              },
            },
          })
        : [];

      const sessionMap = new Map<string, TrainingSession>(
        sessions.map((session) => [session.id, session]),
      );

      const now = new Date();

      type SerializedBook = Record<string, any>;

      const serializedBooks = books.map((book) => {
        const relatedSessions = (
          Array.isArray(book.session) ? book.session : []
        )
          .map((sessionId) => sessionMap.get(sessionId))
          .filter(
            (session): session is TrainingSession => session !== undefined,
          );

        const activeSessions = relatedSessions.filter((session) => {
          const beginingDate = new Date(session.begining_date);
          const endingDate = new Date(session.ending_date);
          return beginingDate <= now && now <= endingDate;
        });

        if (!activeSessions.length) {
          return null;
        }

        const bookJson = book.toJSON();

        return {
          ...bookJson,
          sessions: activeSessions.map((session) => session.toJSON()),
        };
      });

      let filteredBooks = serializedBooks.filter(Boolean) as SerializedBook[];

      if (sessionFilter?.length) {
        filteredBooks = filteredBooks.filter((book) => {
          if (!Array.isArray(book.session) || !book.session.length) {
            return false;
          }

          return sessionFilter.every((sessionId) =>
            book.session?.includes(sessionId),
          );
        });
      }

      if (categoryFilter?.length) {
        filteredBooks = filteredBooks.filter((book) =>
          Array.isArray(book.category)
            ? book.category.some((categoryId) =>
                categoryFilter.includes(categoryId),
              )
            : false,
        );
      }

      if (author) {
        const normalizedAuthor = author.trim().toLowerCase();
        filteredBooks = filteredBooks.filter((book) =>
          (book.author || '').toLowerCase().includes(normalizedAuthor),
        );
      }

      if (minViews !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => (book.views ?? 0) >= minViews,
        );
      }

      if (minDownload !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => (book.download ?? 0) >= minDownload,
        );
      }

      const total = filteredBooks.length;
      const safeLimit = limit > 0 ? limit : 10;
      const safePage = page > 0 ? page : 1;
      const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
      const currentPage = Math.min(safePage, totalPages);
      const startIndex = (currentPage - 1) * safeLimit;

      const paginatedBooks = filteredBooks.slice(
        startIndex,
        startIndex + safeLimit,
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          items: paginatedBooks,
          pagination: {
            total,
            page: currentPage,
            limit: safeLimit,
            totalPages,
          },
        },
        customMessage:
          'Livres publics avec des sessions en cours récupérés avec succès',
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

  async findOne(id: string, userId?: string): Promise<ResponseServer> {
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

      if (book.status === BookStatus.PREMIUM) {
        if (!userId) {
          return Responder({
            status: HttpStatusCode.Unauthorized,
            customMessage:
              'Authentification requise pour accéder à un livre premium',
          });
        }

        const sessionIds = Array.isArray(book.session)
          ? book.session.filter((id) => !!id)
          : [];

        if (!sessionIds.length) {
          return Responder({
            status: HttpStatusCode.PaymentRequired,
            customMessage:
              "Aucune session associée à ce livre premium n'a été trouvée.",
          });
        }

        const paidSession = await this.userInSessionModel.findOne({
          where: {
            id_user: userId,
            status: UserInSessionStatus.IN,
            id_session: {
              [Op.in]: sessionIds,
            },
          },
        });

        if (!paidSession) {
          return Responder({
            status: HttpStatusCode.PaymentRequired,
            customMessage:
              'Accès refusé : veuillez finaliser le paiement d’une session liée à ce livre.',
          });
        }
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

  async update(id: string, updateDto: UpdateBookDto): Promise<ResponseServer> {
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
        status: updateDto.status !== undefined ? updateDto.status : book.status,
        category:
          updateDto.category !== undefined ? updateDto.category : book.category,
        icon: updateDto.icon !== undefined ? updateDto.icon : book.icon,
        piece_joint:
          updateDto.piece_joint !== undefined
            ? updateDto.piece_joint
            : book.piece_joint,
        public: updateDto.public !== undefined ? updateDto.public : book.public,
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
          error: "Erreur lors de l'incrémentation des vues",
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
          error: "Erreur lors de l'incrémentation des téléchargements",
          details: error.message,
        },
      });
    }
  }
}
