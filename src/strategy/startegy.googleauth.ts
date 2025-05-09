import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

    constructor(private readonly configService: ConfigService) {

        super({
            clientID: '206461527600-ujrn9lcik17mab9q8qn76qs8bvto4piv.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: String("https://tantor-learning.up.railway.app").concat('/api/users/auth/google/callback'),
            scope: ['email', 'profile'],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken
        };
        done(null, user);
    }
}
