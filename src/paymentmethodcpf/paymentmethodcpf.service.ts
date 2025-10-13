import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { CreatePaymentMethodCpfDto } from './dto/create-paymentmethodcpf.dto';
import { UpdatePaymentMethodCpfDto } from './dto/update-paymentmethodcpf.dto';
import { DeletePaymentMethodCpfDto } from './dto/delete-paymentmethodcpf.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { PaymentMethodCpfStatus } from '../enums/payment-method-cpf-status.enum';
import { UserInSessionStatus } from '../enums/user-in-session-status.enum';
import { MailService } from '../services/service.mail';

// Extended interface for service that includes id_user
interface CreatePaymentMethodCpfServiceDto extends CreatePaymentMethodCpfDto {
  id_user: string;
}

@Injectable()
export class PaymentMethodCpfService {
  constructor(
    @InjectModel(PaymentMethodCpf)
    private paymentMethodCpfModel: typeof PaymentMethodCpf,
    @InjectModel(PaymentMethodCard)
    private paymentMethodCardModel: typeof PaymentMethodCard,
    @InjectModel(PaymentMethodOpco)
    private paymentMethodOpcoModel: typeof PaymentMethodOpco,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(UserInSession)
    private userInSessionModel: typeof UserInSession,
    private mailService: MailService,
  ) {}

  async create(createPaymentMethodCpfDto: CreatePaymentMethodCpfServiceDto) {
    try {
      // First, check if payment method already exists (fastest check)
      const existingCpfPayment = await this.paymentMethodCpfModel.findOne({
        where: {
          id_session: createPaymentMethodCpfDto.id_session,
          id_user: createPaymentMethodCpfDto.id_user,
        },
      });

      if (existingCpfPayment) {
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: null,
          customMessage:
            'Vous avez déjà payé pour cette session de formation avec votre CPF.',
        });
      }

      // Check for other payment methods
      const existingCardPayment = await this.paymentMethodCardModel.findOne({
        where: {
          id_session: createPaymentMethodCpfDto.id_session,
          id_user: createPaymentMethodCpfDto.id_user,
        },
      });

      const existingOpcoPayment = await this.paymentMethodOpcoModel.findOne({
        where: {
          id_session: createPaymentMethodCpfDto.id_session,
          id_user: createPaymentMethodCpfDto.id_user,
        },
      });

      // Determine which payment method exists and generate appropriate message
      let existingPaymentType = '';
      if (existingCardPayment) {
        existingPaymentType = 'carte';
      } else if (existingOpcoPayment) {
        existingPaymentType = 'OPCO';
      }

