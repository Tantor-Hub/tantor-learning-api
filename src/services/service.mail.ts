import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AllSercices } from './serices.all';
import { IAliasMail } from 'src/interface/interface.aliastemplatemail';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private baseURL: string
    constructor(private configService: ConfigService, private readonly allSercices: AllSercices) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: this.configService.get<string>('APPSMTPUSER'),
                pass: this.configService.get<string>('APPSMTPPASS'),
            },
        });
        this.baseURL = this.configService.get<string>('APPBASEURLFRONT') as string;
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

    templates({ as, nom, postnom, cours, dateOn, prixCours, code }: { as: string, nom?: string, postnom?: string, cours?: string, dateOn?: string, prixCours?: string, code?: string }): string {
        const color = this.configService.get<string>('APPPRIMARYCOLOR')
        const appname = this.configService.get<string>('APPNAME')
        const appowner = this.configService.get<string>('APPOWNER')
        const url = this.baseURL;
        
        switch (as) {
            case 'otp':
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
                            color: #${color};
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
                <div class="content">
                <p>Bonjour <strong>${nom}</strong>,</p>
                <p>Nous avons reçu une démande de renvoie de code de verification. voici votre de vérification</p>
        
                <div class="info">
                <div class="footer">
                <h1><strong>${code}</strong></h1>
                </div>
                </div>
        
                <p>Gardez ces informations confidentielles et utilisez-les pour accéder à nos services. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
                <p>Merci pour votre confiance.</p>
            </div>
                        <div class="footer">
                            <p>Cordialement,</p>
                            <p><strong>${appowner} (${appname})</strong></p>
                            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
                        </div>
                    </div>
                </body>
                </html>
                    `)
                break;
            case 'welcome':
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
            color: #${color};
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
            <h1>Bonjour, ${this.allSercices.capitalizeWords({ text: nom })} ${this.allSercices.capitalizeWords({ text: postnom })}!</h1>
        </div>
        <div class="content">
        <p>Bonjour <span class="highlight">${this.allSercices.capitalizeWords({ text: nom })}</span>,</p>
        <p>Nous sommes ravis de vous accueillir sur <strong>Tantor E-Learning</strong>, votre plateforme d'apprentissage en ligne.</p>
        <p>Chez <strong>Tantor E-Learning</strong>, nous croyons que l'accès à la connaissance ne doit pas être limité par le temps ou l'espace. C'est pourquoi nous avons conçu une plateforme intuitive et riche en contenus de qualité pour vous accompagner dans votre apprentissage.</p>
        <p>Pourquoi lire et apprendre en ligne ? Voici quelques avantages :</p>
        <ul>
            <li>Accédez à vos cours et ressources où que vous soyez, à tout moment.</li>
            <li>Apprenez à votre propre rythme, sans pression ni contraintes.</li>
            <li>Bénéficiez d'une large gamme de contenus interactifs, allant des vidéos aux quiz et exercices pratiques.</li>
            <li>Économisez du temps en évitant les déplacements et optimisez votre organisation.</li>
        </ul>
        <p><strong>Notre point fort :</strong> Une gestion du temps optimisée pour un apprentissage plus efficace. Grâce à notre système intelligent, vous pouvez suivre vos progrès, fixer vos objectifs et adapter votre emploi du temps pour maximiser vos résultats.</p>
        <p>De plus, notre équipe de formateurs expérimentés est là pour répondre à vos questions et vous aider à surmonter vos difficultés. Vous ne serez jamais seul dans votre parcours !</p>
        <p>Explorez notre bibliothèque de cours et commencez votre voyage vers la connaissance dès maintenant. Développez de nouvelles compétences, obtenez des certifications et donnez un nouvel élan à votre carrière ou votre passion !</p>
        <a href="${url}" class="button">Accéder à votre espace</a>
    </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>${appowner} (${appname})</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
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
