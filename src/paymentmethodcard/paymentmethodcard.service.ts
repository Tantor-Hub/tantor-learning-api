import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Stripe from 'stripe';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { CreatePaymentMethodCardDto } from './dto/create-paymentmethodcard.dto';
import { UpdatePaymentMethodCardDto } from './dto/update-paymentmethodcard.dto';
import { DeletePaymentMethodCardDto } from './dto/delete-paymentmethodcard.dto';
import { StripePaymentIntentDto } from './dto/stripe-checkout.dto';
import {
  StripePaymentIntentResponseDto,
  StripePaymentIntentStatusDto,
} from './dto/stripe-session-response.dto';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { PaymentMethodCardStatus } from '../enums/payment-method-card-status.enum';

@Injectable()
export class PaymentMethodCardService {
  private stripe: Stripe;

  constructor(
    @InjectModel(PaymentMethodCard)
    private paymentMethodCardModel: typeof PaymentMethodCard,
    @InjectModel(PaymentMethodCpf)
    private paymentMethodCpfModel: typeof PaymentMethodCpf,
    @InjectModel(PaymentMethodOpco)
    private paymentMethodOpcoModel: typeof PaymentMethodOpco,
    @InjectModel(TrainingSession)
    private trainingSessionModel: typeof TrainingSession,
    @InjectModel(Training)
    private trainingModel: typeof Training,
    @InjectModel(Users)
    private usersModel: typeof Users,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async create(
    createPaymentMethodCardDto: CreatePaymentMethodCardDto,
    userId: string,
  ) {
    try {
      console.log(
        '[PAYMENT METHOD CARD CREATE] Starting creation with data:',
        createPaymentMethodCardDto,
      );

      // Verify that the training session exists and get training price
      const trainingSession = await this.trainingSessionModel.findByPk(
        createPaymentMethodCardDto.id_session,
        {
          include: [
            {
              model: Training,
              as: 'trainings',
              required: false,
              attributes: ['id', 'title', 'prix'],
            },
          ],
        },
      );
      if (!trainingSession) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Training session not found',
        });
      }

      // Get the training price
      const trainingPrice = trainingSession.trainings?.prix || 0;
      console.log(
        '💰 [PAYMENT METHOD CARD SERVICE] Training price:',
        trainingPrice,
      );

      // Note: User ID will be extracted from JWT token in the controller
      // No need to verify user existence here as it's handled by authentication

      // Check if user already has any payment method (OPCO, CPF, or Card) for this session
      const [existingOpcoPayment, existingCpfPayment, existingCardPayment] =
        await Promise.all([
          this.paymentMethodOpcoModel.findOne({
            where: {
              id_session: createPaymentMethodCardDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodCpfModel.findOne({
            where: {
              id_session: createPaymentMethodCardDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodCardModel.findOne({
            where: {
              id_session: createPaymentMethodCardDto.id_session,
              id_user: userId,
            },
          }),
        ]);

      if (existingOpcoPayment || existingCpfPayment || existingCardPayment) {
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
            sessionId: createPaymentMethodCardDto.id_session,
            userId: userId,
            message: frenchMessage,
          },
          customMessage: frenchMessage,
        });
      }

      let paymentMethodCard;
      try {
        paymentMethodCard = await this.paymentMethodCardModel.create({
          id_session: createPaymentMethodCardDto.id_session,
          id_stripe_payment: undefined, // Will be set later when Stripe payment is processed
          status: PaymentMethodCardStatus.PENDING,
          id_user: userId,
        });
      } catch (error) {
        // Handle unique constraint violation (duplicate user-session combination)
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(
            '❌ [PAYMENT METHOD CARD SERVICE] Duplicate payment method detected via database constraint',
          );
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: {
              errorType: 'DUPLICATE_PAYMENT_METHOD',
              existingPaymentType: 'Carte',
              existingPaymentTypes: {
                opco: false,
                cpf: false,
                card: true,
              },
              sessionId: createPaymentMethodCardDto.id_session,
              userId: userId,
              message:
                'Vous avez déjà une méthode de paiement par carte pour cette session de formation.',
            },
            customMessage:
              'Vous avez déjà une méthode de paiement par carte pour cette session de formation.',
          });
        }
        // Re-throw other errors
        throw error;
      }

      // Fetch the created payment method with relationships
      const createdPaymentMethod = await this.paymentMethodCardModel.findByPk(
        paymentMethodCard.id,
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
        return Responder({
          status: HttpStatusCode.InternalServerError,
          data: null,
          customMessage: 'Failed to retrieve created payment method',
        });
      }

      console.log(
        '[PAYMENT METHOD CARD CREATE] ✅ Successfully created payment method:',
        createdPaymentMethod.toJSON(),
      );
      console.log(
        '💰 [PAYMENT METHOD CARD SERVICE] Training price included in response:',
        trainingPrice,
      );

      // Add training price information to the response
      const responseData = {
        ...createdPaymentMethod.toJSON(),
        trainingPrice: trainingPrice,
        amountToPay: trainingPrice,
      };

