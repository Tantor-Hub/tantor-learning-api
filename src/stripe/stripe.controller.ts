import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Req,
  Res,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentSessionDto } from '../dto/payement-methode.dto';
import { PayementOpcoDto } from '../sessions/dto/payement-method-opco.dto';
import { IJwtSignin } from '../interface/interface.payloadjwtsignin';
import { User } from '../strategy/strategy.globaluser';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
  ) {}

  @Post('payment/create-intent')
  async createPaymentIntent(
    @Body() createPaymentDto: CreatePaymentSessionDto,
    @User() user: IJwtSignin,
  ) {
    return this.stripeService.createPaymentIntent(createPaymentDto, user);
  }

  @Post('payment/card')
  async payementSession(
    @Body() payementSessionDto: CreatePaymentSessionDto,
    @User() user: IJwtSignin,
  ) {
    return this.stripeService.payementSession(user, payementSessionDto);
  }

  @Post('payment/opco')
  async payementByOpco(
    @Body() payementOpcoDto: PayementOpcoDto,
    @User() user: IJwtSignin,
  ) {
    return this.stripeService.payementByOpco(user, payementOpcoDto);
  }

  @Put('payment/validate/:idpayment')
  async validatePayment(
    @Param('idpayment') id_payment: number,
    @User() user: IJwtSignin,
  ) {
    return this.stripeService.validatePayment(id_payment, user);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Res() res: any) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

    try {
      const event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret,
      );

      const result = await this.stripeService.webhookStripePayment(event);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
