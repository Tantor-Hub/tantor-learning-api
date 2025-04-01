import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('APPSMTPHOST'),
            port: this.configService.get<number>('APPSMTPPORT'),
            secure: this.configService.get<boolean>('APPSMTPSECURE'),
            auth: {
                user: this.configService.get<string>('APPSMTPUSER'),
                pass: this.configService.get<string>('APPSMTPPASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, content: string): Promise<{ code: number, message: string, data: any }> {
        return new Promise(async (resolve, reject) => {
            const mailOptions = {
                from: `"${this.configService.get<string>('APPNAME')}" <${this.configService.get<string>('APPSMTPUSER')}>`,
                to,
                subject: subject || 'Configuration',
                html: content,
            };

            try {
                const info = await this.transporter.sendMail(mailOptions);
                return resolve({ code: 200, message: 'Email envoyé', data: info.messageId });
            } catch (error) {
                return reject({ code: 500, message: 'Erreur', data: error });
            }
        })
    }
}
