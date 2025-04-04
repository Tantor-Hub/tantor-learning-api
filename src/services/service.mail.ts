import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AllSercices } from './serices.all';
import { IAliasMail } from 'src/interface/interface.aliastemplatemail';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService, private readonly allSercices: AllSercices) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: this.configService.get<string>('APPSMTPUSER'),
                pass: this.configService.get<string>('APPSMTPPASS'),
            },
        });
        // this.transporter = nodemailer.createTransport({
        //     host: this.configService.get<string>('APPSMTPHOST'),
        //     port: this.configService.get<number>('APPSMTPPORT'),
        //     secure: false, // this.configService.get<boolean>('APPSMTPSECURE'),
        //     auth: {
        //         user: this.configService.get<string>('APPSMTPUSER'),
        //         pass: this.configService.get<string>('APPSMTPPASS'),
        //     },
        //     tls: {
        //         rejectUnauthorized: false
        //     }
        // });
    }

    templates({ as, nom, postnom, cours, dateOn, prixCours }: { as: string, nom?: string, postnom?: string, cours?: string, dateOn?: string, prixCours?: string }): string {
        switch (as) {
            case 'welcome':
                const color = this.configService.get<string>('APPPRIMARYCOLOR')
                const appname = this.configService.get<string>('APPNAME')
                const appowner = this.configService.get<string>('APPOWNER')
                return (`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #${color};
            padding: 20px;
            color: #ffffff;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .content p {
            margin: 10px 0;
        }
        .content .highlight {
            font-weight: bold;
            color: #4CAF50;
        }
        .footer {
            background: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            font-size: 16px;
            color: #ffffff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
    <title>Bienvenue chez BSS</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Bonjour, ${this.allSercices.capitalizeWords({ text: nom })}!</h1>
        </div>
        <div class="content">
            <p>Bonjour <span class="highlight">${this.allSercices.capitalizeWords({ text: nom })}</span>,</p>
            <p>Félicitations pour la finalisation de la journée, nous tenons à vous informer que la liste des ventes est vide en date du ${dateOn}</p>

            <p>N'hésitez pas à nous contacter pour toute assistance complémentaire.</p>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>${appowner} (${appname})</strong></p>
            <p><em>"Votre partenaire pour une gestion efficace."</em></p>
        </div>
    </div>
</body>
</html>
    `)
                break;
            default:
                return this.configService.get<string>('APPSMTPUSER') || ""
                break;
        }
    }

    async sendMail({ to, subject, content }: { to: string, subject: string, content: string }): Promise<{ code: number, message: string, data: any }> {
        return new Promise(async (resolve, reject) => {
            try {
                const mailOptions = {
                    from: `"${this.configService.get<string>('APPNAME')}" <${this.configService.get<string>('APPSMTPUSER')}>`,
                    to,
                    subject: subject || 'Configuration',
                    html: content,
                };
                const info = await this.transporter.sendMail(mailOptions);
                return resolve({ code: 200, message: 'Email envoyé', data: info.messageId });
            } catch (error) {
                return reject({ code: 500, message: 'Erreur', data: error });
            }
        })
    };
}
