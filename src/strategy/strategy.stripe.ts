import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Module({
    providers: [
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                // this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '');
                return new Stripe(configService.get<string>('STRIPE_SECRET_KEY') || '');
            },
            inject: [ConfigService],
        },
    ],
    exports: ['STRIPE_CLIENT'],
})
export class StripeModule { }
