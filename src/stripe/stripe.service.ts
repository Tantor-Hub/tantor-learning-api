import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Stripe from 'stripe';
import { Payement } from '../models/model.payementbycard';
import { Payementopco } from '../models/model.payementbyopco';
import { Users } from '../models/model.users';
import { AllSercices } from '../services/serices.all';
import { MailService } from '../services/service.mail';
import { Responder } from '../strategy/strategy.responder';
import { HttpStatusCode } from '../config/config.statuscodes';
import { IJwtSignin } from '../interface/interface.payloadjwtsignin';
import { CreatePaymentSessionDto } from '../dto/payement-methode.dto';
import { PayementOpcoDto } from '../dto/payement-opco.dto';
import { ResponseServer } from '../interface/interface.response';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class StripeService {
  constructor(
    @InjectModel(Payement)
    private readonly payementModel: typeof Payement,
    @InjectModel(Payementopco)
    private readonly payementOpcoModel: typeof Payementopco,
    @InjectModel(Users)
    private readonly usersModel: typeof Users,
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly allServices: AllSercices,
    private readonly serviceMail: MailService,
    @Inject(Sequelize) private readonly sequelize: Sequelize,
  ) {}

  async createPaymentIntent(
    createPaymentDto: CreatePaymentSessionDto,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        payment_method_types: ['card'],
        metadata: {
          userId: user.id_user.toString(),
          sessionId: createPaymentDto.session_id.toString(),
        },
      });
      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: 'Failed to create payment intent',
      });
    }
  }

  async payementSession(
    student: IJwtSignin,
    payementSessionDto: CreatePaymentSessionDto,
  ): Promise<ResponseServer> {
    console.log(
      'Starting payementSession for user:',
      student.id_user,
      'with DTO:',
      payementSessionDto,
    );
    const {
      session_id,
      user_id,
      full_name,
      card_number,
      month,
      year,
      cvv,
      id_stripe_payment,
    } = payementSessionDto;
    console.log(
      'Destructured DTO: session_id:',
      session_id,
      'user_id:',
      user_id,
    );
    try {
      console.log('Finding session with id:', session_id);
      // TODO: Implement session lookup when Session model is properly integrated
      const sess: any = null; // await this.sessionModel.findOne({ where: { id: session_id } });
      console.log('Session found:', sess ? 'yes' : 'no');
      if (!sess) {
        console.log('Session not found, returning NotFound');
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "La session ciblée n'a pas été retrouvé !",
        });
      }
      console.log(
        'Finding user session for session_id:',
        session_id,
        'and student:',
        student.id_user,
      );
      // TODO: Implement user session lookup when StagiaireHasSession model is restored
      const session: any = null; // await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: session_id, id_stagiaire: student.id_user } });
      console.log('User session found:', session ? 'yes' : 'no');
      console.log('Finding user with id:', student.id_user);
      const user = await this.usersModel.findOne({
        where: { id: student.id_user },
      });
      console.log('User found:', user ? 'yes' : 'no');
      if (!user) {
        console.log('User not found, returning NotFound');
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "L'utilisateur ciblé n'a pas été retrouvé !",
        });
      }
      if (!session) {
        console.log('User session not found, returning NotFound');
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "La session ciblée n'a pas été retrouvé !",
        });
      }
      console.log('Creating payment record...');
      return this.payementModel
        .create({
          id_session: session_id as number,
          id_session_student: (session?.id as number) || 0,
          id_user: student.id_user,
          full_name,
          card_number,
          amount: (sess?.prix as number) || 0,
          month,
          year,
          id_stripe_payment,
          cvv,
        })
        .then(async (payement) => {
          console.log(
            'Payment record created:',
            payement ? 'success' : 'failed',
          );
          if (payement instanceof Payement) {
            console.log('Sending payment confirmation email to:', user.email);
            const p = await this.serviceMail.onPayementSession({
              to: user.email,
              fullname: this.allServices.fullName({
                fs: user.fs_name,
                ls: user.ls_name,
              }),
              session: (sess?.designation as string) || 'Unknown Session',
              amount: (sess?.prix as number) || 0,
              currency: 'EUR',
            });
            console.log('Email sent successfully');
            console.log('Returning Created response');
            return Responder({
              status: HttpStatusCode.Created,
              data: payement,
            });
          } else {
            console.log(
              'Payment not instanceof Payement, returning BadRequest',
            );
            return Responder({
              status: HttpStatusCode.BadRequest,
              data: "La session ciblée n'a pas été retrouvé !",
            });
          }
        })
        .catch((err) => {
          console.log('Error in payment creation:', err);
          return Responder({
            status: HttpStatusCode.BadRequest,
            data: `Le paiement ne peut etre effectue qu'une seule fois pour session !`,
          });
        });
    } catch (error) {
      console.log('Outer try-catch error:', error);
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async payementByOpco(
    user: IJwtSignin,
    payementOpcoDto: PayementOpcoDto,
  ): Promise<ResponseServer> {
    const {
      session_id,
      user_id,
      nom_opco,
      nom_entreprise,
      siren,
      nom_responsable,
      telephone_responsable,
      email_responsable,
    } = payementOpcoDto;
    try {
      // TODO: Implement session lookup when Session model is properly integrated
      const sess: any = null; // await this.sessionModel.findOne({ where: { id: session_id } });
      if (!sess)
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "La session ciblée n'a pas été retrouvé !",
        });
      // TODO: Implement user session lookup when StagiaireHasSession model is restored
      const userSession: any = null; // await this.hasSessionStudentModel.findOne({ where: { id_sessionsuivi: session_id, id_stagiaire: user.id_user } });
      if (!userSession)
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "L'utilisateur ciblé n'a pas été retrouvé dans cette session !",
        });
      let student = await this.usersModel.findOne({
        where: { id: user.id_user },
        raw: true,
      });
      if (!student)
        return Responder({
          status: HttpStatusCode.NotFound,
          data: "L'utilisateur ciblé n'a pas été retrouvé !",
        });
      return this.payementOpcoModel
        .create({
          id_session: session_id,
          id_session_student: (userSession?.id as number) || 0,
          id_user: user.id_user,
          nom_opco,
          nom_entreprise,
          siren,
          nom_responsable,
          telephone_responsable,
          email_responsable,
        })
        .then(async (doc) => {
          if (doc instanceof Payementopco) {
            const p = await this.serviceMail.onPayementSession({
              to: student.email,
              fullname: this.allServices.fullName({
                fs: student.fs_name,
                ls: student.ls_name,
              }),
              session: (sess?.designation as string) || 'Unknown Session',
              amount: (sess?.prix as number) || 0,
              currency: 'EUR',
            });
            return Responder({ status: HttpStatusCode.Created, data: doc });
          } else {
            return Responder({
              status: HttpStatusCode.BadRequest,
              data: "Le document n'a pas pu être enregistré !",
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

  async validatePayment(
    id_payment: number,
    user: IJwtSignin,
  ): Promise<ResponseServer> {
    try {
      const payment = await this.payementModel.findOne({
        where: { id: id_payment },
      });
      if (!payment)
        return Responder({
          status: HttpStatusCode.NotFound,
          data: 'Payment not found or already validated',
        });
      if (payment.status === 1)
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Payment already validated',
        });
      payment.status = 1;
      await payment.save();
      // TODO: Implement user session update when StagiaireHasSession model is restored
      // this.hasSessionStudentModel.update(
      //   {
      //     id_payement: payment.id,
      //   },
      //   { where: { id: payment.id_session_student } },
      // );
      return Responder({ status: HttpStatusCode.Ok, data: payment });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async getPaymentsAll(
    user: IJwtSignin,
    status: number,
  ): Promise<ResponseServer> {
    try {
      if ([0, 1].indexOf(status) === -1)
        return Responder({
          status: HttpStatusCode.BadRequest,
          data: 'Invalid status only 0 or 1 are allowed',
        });
      const payments_cards = await this.payementModel.findAll({
        where: { status },
        subQuery: false,
        include: [
          {
            model: Users,
            required: true,
            attributes: ['id', 'fs_name', 'ls_name', 'email'],
          },
        ],
      });
      const payments_opco = await this.payementOpcoModel.findAll({
        where: { status },
        subQuery: false,
        include: [
          {
            model: Users,
            required: true,
            attributes: ['id', 'fs_name', 'ls_name', 'email'],
          },
        ],
      });
      return Responder({
        status: HttpStatusCode.Ok,
        data: {
          length: payments_cards.length + payments_opco.length,
          by_card: payments_cards,
          by_opco: payments_opco,
        },
      });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }

  async webhookStripePayment(event: Stripe.Event): Promise<ResponseServer> {
    try {
      if (
        event.type === 'payment_intent.succeeded' ||
        event.type === 'payment_intent.payment_failed'
      ) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const pay = await this.payementModel.findOne({
          where: { id_stripe_payment: paymentIntent.id },
        });

        if (pay instanceof Payement) {
          let newStatus = 0; // par défaut non payé

          switch (paymentIntent.status) {
            case 'succeeded':
              newStatus = 1; // payé
              break;
            case 'requires_payment_method':
            case 'requires_confirmation':
              newStatus = 0; // pas encore payé
              break;
            case 'requires_action':
            case 'processing':
              newStatus = 0; // en attente
              break;
            case 'canceled':
              newStatus = 2; // failed
              break;
            default:
              newStatus = 2; // failed (catch-all)
          }

          await pay.update({ status: newStatus });

          if (newStatus === 1) {
            // TODO: Implement user session update when StagiaireHasSession model is restored
            // await this.hasSessionStudentModel.update(
            //   { id_payement: pay.id, status: 1 },
            //   { where: { id: pay.id_session_student } },
            // );
          }
        }
      }

      return Responder({ status: HttpStatusCode.Ok, data: 'Event received' });
    } catch (error) {
      return Responder({
        status: HttpStatusCode.InternalServerError,
        data: error,
      });
    }
  }
}
