import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { IJwtSignin } from 'src/interface/interface.payloadjwtsignin';
import { ResponseServer } from 'src/interface/interface.response';
import { Messages } from 'src/models/model.messages';
import { Cours } from 'src/models/model.cours';
import { AllSercices } from 'src/services/serices.all';
import { MailService } from 'src/services/service.mail';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateCoursDto } from './dto/create-cours.dto';
import { UpdateCoursDto } from './dto/update-cours.dto';
import { CreationAttributes } from 'sequelize';
import { AssignFormateurToSessionDto } from 'src/sessions/dto/attribute-session.dto';
import { Users } from 'src/models/model.users';
import {
  alloedMaterials,
  typeFormations,
} from 'src/utils/utiles.typesformations';

@Injectable()
export class CoursService {
  constructor(
    private readonly allSercices: AllSercices,
    private readonly mailService: MailService,

    @InjectModel(Messages)
    private readonly messageModel: typeof Messages,

    @InjectModel(Cours)
    private readonly coursModel: typeof Cours,

    @InjectModel(Users)
    private readonly usersModel: typeof Users,
  ) {}

  async getCoursById(idcours: number): Promise<ResponseServer> {
    try {
      return this.coursModel
        .findOne({
          where: {
            id: idcours,
          },
          attributes: {
            exclude: ['id_thematic', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Users,
              required: true,
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
            },
          ],
        })
        .then((cours) => {
          if (cours instanceof Cours) {
            return Responder({ status: HttpStatusCode.Ok, data: cours });
          } else {
            return Responder({
              status: HttpStatusCode.NotFound,
              data: 'The item can not be found with the specifique ID',
            });
          }
        })
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getListCoursAllBySesson(idsession: number): Promise<ResponseServer> {
    try {
      return this.coursModel
        .findAll({
          attributes: {
            exclude: ['id_thematic', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Users,
              required: true,
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
            },
          ],
          where: {
            id_session: idsession,
          },
        })
        .then((list) =>
          Responder({
            status: HttpStatusCode.Ok,
            data: { length: list.length, rows: list },
          }),
        )
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getListCoursAllBySessonAndByFormateur(
    idsession: number,
    idformateur: number,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      return this.coursModel
        .findAll({
          attributes: {
            exclude: ['id_thematic', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Users,
              required: true,
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
            },
          ],
          where: {
            id_session: idsession,
            createdBy: user.id_user,
          },
        })
        .then((list) =>
          Responder({
            status: HttpStatusCode.Ok,
            data: { length: list.length, rows: list },
          }),
        )
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getListCoursAllByFormateurConnected(
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      return this.coursModel
        .findAll({
          attributes: {
            exclude: ['id_thematic', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Users,
              required: true,
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
            },
          ],
          where: {
            createdBy: user.id_user,
          },
        })
        .then((list) =>
          Responder({
            status: HttpStatusCode.Ok,
            data: { length: list.length, rows: list },
          }),
        )
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getListCours(): Promise<ResponseServer> {
    try {
      return this.coursModel
        .findAll({
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          include: [
            {
              model: Users,
              required: false,
              as: 'CreatedBy',
              attributes: ['id', 'fs_name', 'ls_name', 'email'],
            },
          ],
        })
        .then((list) =>
          Responder({
            status: HttpStatusCode.Ok,
            data: { length: list.length, rows: list },
          }),
        )
        .catch((err) =>
          Responder({ status: HttpStatusCode.InternalServerError, data: err }),
        );
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
  async getListCoursAll(): Promise<ResponseServer> {
    try {
      // First, get all courses with their formateurs
      const courses = await this.coursModel.findAll({
        attributes: [
          'id',
          'title',
          'description',
          'id_formateur',
          'is_published',
          'id_session',
        ],
        include: [
          {
            model: Users,
            required: false,
            as: 'CreatedBy',
            attributes: ['id', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Group courses by preset course to combine multiple formateurs
      const groupedCourses = new Map();

      for (const course of courses) {
        const key = `${course.id}-${course.id_session}`;

        if (!groupedCourses.has(key)) {
          groupedCourses.set(key, {
            id: course.id,
            title: course.title,
            description: course.description,
            is_published: course.is_published,
            id_formateurs: [],
            createdAt: course.createdAt,
          });
        }

        const courseGroup = groupedCourses.get(key);
        courseGroup.id_formateurs.push({
          id: course.CreatedBy?.uuid || course.id_formateur,
          // fs_name: course.CreatedBy?.fs_name,
          // ls_name: course.CreatedBy?.ls_name,
          email: course.CreatedBy?.email,
        });
      }

      const result = Array.from(groupedCourses.values());

      // Sort the final result by createdAt in descending order (most recent first)
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: result.length,
          rows: result,
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async updateCours(
    user: IJwtSignin,
    id_cours: number,
    updateDto: UpdateCoursDto,
  ): Promise<ResponseServer> {
    const { id_formateurs, title, description } = updateDto;
    try {
      // First, check if the course exists and get its preset course and session
      const course = await this.coursModel.findOne({
        where: { id: id_cours },
      });

      if (!course) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Course not found',
        });
      }

      const { id_session, createdBy } = course.toJSON();

      // Check if user has permission (same as course creator or secretary)
      if (createdBy !== user.id_user) {
        // Fetch user roles from database
        const dbUser = await this.usersModel.findOne({
          where: { id: user.id_user },
        });

        if (!dbUser) {
          return Responder({
            status: HttpStatusCode.Unauthorized,
            data: 'User not found',
          });
        }

        if (dbUser.role !== 'secretary') {
          return Responder({
            status: HttpStatusCode.Unauthorized,
            data: 'You do not have permission to update this course',
          });
        }
      }

      const updateResults: any = {};

      // Update course title and description if provided
      if (title || description) {
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        await course.update(updateData);
        updateResults.course_updated = true;
      }

      // Add formateurs if provided
      let createdCourses: Cours[] = [];
      if (id_formateurs && id_formateurs.length > 0) {
        for (const id_formateur of id_formateurs) {
          try {
            // Check if this formateur is already assigned to this course
            const existingCourse = await this.coursModel.findOne({
              where: {
                id_session,
                id_formateur,
                title: course.title,
              },
            });

            if (existingCourse) {
              continue; // Skip if already exists
            }

            const newCourse = await this.coursModel.create({
              createdBy: user.id_user,
              title: course.title,
              description: course.description,
              id_session,
              id_formateur,
              is_published: course.is_published,
            });

            if (newCourse instanceof Cours) {
              createdCourses.push(newCourse);
            }
          } catch (err) {
            console.error(
              `Failed to add formateur ${id_formateur} to course:`,
              err,
            );
            // Continue with other formateurs even if one fails
          }
        }
        updateResults.formateurs_added = createdCourses.length;
      }

      // Check if any updates were made
      if (
        !updateResults.course_updated &&
        (!createdCourses || createdCourses.length === 0)
      ) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'No updates were made',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          message: 'Course updated successfully',
          updates: updateResults,
          added_courses: createdCourses,
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async createCourse(
    user: IJwtSignin,
    createCoursDto: CreateCoursDto,
  ): Promise<ResponseServer> {
    const { title, description, is_published, id_formateurs, id_session } =
      createCoursDto;

    try {
      // Validate input parameters
      if (!title || !description) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Title and description are required',
        });
      }

      if (id_formateurs && id_formateurs.length > 0) {
        for (const id_formateur of id_formateurs) {
          const formateur = await this.usersModel.findOne({
            where: { id: id_formateur, role: 'instructor' },
          });

          if (!formateur) {
            return Responder({
              status: HttpStatusCode.BadRequest,
              data: `Formateur with ID ${id_formateur} not found or not an instructor`,
            });
          }
        }
      }

      // Create the course
      const courseData: CreationAttributes<Cours> = {
        title,
        description,
        createdBy: user.id_user,
        id_session,
        is_published: is_published || false,
      };

      // Create course instances for each formateur (if provided)
      const createdCourses: Cours[] = [];
      const errors: string[] = [];

      if (id_formateurs && id_formateurs.length > 0) {
        for (const id_formateur of id_formateurs) {
          try {
            const cours = await this.coursModel.create({
              ...courseData,
              id_formateur,
            });

            if (cours instanceof Cours) {
              createdCourses.push(cours);
            }
          } catch (err) {
            const errorMessage = `Failed to create course for formateur ${id_formateur}: ${err.message}`;
            console.error(errorMessage);
            errors.push(errorMessage);
          }
        }
      } else {
        // Create a single course without formateur
        try {
          const cours = await this.coursModel.create(courseData);
          if (cours instanceof Cours) {
            createdCourses.push(cours);
          }
        } catch (err) {
          const errorMessage = `Failed to create course: ${err.message}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      }

      // Check if any courses were created successfully
      if (createdCourses.length === 0) {
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: {
            message: 'Failed to create any courses',
            errors: errors,
          },
        });
      }

      // Return success response
      return Responder({
        status: HttpStatusCode.Created,
        data: {
          message: 'Course created successfully',
          created_courses: createdCourses.map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            id_formateur: course.id_formateur,
            id_session: course.id_session,
            is_published: course.is_published,
            createdBy: course.createdBy,
          })),
          total_created: createdCourses.length,
          total_requested: id_formateurs?.length || 1,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (error) {
      console.error('Error creating course:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: 'Internal server error while creating course',
          error: error.message,
        },
      });
    }
  }
}
