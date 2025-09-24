import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { Formations } from 'src/models/model.formations';
import { TrainingCategory } from 'src/models/model.trainingcategory';
import { Responder } from 'src/strategy/strategy.responder';
import { typeFormations } from 'src/utils/utiles.typesformations';
import { CreateFormationDto } from './dto/create-formation.dto';
import { AllSercices } from '../services/serices.all';
import { MailService } from '../services/service.mail';

@Injectable()
export class FormationsService {
  constructor(
    @InjectModel(Formations)
    private readonly formationModel: typeof Formations,
    private readonly allServices: AllSercices,
    private readonly mailService: MailService,
  ) {}

  async getFormationById(idSession: number): Promise<ResponseServer> {
    return this.formationModel
      .findOne({
        where: {
          id: idSession,
        },
      })
      .then((inst) => {
        if (inst instanceof Formations) {
          return Responder({ status: HttpStatusCode.Ok, data: inst });
        } else {
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: "La session ciblée n'a pas été retrouvé !",
          });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async delete(idSession: number): Promise<ResponseServer> {
    return this.formationModel
      .findOne({
        where: {
          id: idSession,
        },
      })
      .then((inst) => {
        if (inst instanceof Formations) {
          return inst
            .update({
              status: 0,
            })
            .then((_) =>
              Responder({
                status: HttpStatusCode.Ok,
                data: 'Elément supprimé avec succès !',
              }),
            )
            .catch((_) =>
              Responder({ status: HttpStatusCode.BadRequest, data: _ }),
            );
        } else {
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: "La session ciblée n'a pas été retrouvé !",
          });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async createNewFormation(
    createFormationDto: CreateFormationDto,
  ): Promise<ResponseServer> {
    const {
      id_training,
      sous_titre,
      titre,
      type_formation,
      description,
      lien_contenu,
      prix,
      rnc,
      alternance,
      prerequis,
      id_thematic,
      end_on,
      start_on,
      id_formateur,
      duree,
    } = createFormationDto;

    const s_on = this.allServices.parseDate(start_on as any);
    const e_on = this.allServices.parseDate(end_on as any);

    return this.formationModel
      .create({
        rnc,
        prerequis,
        alternance,
        description: description || '',
        duree: duree || '',
        end_on: e_on as any,
        start_on: s_on as any,
        id_training: id_training as any as string,
        id_formateur: id_formateur || (0 as number),
        prix: prix as any as number,
        sous_titre,
        titre,
        type_formation: type_formation as any,
        piece_jointe: lien_contenu,
      })
      .then((formation) => {
        if (formation instanceof Formations) {
          return Responder({
            status: HttpStatusCode.Created,
            data: createFormationDto,
          });
        } else {
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: formation,
          });
        }
      })
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }
  async getTypesFormations(): Promise<ResponseServer> {
    return Responder({ status: HttpStatusCode.Ok, data: typeFormations });
  }
  async gatAllFormations(): Promise<ResponseServer> {
    return this.formationModel
      .findAll({
        where: {
          status: 1,
        },
        include: [
          {
            model: TrainingCategory,
            as: 'trainingCategory',
          },
        ],
        order: [['createdAt', 'DESC']],
      })
      .then((list) =>
        Responder({
          status: HttpStatusCode.Ok,
          data: { length: list.length, list },
        }),
      )
      .catch((err) =>
        Responder({ status: HttpStatusCode.InternalServerError, data: err }),
      );
  }

  /**
   * Delete all data from formations table
   * WARNING: This will permanently delete all formations data and related records!
   */
  async deleteAllFormations(): Promise<ResponseServer> {
    try {
      console.log(
        '[FORMATIONS DELETE ALL] Starting to delete all formations data',
      );

      // Disable foreign key constraints temporarily to delete all formations
      console.log(
        '[FORMATIONS DELETE ALL] Disabling foreign key constraints...',
      );
      await this.formationModel.sequelize?.query(
        'SET session_replication_role = replica;',
      );
      console.log(
        '[FORMATIONS DELETE ALL] ✅ Foreign key constraints disabled',
      );

      // Delete all formations data
      console.log('[FORMATIONS DELETE ALL] Deleting all formations...');
      const deleteAllSQL = 'DELETE FROM ___tbl_tantor_formationsascours';
      const result = await this.formationModel.sequelize?.query(deleteAllSQL);

      // Re-enable foreign key constraints
      console.log(
        '[FORMATIONS DELETE ALL] Re-enabling foreign key constraints...',
      );
      await this.formationModel.sequelize?.query(
        'SET session_replication_role = DEFAULT;',
      );
      console.log(
        '[FORMATIONS DELETE ALL] ✅ Foreign key constraints re-enabled',
      );

      console.log(
        '[FORMATIONS DELETE ALL] ✅ Successfully deleted all formations data',
      );
      console.log('[FORMATIONS DELETE ALL] Result:', result);

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          message: 'All formations data deleted successfully',
          result: result,
          sqlCommand: deleteAllSQL,
        },
        customMessage: 'All formations data deleted successfully',
      });
    } catch (error) {
      console.error(
        '[FORMATIONS DELETE ALL] ❌ Error deleting all formations data:',
      );
      console.error('[FORMATIONS DELETE ALL] Error message:', error.message);
      console.error('[FORMATIONS DELETE ALL] Error stack:', error.stack);

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to delete all formations data',
      });
    }
  }
}