      return Responder({
        status: HttpStatusCode.Created,
        data: responseData,
        customMessage: 'Payment method card created successfully',
      });
    } catch (error) {
      console.error(
        '[PAYMENT METHOD CARD CREATE] ❌ Error creating payment method:',
      );
      console.error(
        '[PAYMENT METHOD CARD CREATE] Error message:',
        error.message,
      );
      console.error('[PAYMENT METHOD CARD CREATE] Error stack:', error.stack);
      console.error('[PAYMENT METHOD CARD CREATE] Full error object:', error);
      console.error(
        '[PAYMENT METHOD CARD CREATE] Request data:',
        createPaymentMethodCardDto,
      );

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          originalError: error.original || null,
        },
        customMessage: 'Failed to create payment method card',
      });
    }
  }

  async findAll() {
    try {
      const paymentMethods = await this.paymentMethodCardModel.findAll({
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
        customMessage: 'Payment methods card retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment methods card',
      });
    }
  }

  async findOne(id: string) {
    try {
      const paymentMethod = await this.paymentMethodCardModel.findByPk(id, {
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
          customMessage: 'Payment method card not found',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethod,
        customMessage: 'Payment method card retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve payment method card',
      });
    }
  }

  async findByUserId(userId: string) {
    try {
      const paymentMethods = await this.paymentMethodCardModel.findAll({
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
        customMessage: 'User payment methods card retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve user payment methods card',
      });
    }
  }

  async findBySessionId(sessionId: string) {
    try {
      const paymentMethods = await this.paymentMethodCardModel.findAll({
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
        customMessage: 'Session payment methods card retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to retrieve session payment methods card',
      });
    }
  }

  async findByStripePaymentId(stripePaymentId: string) {
    try {
      const paymentMethod = await this.paymentMethodCardModel.findOne({
        where: {
          id_stripe_payment: stripePaymentId,
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
      });

      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage:
            'Payment method card not found for this Stripe payment',
        });
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: paymentMethod,
        customMessage: 'Payment method card retrieved successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage:
          'Failed to retrieve payment method card by Stripe payment ID',
      });
    }
  }

  async findByStatus(status: PaymentMethodCardStatus) {
    try {
      const paymentMethods = await this.paymentMethodCardModel.findAll({
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

  async update(updatePaymentMethodCardDto: UpdatePaymentMethodCardDto) {
    try {
      const { id, ...updateData } = updatePaymentMethodCardDto;

      const paymentMethod = await this.paymentMethodCardModel.findByPk(id);
      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Payment method card not found',
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

      // Note: User ID is not updated via this endpoint - it's extracted from JWT token

      await paymentMethod.update(updateData);

      // Fetch the updated payment method with relationships
      const updatedPaymentMethod = await this.paymentMethodCardModel.findByPk(
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
        customMessage: 'Payment method card updated successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to update payment method card',
      });
    }
  }

  async remove(deletePaymentMethodCardDto: DeletePaymentMethodCardDto) {
    try {
      const { id } = deletePaymentMethodCardDto;

      const paymentMethod = await this.paymentMethodCardModel.findByPk(id);
      if (!paymentMethod) {
        return Responder({
          status: HttpStatusCode.NotFound,
          data: null,
          customMessage: 'Payment method card not found',
        });
      }

      await paymentMethod.destroy();

      return Responder({
        status: HttpStatusCode.Ok,
        data: { id },
        customMessage: 'Payment method card deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete payment method card',
      });
    }
  }

  async deleteAll() {
    try {
      const deletedCount = await this.paymentMethodCardModel.destroy({
        where: {},
        truncate: true,
      });

      return Responder({
        status: HttpStatusCode.Ok,
        data: { deletedCount },
        customMessage: 'All payment methods card deleted successfully',
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to delete all payment methods card',
      });
    }
  }

  // Stripe Integration Methods
  async createStripePaymentIntent(
    stripePaymentIntentDto: StripePaymentIntentDto,
  ): Promise<StripePaymentIntentResponseDto> {
    try {
      console.log(
        '💳 [STRIPE PAYMENT INTENT] Creating payment intent with amount:',
        stripePaymentIntentDto.amount,
      );

      // Validate environment variables
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new HttpException(
          'Stripe secret key not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Create Stripe Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: stripePaymentIntentDto.amount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
      });

      console.log(
        '✅ [STRIPE PAYMENT INTENT] Payment intent created successfully:',
        paymentIntent.id,
      );

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error(
        '❌ [STRIPE PAYMENT INTENT] Error creating payment intent:',
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to create payment intent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStripePaymentIntentStatus(
    paymentIntentId: string,
  ): Promise<StripePaymentIntentStatusDto> {
    try {
      console.log(
        '🔍 [STRIPE PAYMENT INTENT] Retrieving payment intent status for:',
        paymentIntentId,
      );

      // Validate environment variables
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new HttpException(
          'Stripe secret key not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Retrieve payment intent from Stripe
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      console.log(
        '✅ [STRIPE PAYMENT INTENT] Payment intent retrieved successfully:',
        {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      );

      return {
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error(
        '❌ [STRIPE PAYMENT INTENT] Error retrieving payment intent:',
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      // Handle Stripe-specific errors
      if (error.type === 'StripeInvalidRequestError') {
        throw new HttpException(
          'Invalid payment intent ID',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        `Failed to retrieve payment intent status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
