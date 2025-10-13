import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { TrainingSession } from '../models/model.trainingssession';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { CreatePaymentMethodOpcoDto } from './dto/create-paymentmethodopco.dto';
import { UpdatePaymentMethodOpcoDto } from './dto/update-paymentmethodopco.dto';
import { DeletePaymentMethodOpcoDto } from './dto/delete-paymentmethodopco.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { PaymentMethodOpcoStatus } from '../enums/payment-method-opco-status.enum';
import { UserInSessionStatus } from '../enums/user-in-session-status.enum';
import { MailService } from '../services/service.mail';

@Injectable()
export class PaymentMethodOpcoService {
  constructor(
    @InjectModel(PaymentMethodOpco)
    private paymentMethodOpcoModel: typeof PaymentMethodOpco,
    @InjectModel(PaymentMethodCpf)
    private paymentMethodCpfModel: typeof PaymentMethodCpf,
    @InjectModel(PaymentMethodCard)
    private paymentMethodCardModel: typeof PaymentMethodCard,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
    @InjectModel(Users)
    private usersModel: typeof Users,
    @InjectModel(UserInSession)
    private userInSessionModel: typeof UserInSession,
    private mailService: MailService,
  ) {}

  async create(
    createPaymentMethodOpcoDto: CreatePaymentMethodOpcoDto,
    userId: string,
  ) {
    try {
      console.log(
        '🏗️ [PAYMENT METHOD OPCO SERVICE] ===== CREATE METHOD STARTED =====',
      );
      console.log(
        '📊 [PAYMENT METHOD OPCO SERVICE] Input data:',
        JSON.stringify(createPaymentMethodOpcoDto, null, 2),
      );
      console.log('🆔 [PAYMENT METHOD OPCO SERVICE] User ID received:', userId);
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] User ID type:',
        typeof userId,
      );
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] User ID is undefined?',
        userId === undefined,
      );
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] User ID is null?',
        userId === null,
      );

      // Verify that the training session exists
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] Checking training session:',
        createPaymentMethodOpcoDto.id_session,
      );
      const trainingSession = await this.trainingSessionModel.findByPk(
        createPaymentMethodOpcoDto.id_session,
      );
      console.log(
        '📚 [PAYMENT METHOD OPCO SERVICE] Training session found:',
        trainingSession ? 'YES' : 'NO',
      );
      if (trainingSession) {
        console.log(
          '📚 [PAYMENT METHOD OPCO SERVICE] Training session details:',
          JSON.stringify(trainingSession.toJSON(), null, 2),
        );
      }

      if (!trainingSession) {
        console.log(
          '❌ [PAYMENT METHOD OPCO SERVICE] Training session not found!',
        );
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training session not found',
        });
      }

      // Note: User ID will be extracted from JWT token in the controller
      // No need to verify user existence here as it's handled by authentication

      // Check if user already has any payment method (OPCO, CPF, or Card) for this session
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] Checking for existing payment methods...',
      );
      console.log(
        '🔍 [PAYMENT METHOD OPCO SERVICE] Query parameters - Session ID:',
        createPaymentMethodOpcoDto.id_session,
        'User ID:',
        userId,
      );

      // Also check if UserInSession already exists
      const existingUserInSession = await this.userInSessionModel.findOne({
        where: {
          id_user: userId,
          id_session: createPaymentMethodOpcoDto.id_session,
        },
      });
      console.log(
        '👥 [PAYMENT METHOD OPCO SERVICE] Existing UserInSession:',
        existingUserInSession ? 'FOUND' : 'NOT FOUND',
      );

      const [existingOpcoPayment, existingCpfPayment, existingCardPayment] =
        await Promise.all([
          this.paymentMethodOpcoModel.findOne({
            where: {
              id_session: createPaymentMethodOpcoDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodCpfModel.findOne({
            where: {
              id_session: createPaymentMethodOpcoDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodCardModel.findOne({
            where: {
              id_session: createPaymentMethodOpcoDto.id_session,
              id_user: userId,
            },
          }),
        ]);

      console.log(
        '💳 [PAYMENT METHOD OPCO SERVICE] Existing OPCO payment:',
        existingOpcoPayment ? 'FOUND' : 'NOT FOUND',
      );
      console.log(
        '💳 [PAYMENT METHOD OPCO SERVICE] Existing CPF payment:',
        existingCpfPayment ? 'FOUND' : 'NOT FOUND',
      );
      console.log(
        '💳 [PAYMENT METHOD OPCO SERVICE] Existing Card payment:',
        existingCardPayment ? 'FOUND' : 'NOT FOUND',
      );

      if (existingOpcoPayment || existingCpfPayment || existingCardPayment) {
        console.log(
          '❌ [PAYMENT METHOD OPCO SERVICE] User already has a payment method for this session!',
        );
        // Determine which payment method exists and create appropriate French message
        let existingPaymentType = '';
        let frenchMessage = '';

        if (existingOpcoPayment) {
          existingPaymentType = 'OPCO';
          frenchMessage =
            'Vous avez déjà une méthode de paiement OPCO pour cette session de formation.';
        } else if (existingCpfPayment) {
          existingPaymentType = 'CPF';
          frenchMessage =
            'Vous avez déjà une méthode de paiement CPF pour cette session de formation.';
        } else if (existingCardPayment) {
          existingPaymentType = 'Carte';
          frenchMessage =
            'Vous avez déjà une méthode de paiement par carte pour cette session de formation.';
        }

        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            errorType: 'DUPLICATE_PAYMENT_METHOD',
            existingPaymentType: existingPaymentType,
            existingPaymentTypes: {
              opco: !!existingOpcoPayment,
              cpf: !!existingCpfPayment,
              card: !!existingCardPayment,
            },
            sessionId: createPaymentMethodOpcoDto.id_session,
            userId: userId,
            message: frenchMessage,
          },
          customMessage: frenchMessage,
        });
      }

      console.log(
        '🏗️ [PAYMENT METHOD OPCO SERVICE] Creating new OPCO payment method...',
      );
      console.log('📝 [PAYMENT METHOD OPCO SERVICE] Payment data to create:', {
        id_session: createPaymentMethodOpcoDto.id_session,
        nom_opco: createPaymentMethodOpcoDto.nom_opco,
        nom_entreprise: createPaymentMethodOpcoDto.nom_entreprise,
        siren: createPaymentMethodOpcoDto.siren,
        nom_responsable: createPaymentMethodOpcoDto.nom_responsable,
        telephone_responsable: createPaymentMethodOpcoDto.telephone_responsable,
        email_responsable: createPaymentMethodOpcoDto.email_responsable,
        status: PaymentMethodOpcoStatus.PENDING,
        id_user: userId,
      });

      let paymentMethodOpco;
      try {
        paymentMethodOpco = await this.paymentMethodOpcoModel.create({
          id_session: createPaymentMethodOpcoDto.id_session,
          nom_opco: createPaymentMethodOpcoDto.nom_opco,
          nom_entreprise: createPaymentMethodOpcoDto.nom_entreprise,
          siren: createPaymentMethodOpcoDto.siren,
          nom_responsable: createPaymentMethodOpcoDto.nom_responsable,
          telephone_responsable:
            createPaymentMethodOpcoDto.telephone_responsable,
          email_responsable: createPaymentMethodOpcoDto.email_responsable,
          status: PaymentMethodOpcoStatus.PENDING,
          id_user: userId,
        });
      } catch (error) {
        // Handle unique constraint violation (duplicate user-session combination)
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(
            '❌ [PAYMENT METHOD OPCO SERVICE] Duplicate payment method detected via database constraint',
          );
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: {
              errorType: 'DUPLICATE_PAYMENT_METHOD',
              existingPaymentType: 'OPCO',
              existingPaymentTypes: {
                opco: true,
                cpf: false,
                card: false,
              },
              sessionId: createPaymentMethodOpcoDto.id_session,
              userId: userId,
              message:
                'Vous avez déjà une méthode de paiement OPCO pour cette session de formation.',
            },
            customMessage:
              'Vous avez déjà une méthode de paiement OPCO pour cette session de formation.',
          });
        }
        // Re-throw other errors
        throw error;
      }

      console.log(
        '✅ [PAYMENT METHOD OPCO SERVICE] Payment method created successfully with ID:',
        paymentMethodOpco.id,
      );

      // Create or update UserInSession record
      console.log(
        '👥 [PAYMENT METHOD OPCO SERVICE] Creating/updating UserInSession...',
      );

      try {
        if (existingUserInSession) {
          // Update existing UserInSession to pending status
          await existingUserInSession.update({
            status: UserInSessionStatus.PENDING,
          });
          console.log(
            '👥 [PAYMENT METHOD OPCO SERVICE] Updated existing UserInSession to PENDING status',
          );
        } else {
          // Create new UserInSession
          const newUserInSession = await this.userInSessionModel.create({
            id_user: userId,
            id_session: createPaymentMethodOpcoDto.id_session,
            status: UserInSessionStatus.PENDING,
          });
          console.log(
            '👥 [PAYMENT METHOD OPCO SERVICE] Created new UserInSession with PENDING status, ID:',
            newUserInSession.id,
          );
        }
      } catch (error) {
        console.log(
          '⚠️ [PAYMENT METHOD OPCO SERVICE] UserInSession creation/update failed:',
          error.message,
        );
        // Don't fail the entire operation if UserInSession creation fails
        // The payment method was created successfully
      }

      // Fetch the created payment method with relationships
      const createdPaymentMethod = await this.paymentMethodOpcoModel.findByPk(
        paymentMethodOpco.id,
        {
          include: [
            {
              model: TrainingSession,
              as: 'trainingSession',
              required: false,
              attributes: [
                'id',
                'title',
                'nb_places',
                'available_places',
                'begining_date',
                'ending_date',
              ],
            },
            {
              model: Users,
              as: 'user',
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            },
          ],
        },
      );

      if (!createdPaymentMethod) {
        console.log(
          '❌ [PAYMENT METHOD OPCO SERVICE] Failed to retrieve created payment method!',
        );
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage: 'Failed to retrieve created payment method',
        });
      }

      console.log(
        '🎉 [PAYMENT METHOD OPCO SERVICE] ===== PAYMENT METHOD CREATED SUCCESSFULLY =====',
      );
      console.log(
        '📋 [PAYMENT METHOD OPCO SERVICE] Final payment method data:',
        JSON.stringify(createdPaymentMethod.toJSON(), null, 2),
      );

      // Send email notification to user
      try {
        const user = await this.usersModel.findByPk(userId);
        const trainingSession = await this.trainingSessionModel.findByPk(
          createPaymentMethodOpcoDto.id_session,
        );

        if (user && user.email) {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'Paiement OPCO enregistré',
            content: this.mailService.templates({
              as: 'payment-opco-pending',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              cours: trainingSession?.title || 'Formation',
            }),
          });
          console.log(
            '[PAYMENT METHOD OPCO CREATE] ✅ Email notification sent to user:',
            user.email,
          );
        }
      } catch (emailError) {
        console.error(
          '[PAYMENT METHOD OPCO CREATE] ⚠️ Failed to send email notification:',
          emailError,
        );
        // Don't fail the entire operation if email fails
      }

      return Responder({
        status: HttpStatusCode.Created,
        data: createdPaymentMethod,
        customMessage: 'Payment method OPCO created successfully',
      });
    } catch (error) {
      console.error(
        '[PAYMENT METHOD OPCO CREATE] ❌ Error creating payment method:',
      );
      console.error(
        '[PAYMENT METHOD OPCO CREATE] Error message:',
        error.message,
      );
      console.error('[PAYMENT METHOD OPCO CREATE] Error stack:', error.stack);
      console.error('[PAYMENT METHOD OPCO CREATE] Full error object:', error);
      console.error(
        '[PAYMENT METHOD OPCO CREATE] Request data:',
        createPaymentMethodOpcoDto,
      );

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to create payment method OPCO',
      });
    }
  }

  async findAll() {
    try {
      const paymentMethods = await this.paymentMethodOpcoModel.findAll({
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: 'Payment methods OPCO retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment methods OPCO',
      });
    }
  }

  async findOne(id: string) {
    try {
      const paymentMethod = await this.paymentMethodOpcoModel.findByPk(id, {
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
      });

      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Payment method OPCO not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethod,
        customMessage: 'Payment method OPCO retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment method OPCO',
      });
    }
  }

  async findByUserId(userId: string) {
    try {
      const paymentMethods = await this.paymentMethodOpcoModel.findAll({
        where: {
          id_user: userId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: 'User payment methods OPCO retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve user payment methods OPCO',
      });
    }
  }

  async findBySessionId(sessionId: string) {
    try {
      const paymentMethods = await this.paymentMethodOpcoModel.findAll({
        where: {
          id_session: sessionId,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: 'Session payment methods OPCO retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve session payment methods OPCO',
      });
    }
  }

  async findBySiren(siren: string) {
    try {
      const paymentMethods = await this.paymentMethodOpcoModel.findAll({
        where: {
          siren: siren,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: 'Payment methods OPCO by SIREN retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment methods OPCO by SIREN',
      });
    }
  }

  async findByStatus(status: PaymentMethodOpcoStatus) {
    try {
      const paymentMethods = await this.paymentMethodOpcoModel.findAll({
        where: {
          status: status,
        },
        include: [
          {
            model: TrainingSession,
            as: 'trainingSession',
            required: false,
            attributes: [
              'id',
              'title',
              'nb_places',
              'available_places',
              'begining_date',
              'ending_date',
            ],
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethods,
        customMessage: `Payment methods with status ${status} retrieved successfully`,
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment methods by status',
      });
    }
  }

  async update(updatePaymentMethodOpcoDto: UpdatePaymentMethodOpcoDto) {
    try {
      const { id, ...updateData } = updatePaymentMethodOpcoDto;

      const paymentMethod = await this.paymentMethodOpcoModel.findByPk(id);
      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Payment method OPCO not found',
        });
      }

      // If updating session reference, verify it exists
      if (updateData.id_session) {
        const trainingSession = await this.trainingSessionModel.findByPk(
          updateData.id_session,
        );
        if (!trainingSession) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: null,
            customMessage: 'Training session not found',
          });
        }
      }

      // If updating user reference, verify it exists
      if (updateData.id_user) {
        const user = await this.usersModel.findByPk(updateData.id_user);
        if (!user) {
          return Responder({
            status: HttpStatusCode.NotFound,
            data: null,
            customMessage: 'User not found',
          });
        }
      }

      await paymentMethod.update(updateData);

      // Fetch the updated payment method with relationships
      const updatedPaymentMethod = await this.paymentMethodOpcoModel.findByPk(
        id,
        {
          include: [
            {
              model: TrainingSession,
              as: 'trainingSession',
              required: false,
              attributes: [
                'id',
                'title',
                'nb_places',
                'available_places',
                'begining_date',
                'ending_date',
              ],
            },
            {
              model: Users,
              as: 'user',
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            },
          ],
        },
      );

      return Responder({
        status: HttpStatusCode.Ok,
        data: updatedPaymentMethod,
        customMessage: 'Payment method OPCO updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to update payment method OPCO',
      });
    }
  }

  async remove(deletePaymentMethodOpcoDto: DeletePaymentMethodOpcoDto) {
    try {
      const { id } = deletePaymentMethodOpcoDto;

      const paymentMethod = await this.paymentMethodOpcoModel.findByPk(id);
      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Payment method OPCO not found',
        });
      }

      await paymentMethod.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Payment method OPCO deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete payment method OPCO',
      });
    }
  }

  async deleteAll() {
    try {
      const deletedCount = await this.paymentMethodOpcoModel.destroy({
        where: {},
        truncate: true,
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: { deletedCount },
        customMessage: 'All payment methods OPCO deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete all payment methods OPCO',
      });
    }
  }
}