      if (existingPaymentType) {
        let paymentMessage = '';
        if (existingPaymentType === 'carte') {
          paymentMessage =
            'Vous avez déjà une méthode de paiement par carte pour cette session de formation.';
        } else if (existingPaymentType === 'OPCO') {
          paymentMessage =
            'Vous avez déjà une méthode de paiement OPCO pour cette session de formation.';
        }

        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            errorType: 'DUPLICATE_PAYMENT_METHOD',
            existingPaymentType: existingPaymentType,
            existingPaymentTypes: {
              opco: !!existingOpcoPayment,
              cpf: false, // This is CPF service, so CPF is not existing yet
              card: !!existingCardPayment,
            },
            sessionId: createPaymentMethodCpfDto.id_session,
            userId: createPaymentMethodCpfDto.id_user,
            message: paymentMessage,
          },
          customMessage: paymentMessage,
        });
      }

      // Verify that the training session exists
      const trainingSession = await this.trainingSessionModel.findByPk(
        createPaymentMethodCpfDto.id_session,
      );

      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Session de formation non trouvée.',
        });
      }

      // Verify that the user exists
      const user = await this.usersModel.findByPk(
        createPaymentMethodCpfDto.id_user,
      );

      if (!user) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Utilisateur non trouvé.',
        });
      }

      // Create the payment method
      let paymentMethod;
      try {
        paymentMethod = await this.paymentMethodCpfModel.create({
          id_session: createPaymentMethodCpfDto.id_session,
          id_user: createPaymentMethodCpfDto.id_user,
          status:
            createPaymentMethodCpfDto.status || PaymentMethodCpfStatus.PENDING,
        });
      } catch (error) {
        // Handle unique constraint violation (duplicate user-session combination)
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(
            '❌ [PAYMENT METHOD CPF SERVICE] Duplicate payment method detected via database constraint',
          );
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: {
              errorType: 'DUPLICATE_PAYMENT_METHOD',
              existingPaymentType: 'CPF',
              existingPaymentTypes: {
                opco: false,
                cpf: true,
                card: false,
              },
              sessionId: createPaymentMethodCpfDto.id_session,
              userId: createPaymentMethodCpfDto.id_user,
              message:
                'Vous avez déjà une méthode de paiement CPF pour cette session de formation.',
            },
            customMessage:
              'Vous avez déjà une méthode de paiement CPF pour cette session de formation.',
          });
        }
        // Re-throw other errors
        throw error;
      }

      // Create or update UserInSession with pending status
      try {
        const existingUserInSession = await this.userInSessionModel.findOne({
          where: {
            id_session: createPaymentMethodCpfDto.id_session,
            id_user: createPaymentMethodCpfDto.id_user,
          },
        });

        if (existingUserInSession) {
          // Update existing UserInSession to pending status
          await existingUserInSession.update({
            status: UserInSessionStatus.PENDING,
          });
        } else {
          // Create new UserInSession with pending status
          await this.userInSessionModel.create({
            id_session: createPaymentMethodCpfDto.id_session,
            id_user: createPaymentMethodCpfDto.id_user,
            status: UserInSessionStatus.PENDING,
          });
        }
      } catch (userInSessionError) {
        // If UserInSession creation/update fails, we should still return success for the payment method
        // but log the error for debugging
        console.error(
          'Failed to create/update UserInSession:',
          userInSessionError,
        );
      }

      // Send email notification to user
      try {
        const user = await this.usersModel.findByPk(
          createPaymentMethodCpfDto.id_user,
        );
        const trainingSession = await this.trainingSessionModel.findByPk(
          createPaymentMethodCpfDto.id_session,
        );

        if (user && user.email) {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'Paiement CPF enregistré',
            content: this.mailService.templates({
              as: 'payment-cpf-pending',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              cours: trainingSession?.title || 'Formation',
            }),
          });
          console.log(
            '[PAYMENT METHOD CPF CREATE] ✅ Email notification sent to user:',
            user.email,
          );
        }
      } catch (emailError) {
        console.error(
          '[PAYMENT METHOD CPF CREATE] ⚠️ Failed to send email notification:',
          emailError,
        );
        // Don't fail the entire operation if email fails
      }

      // Return success immediately without fetching relationships (faster response)
      return Responder({
        status: HttpStatusCode.Created,
        data: {
          id: paymentMethod.id,
          id_session: paymentMethod.id_session,
          id_user: paymentMethod.id_user,
          status: paymentMethod.status,
          createdAt: paymentMethod.createdAt,
          updatedAt: paymentMethod.updatedAt,
        },
        customMessage: 'Méthode de paiement CPF créée avec succès.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage: 'Erreur lors de la création de la méthode de paiement.',
      });
    }
  }

  async findAll() {
    try {
      const paymentMethods = await this.paymentMethodCpfModel.findAll({
        include: [
          {
            model: TrainingSession,
            attributes: ['id', 'title', 'nb_places', 'available_places'],
          },
          {
            model: Users,
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: 'Méthodes de paiement CPF récupérées avec succès.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la récupération des méthodes de paiement.',
      });
    }
  }

  async findOne(id: string) {
    try {
      const paymentMethod = await this.paymentMethodCpfModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            attributes: ['id', 'title', 'nb_places', 'available_places'],
          },
          {
            model: Users,
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Méthode de paiement CPF non trouvée.',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethod,
        customMessage: 'Méthode de paiement CPF récupérée avec succès.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la récupération de la méthode de paiement.',
      });
    }
  }

  async update(
    id: string,
    updatePaymentMethodCpfDto: UpdatePaymentMethodCpfDto,
  ) {
    try {
      const paymentMethod = await this.paymentMethodCpfModel.findByPk(id);

      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Méthode de paiement CPF non trouvée.',
        });
      }

      await paymentMethod.update(updatePaymentMethodCpfDto);

      const updatedPaymentMethod = await this.paymentMethodCpfModel.findByPk(
        id,
        {
          include: [
            {
              model: TrainingSession,
              attributes: ['id', 'title', 'nb_places', 'available_places'],
            },
            {
              model: Users,
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedPaymentMethod,
        customMessage: 'Méthode de paiement CPF mise à jour avec succès.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la mise à jour de la méthode de paiement.',
      });
    }
  }

  async remove(id: string) {
    try {
      const paymentMethod = await this.paymentMethodCpfModel.findByPk(id);

      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Méthode de paiement CPF non trouvée.',
        });
      }

      await paymentMethod.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: null,
        customMessage: 'Méthode de paiement CPF supprimée avec succès.',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: null,
        customMessage:
          'Erreur lors de la suppression de la méthode de paiement.',
      });
    }
  }
}
