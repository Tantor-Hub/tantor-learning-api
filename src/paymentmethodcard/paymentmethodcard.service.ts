import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Stripe from 'stripe';
import { PaymentMethodCard } from '../models/model.paymentmethodcard';
import { PaymentMethodCpf } from '../models/model.paymentmethodcpf';
import { PaymentMethodOpco } from '../models/model.paymentmethodopco';
import { TrainingSession } from '../models/model.trainingssession';
import { Training } from '../models/model.trainings';
import { Users } from '../models/model.users';
import { UserInSession } from '../models/model.userinsession';
import { UserInSessionStatus } from '../enums/user-in-session-status.enum';
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
import { MailService } from '../services/service.mail';

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
    private mailService: MailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async create(
    createPaymentMethodCardDto: CreatePaymentMethodCardDto,
    userId: string,
    stripePaymentId?: string,
  ) {
    const sessionId = createPaymentMethodCardDto.id_session;
    try {
      console.log('[PAYMENT METHOD CARD CREATE] Starting creation with data:', {
        userId,
        sessionId,
        stripePaymentId,
      });

      // Verify that the training session exists and get training price
      const trainingSession = await this.trainingSessionModel.findByPk(
        sessionId,
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
              id_session: sessionId,
              id_user: userId,
            },
          }),
          this.paymentMethodCpfModel.findOne({
            where: {
              id_session: sessionId,
              id_user: userId,
            },
          }),
          this.paymentMethodCardModel.findOne({
            where: {
              id_session: sessionId,
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
            sessionId: sessionId,
            userId: userId,
            message: frenchMessage,
          },
          customMessage: frenchMessage,
        });
      }

      let paymentMethodCard;
      try {
        paymentMethodCard = await this.paymentMethodCardModel.create({
          id_session: sessionId,
          id_stripe_payment: stripePaymentId || undefined, // Will be set later when Stripe payment is processed
          status: PaymentMethodCardStatus.PENDING, // Set to pending until payment is validated
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
              sessionId: sessionId,
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
        stripeFee: 0, // No fees for manual creation
        totalAmount: trainingPrice,
      };

      // Send email notification to user
      try {
        const user = await this.usersModel.findByPk(userId);
        if (user && user.email) {
          await this.mailService.sendMail({
            to: user.email,
            subject: 'Paiement par carte confirmé',
            content: this.mailService.templates({
              as: 'payment-card-success',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              cours: trainingSession.trainings?.title || 'Formation',
              basePrice: trainingPrice,
              stripeFee: 0, // No fees for manual creation
              totalAmount: trainingPrice,
            }),
          });
          console.log(
            '[PAYMENT METHOD CARD CREATE] ✅ Email notification sent to user:',
            user.email,
          );
        }
      } catch (emailError) {
        console.error(
          '[PAYMENT METHOD CARD CREATE] ⚠️ Failed to send email notification:',
          emailError,
        );
        // Don't fail the entire operation if email fails
      }

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
      console.error('[PAYMENT METHOD CARD CREATE] Request data:', {
        userId,
        sessionId,
        stripePaymentId,
      });

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
    userId: string,
  ) {
    try {
      console.log(
        '💳 [STRIPE PAYMENT INTENT] Creating payment intent for session:',
        stripePaymentIntentDto.id_session,
      );
      console.log(
        '🔍 [STRIPE PAYMENT INTENT] Request data:',
        JSON.stringify(stripePaymentIntentDto, null, 2),
      );

      // Validate environment variables
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new HttpException(
          'Stripe secret key not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Check for existing payment methods (Card, OPCO, CPF) for this user and session
      console.log(
        '🔍 [STRIPE PAYMENT INTENT] Checking for existing payment methods for user:',
        userId,
        'session:',
        stripePaymentIntentDto.id_session,
      );

      const [existingCardPayment, existingOpcoPayment, existingCpfPayment] =
        await Promise.all([
          this.paymentMethodCardModel.findOne({
            where: {
              id_session: stripePaymentIntentDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodOpcoModel.findOne({
            where: {
              id_session: stripePaymentIntentDto.id_session,
              id_user: userId,
            },
          }),
          this.paymentMethodCpfModel.findOne({
            where: {
              id_session: stripePaymentIntentDto.id_session,
              id_user: userId,
            },
          }),
        ]);

      if (existingCardPayment || existingOpcoPayment || existingCpfPayment) {
        console.log(
          '❌ [STRIPE PAYMENT INTENT] Duplicate payment method detected',
        );

        let existingPaymentType = 'Unknown';
        let frenchMessage =
          'Vous avez déjà une méthode de paiement pour cette session de formation.';

        if (existingCardPayment) {
          existingPaymentType = 'Carte';
          frenchMessage =
            'Vous avez déjà une méthode de paiement par carte pour cette session de formation.';
        } else if (existingOpcoPayment) {
          existingPaymentType = 'OPCO';
          frenchMessage =
            'Vous avez déjà une méthode de paiement OPCO pour cette session de formation.';
        } else if (existingCpfPayment) {
          existingPaymentType = 'CPF';
          frenchMessage =
            'Vous avez déjà une méthode de paiement CPF pour cette session de formation.';
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
            sessionId: stripePaymentIntentDto.id_session,
            userId: userId,
            message: frenchMessage,
          },
          customMessage: frenchMessage,
        });
      }

      console.log(
        '✅ [STRIPE PAYMENT INTENT] No existing payment methods found, proceeding with payment intent creation',
      );

      // Create the payment method card with PENDING status
      const createPaymentMethodCardDto: CreatePaymentMethodCardDto = {
        id_session: stripePaymentIntentDto.id_session,
      };
      try {
        await this.create(createPaymentMethodCardDto, userId, undefined);
        console.log(
          '✅ [STRIPE PAYMENT INTENT] Payment method card created with VALIDATED status',
        );
      } catch (error) {
        console.error(
          '❌ [STRIPE PAYMENT INTENT] Error creating payment method card:',
          error,
        );
        // Continue with payment intent creation even if card creation fails
      }

      // Fetch training session with training price
      console.log(
        '🔍 [STRIPE PAYMENT INTENT] Fetching training session with ID:',
        stripePaymentIntentDto.id_session,
      );

      const trainingSession = await this.trainingSessionModel.findByPk(
        stripePaymentIntentDto.id_session,
        {
          include: [
            {
              model: this.trainingModel,
              as: 'trainings',
              attributes: ['prix'],
            },
          ],
        },
      );

      console.log(
        '🔍 [STRIPE PAYMENT INTENT] Training session found:',
        trainingSession ? 'Yes' : 'No',
      );

      if (trainingSession) {
        console.log(
          '🔍 [STRIPE PAYMENT INTENT] Training data:',
          JSON.stringify(trainingSession.trainings, null, 2),
        );
      }

      if (!trainingSession) {
        throw new HttpException(
          'Training session not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!trainingSession.trainings?.prix) {
        throw new HttpException(
          'Training price not found for this session',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate Stripe fees (1.4% + €0.25 per transaction for European cards)
      const basePrice = Number(trainingSession.trainings.prix);

      if (isNaN(basePrice) || basePrice <= 0) {
        throw new HttpException(
          'Invalid training price value',
          HttpStatus.BAD_REQUEST,
        );
      }

      const stripeFeePercentage = 0.014; // 1.4%
      const stripeFixedFee = 0.25; // €0.25
      const stripeFee = Number(
        (basePrice * stripeFeePercentage + stripeFixedFee).toFixed(2),
      );
      const totalAmount = Number((basePrice + stripeFee).toFixed(2));

      // Convert total amount to cents for Stripe
      const amountInCents = Math.round(totalAmount * 100);

      console.log(
        '💰 [STRIPE PAYMENT INTENT] Price breakdown:',
        'Base price:',
        basePrice,
        'EUR',
        'Stripe fee:',
        stripeFee.toFixed(2),
        'EUR',
        'Total amount:',
        totalAmount.toFixed(2),
        'EUR (',
        amountInCents,
        'cents)',
      );

      // Create Stripe Payment Intent with metadata for webhook processing
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          sessionId: stripePaymentIntentDto.id_session,
          userId: userId,
        },
      });

      console.log(
        '✅ [STRIPE PAYMENT INTENT] Payment intent created successfully:',
        paymentIntent.id,
      );

      // Update the payment method card with the Stripe payment intent ID
      const paymentMethodCard = await this.paymentMethodCardModel.findOne({
        where: {
          id_session: stripePaymentIntentDto.id_session,
          id_user: userId,
        },
      });

      if (paymentMethodCard) {
        await paymentMethodCard.update({
          id_stripe_payment: paymentIntent.id,
        });
        console.log(
          '✅ [STRIPE PAYMENT INTENT] Payment method card updated with Stripe ID:',
          paymentIntent.id,
        );
      }

      // Send email notification immediately after payment intent creation
      console.log('📧 [STRIPE PAYMENT INTENT] Sending email notification...');
      await this.mailService.sendPaymentConfirmationEmail(
        stripePaymentIntentDto.id_session,
        userId,
      );

      // Create UserInSession if not exists
      console.log(
        '📋 [STRIPE PAYMENT INTENT] Creating UserInSession if not exists...',
      );
      const existingUserInSession = await UserInSession.findOne({
        where: {
          id_user: userId,
          id_session: stripePaymentIntentDto.id_session,
        },
      });

      if (!existingUserInSession) {
        console.log(
          '✅ [USER IN SESSION] Creating new UserInSession with IN status',
        );
        await UserInSession.create({
          id_user: userId,
          id_session: stripePaymentIntentDto.id_session,
          status: UserInSessionStatus.IN,
        });
      } else {
        console.log(
          'ℹ️ [USER IN SESSION] UserInSession already exists, skipping creation',
        );
      }

      const response = Responder({
        status: HttpStatusCode.Ok,
        data: {
          clientSecret: paymentIntent.client_secret || '',
          basePrice: basePrice,
          stripeFee: stripeFee,
          totalAmount: totalAmount,
          amountInCents: amountInCents,
        },
        customMessage: 'Stripe Payment Intent created successfully',
      });

      console.log(
        '✅ [STRIPE PAYMENT INTENT] Response prepared:',
        JSON.stringify(response, null, 2),
      );

      return response;
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

  async getStripePaymentIntentStatus(paymentIntentId: string, userId?: string) {
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

      // If payment succeeded and we have the necessary data, automatically create payment method card
      if (
        paymentIntent.status === 'succeeded' &&
        userId &&
        paymentIntent.metadata?.sessionId
      ) {
        console.log(
          '🔄 [STRIPE PAYMENT INTENT] Payment succeeded, checking if payment method card exists...',
        );

        // Check if payment method card already exists
        const existingPaymentMethod = await this.paymentMethodCardModel.findOne(
          {
            where: {
              id_session: paymentIntent.metadata.sessionId,
              id_user: userId,
            },
          },
        );

        if (!existingPaymentMethod) {
          console.log(
            '🔄 [STRIPE PAYMENT INTENT] Creating payment method card automatically...',
          );
          try {
            await this.createPaymentMethodCardAfterPayment(
              paymentIntent.metadata.sessionId,
              userId,
              paymentIntentId,
            );
            console.log(
              '✅ [STRIPE PAYMENT INTENT] Payment method card created automatically',
            );
          } catch (error) {
            console.error(
              '❌ [STRIPE PAYMENT INTENT] Error creating payment method card automatically:',
              error,
            );
            // Don't throw error, just log it and continue
          }
        } else {
          console.log(
            'ℹ️ [STRIPE PAYMENT INTENT] Payment method card already exists, skipping creation',
          );
        }
      }

      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          status: paymentIntent.status,
        },
        customMessage: 'Payment intent status retrieved successfully',
      });
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

  // Validate Stripe payment intent
  private async validateStripePayment(
    stripePaymentIntentId: string,
    sessionId: string,
    userId: string,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log(
        '🔍 [PAYMENT VALIDATION] Starting Stripe payment validation...',
      );
      console.log('  - Payment Intent ID:', stripePaymentIntentId);
      console.log('  - Session ID:', sessionId);
      console.log('  - User ID:', userId);

      // Step 1: Retrieve payment intent from Stripe
      console.log(
        '🔍 [PAYMENT VALIDATION] Retrieving payment intent from Stripe...',
      );
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      console.log('🔍 [PAYMENT VALIDATION] Payment intent retrieved:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      });

      // Step 2: Check payment intent status
      if (paymentIntent.status !== 'succeeded') {
        console.log(
          '❌ [PAYMENT VALIDATION] Payment intent status is not succeeded:',
          paymentIntent.status,
        );
        return {
          isValid: false,
          error:
            "Le paiement n'a pas été validé avec succès. Statut: " +
            paymentIntent.status,
        };
      }

      // Step 3: Verify payment intent metadata matches our session and user
      const metadataSessionId = paymentIntent.metadata?.sessionId;
      const metadataUserId = paymentIntent.metadata?.userId;

      if (metadataSessionId !== sessionId) {
        console.log('❌ [PAYMENT VALIDATION] Session ID mismatch:', {
          expected: sessionId,
          actual: metadataSessionId,
        });
        return {
          isValid: false,
          error:
            'Le paiement ne correspond pas à la session de formation sélectionnée.',
        };
      }

      if (metadataUserId !== userId) {
        console.log('❌ [PAYMENT VALIDATION] User ID mismatch:', {
          expected: userId,
          actual: metadataUserId,
        });
        return {
          isValid: false,
          error: "Le paiement ne correspond pas à l'utilisateur connecté.",
        };
      }

      // Step 4: Get training session and verify price
      console.log(
        '🔍 [PAYMENT VALIDATION] Verifying training session and price...',
      );
      const trainingSession = await this.trainingSessionModel.findByPk(
        sessionId,
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
        console.log(
          '❌ [PAYMENT VALIDATION] Training session not found:',
          sessionId,
        );
        return {
          isValid: false,
          error: "La session de formation n'a pas été trouvée.",
        };
      }

      const trainingPrice = trainingSession.trainings?.prix || 0;
      console.log('🔍 [PAYMENT VALIDATION] Training price:', trainingPrice);

      // Step 5: Calculate expected amount (including Stripe fees)
      const basePrice = Number(trainingPrice);
      if (isNaN(basePrice) || basePrice <= 0) {
        console.log(
          '❌ [PAYMENT VALIDATION] Invalid training price:',
          trainingPrice,
        );
        return {
          isValid: false,
          error: "Le prix de la formation n'est pas valide.",
        };
      }

      const stripeFeePercentage = 0.014; // 1.4%
      const stripeFixedFee = 0.25; // €0.25
      const stripeFee = Number(
        (basePrice * stripeFeePercentage + stripeFixedFee).toFixed(2),
      );
      const expectedTotalAmount = Number((basePrice + stripeFee).toFixed(2));
      const expectedAmountInCents = Math.round(expectedTotalAmount * 100);

      console.log('🔍 [PAYMENT VALIDATION] Amount verification:', {
        basePrice,
        stripeFee,
        expectedTotalAmount,
        expectedAmountInCents,
        actualAmount: paymentIntent.amount,
      });

      // Step 6: Verify payment amount matches expected amount
      if (paymentIntent.amount !== expectedAmountInCents) {
        console.log('❌ [PAYMENT VALIDATION] Amount mismatch:', {
          expected: expectedAmountInCents,
          actual: paymentIntent.amount,
        });
        return {
          isValid: false,
          error: `Le montant du paiement ne correspond pas au prix de la formation. Montant attendu: ${expectedTotalAmount}€, Montant payé: ${(paymentIntent.amount / 100).toFixed(2)}€`,
        };
      }

      // Step 7: Verify currency
      if (paymentIntent.currency !== 'eur') {
        console.log(
          '❌ [PAYMENT VALIDATION] Currency mismatch:',
          paymentIntent.currency,
        );
        return {
          isValid: false,
          error: "La devise du paiement n'est pas valide. Devise attendue: EUR",
        };
      }

      console.log(
        '✅ [PAYMENT VALIDATION] All validations passed successfully',
      );
      return { isValid: true };
    } catch (error) {
      console.log('❌ [PAYMENT VALIDATION] Validation error:', error.message);
      console.log('❌ [PAYMENT VALIDATION] Error stack:', error.stack);

      if (error.type === 'StripeInvalidRequestError') {
        return {
          isValid: false,
          error: "Le paiement Stripe n'est pas valide ou a expiré.",
        };
      }

      return {
        isValid: false,
        error:
          'Une erreur est survenue lors de la validation du paiement. Veuillez réessayer.',
      };
    }
  }

  // Create payment method card after successful Stripe payment
  async createPaymentMethodCardAfterPayment(
    sessionId: string,
    userId: string,
    stripePaymentIntentId: string,
  ) {
    try {
      console.log(
        '💳 [PAYMENT METHOD CARD] Creating payment method card after successful payment',
      );
      console.log('📋 [PAYMENT METHOD CARD] Parameters:');
      console.log('  - Session ID:', sessionId);
      console.log('  - User ID:', userId);
      console.log('  - Stripe Payment Intent ID:', stripePaymentIntentId);
      console.log(
        '📋 [PAYMENT METHOD CARD] Starting validation and database operations...',
      );

      // Step 1: Validate Stripe payment intent
      console.log(
        '🔍 [PAYMENT VALIDATION] Validating Stripe payment intent...',
      );
      const paymentValidation = await this.validateStripePayment(
        stripePaymentIntentId,
        sessionId,
        userId,
      );

      if (!paymentValidation.isValid) {
        console.log(
          '❌ [PAYMENT VALIDATION] Payment validation failed:',
          paymentValidation.error,
        );
        console.log(
          '❌ [PAYMENT VALIDATION] No PaymentMethodCard or UserInSession records will be created',
        );

        // Send failure email to inform the user
        console.log(
          '📧 [PAYMENT VALIDATION] Sending payment failure email to user...',
        );
        try {
          await this.mailService.sendPaymentFailureEmail(
            sessionId,
            userId,
            paymentValidation.error ||
              'Une erreur est survenue lors de la validation du paiement',
          );
          console.log(
            '✅ [PAYMENT VALIDATION] Payment failure email sent successfully',
          );
        } catch (emailError) {
          console.error(
            '❌ [PAYMENT VALIDATION] Failed to send payment failure email:',
            emailError,
          );
          // Continue with the error response even if email fails
        }

        return Responder({
          status: HttpStatusCode.BadRequest,
          data: {
            error: paymentValidation.error,
            paymentIntentId: stripePaymentIntentId,
            recordsCreated: false,
            message:
              "Aucun enregistrement n'a été créé en raison de l'échec de la validation du paiement. Un email d'information a été envoyé.",
          },
          customMessage: paymentValidation.error,
        });
      }

      console.log('✅ [PAYMENT VALIDATION] Payment validation successful');
      console.log(
        '📋 [PAYMENT METHOD CARD] Starting database operations - records will be created only after successful validation...',
      );

      // Check if payment method card already exists
      const existingPaymentMethod = await this.paymentMethodCardModel.findOne({
        where: {
          id_session: sessionId,
          id_user: userId,
        },
      });

      if (existingPaymentMethod) {
        console.log(
          '⚠️ [PAYMENT METHOD CARD] Payment method card already exists, updating Stripe payment ID',
        );

        await existingPaymentMethod.update({
          id_stripe_payment: stripePaymentIntentId,
          status: PaymentMethodCardStatus.VALIDATED,
        });

        // Send email notification for existing payment method update
        console.log(
          '📧 [PAYMENT METHOD CARD] About to send email for existing payment method...',
        );
        await this.mailService.sendPaymentConfirmationEmail(sessionId, userId);
        console.log(
          '📧 [PAYMENT METHOD CARD] Email sending completed for existing payment method',
        );

        // Reduce available places for the training session
        await this.reduceAvailablePlaces(sessionId);

        return Responder({
          status: HttpStatusCode.Ok,
          data: existingPaymentMethod,
          customMessage: 'Payment method card updated successfully',
        });
      }

      // Create new payment method card with validated status (payment has been validated)
      const paymentMethodCard = await this.paymentMethodCardModel.create({
        id_session: sessionId,
        id_user: userId,
        id_stripe_payment: stripePaymentIntentId,
        status: PaymentMethodCardStatus.VALIDATED, // Only set to validated after successful payment validation
      });

      console.log(
        '✅ [PAYMENT METHOD CARD] Payment method card created successfully:',
        paymentMethodCard.id,
      );

      // Send email notification for new payment method
      console.log(
        '📧 [PAYMENT METHOD CARD] About to send email for new payment method...',
      );
      await this.mailService.sendPaymentConfirmationEmail(sessionId, userId);
      console.log(
        '📧 [PAYMENT METHOD CARD] Email sending completed for new payment method',
      );

      // Reduce available places for the training session
      await this.reduceAvailablePlaces(sessionId);

      // Create or update UserInSession
      console.log(
        '📋 [PAYMENT METHOD CARD] Creating/updating UserInSession...',
      );
      const { UserInSession } = await import('../models/model.userinsession');
      const { UserInSessionStatus } = await import(
        '../enums/user-in-session-status.enum'
      );
      console.log(
        '📋 [PAYMENT METHOD CARD] UserInSession models imported successfully',
      );

      const existingUserInSession = await UserInSession.findOne({
        where: {
          id_user: userId,
          id_session: sessionId,
        },
      });

      if (existingUserInSession) {
        console.log(
          '⚠️ [USER IN SESSION] UserInSession already exists, updating status to IN',
        );
        await existingUserInSession.update({
          status: UserInSessionStatus.IN,
        });
      } else {
        console.log(
          '✅ [USER IN SESSION] Creating new UserInSession with IN status',
        );
        await UserInSession.create({
          id_user: userId,
          id_session: sessionId,
          status: UserInSessionStatus.IN,
        });
      }

      return Responder({
        status: HttpStatusCode.Created,
        data: paymentMethodCard,
        customMessage:
          'Payment method card and user session created successfully',
      });
    } catch (error) {
      console.error(
        '❌ [PAYMENT METHOD CARD] Error creating payment method card after payment:',
        error,
      );

      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log(
          '❌ [PAYMENT METHOD CARD] Duplicate payment method detected via database constraint',
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
            sessionId: sessionId,
            userId: userId,
            message:
              'Vous avez déjà une méthode de paiement par carte pour cette session de formation.',
          },
          customMessage:
            'Vous avez déjà une méthode de paiement par carte pour cette session de formation.',
        });
      }

      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: { message: error.message },
        customMessage: 'Failed to create payment method card after payment',
      });
    }
  }

  // Stripe Webhook Event Construction
  constructWebhookEvent(body: any, signature: string, secret: string) {
    try {
      return this.stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      console.error(
        '❌ [STRIPE WEBHOOK] Error constructing webhook event:',
        error,
      );
      throw error;
    }
  }

  // Reduce available places for training session when payment is successful
  private async reduceAvailablePlaces(sessionId: string) {
    if (!this.trainingSessionModel.sequelize) {
      console.error('❌ [AVAILABLE PLACES] Sequelize instance not available');
      return;
    }

    const transaction = await this.trainingSessionModel.sequelize.transaction();

    try {
      console.log(
        '📊 [AVAILABLE PLACES] Reducing available places for session:',
        sessionId,
      );

      // Lock the training session row to prevent race conditions
      const trainingSession = await this.trainingSessionModel.findByPk(
        sessionId,
        {
          lock: transaction.LOCK.UPDATE,
          transaction,
        },
      );

      if (!trainingSession) {
        console.error(
          '❌ [AVAILABLE PLACES] Training session not found:',
          sessionId,
        );
        await transaction.rollback();
        return;
      }

      const currentAvailablePlaces = trainingSession.available_places;

      if (currentAvailablePlaces <= 0) {
        console.warn(
          '⚠️ [AVAILABLE PLACES] No available places left for session:',
          sessionId,
        );
        await transaction.rollback();
        return;
      }

      const newAvailablePlaces = currentAvailablePlaces - 1;

      await trainingSession.update(
        {
          available_places: newAvailablePlaces,
        },
        { transaction },
      );

      await transaction.commit();

      console.log(
        '✅ [AVAILABLE PLACES] Successfully reduced available places:',
        `${currentAvailablePlaces} → ${newAvailablePlaces}`,
        'for session:',
        sessionId,
      );
    } catch (error) {
      await transaction.rollback();
      console.error(
        '❌ [AVAILABLE PLACES] Failed to reduce available places for session:',
        sessionId,
        'Error:',
        error,
      );
      // Don't fail the entire operation if available places update fails
    }
  }
}
