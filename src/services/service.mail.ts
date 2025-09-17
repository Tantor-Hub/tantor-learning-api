import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AllSercices } from './serices.all';
import { log } from 'console';
import { IInternalResponse } from 'src/interface/interface.internalresponse';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { Buffer } from 'buffer';
import { GoogleDriveService } from './service.googledrive';
import * as fs from 'fs';
import { join } from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as htmlDocx from 'html-docx-js';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private baseURL: string;
  constructor(
    private configService: ConfigService,
    private readonly allSercices: AllSercices,
    private readonly googleDriveService: GoogleDriveService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('APPSMTPUSER'),
        pass: this.configService.get<string>('APPSMTPPASS'),
      },
    });
    this.baseURL = this.configService.get<string>('APPBASEURLFRONT') as string;
  }
  private async generateDocumentFromHtml(
    htmlContent: string,
    format: 'pdf' | 'docx' = 'pdf',
  ): Promise<{ buffer: Buffer; mime: string; extension: string }> {
    if (format === 'pdf') {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      return {
        buffer: Buffer.from(pdfBuffer),
        mime: 'application/pdf',
        extension: 'pdf',
      };
    }

    if (format === 'docx') {
      const textOnly = htmlContent.replace(/<[^>]+>/g, '').trim();
      const doc = new Document({
        sections: [
          {
            children: [new Paragraph(textOnly)],
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);

      return {
        buffer: docxBuffer,
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: 'docx',
      };
    }

    throw new Error(`Format ${format} non supporté`);
  }
  templates({
    as,
    nom,
    postnom,
    cours,
    dateOn,
    prixCours,
    code,
  }: {
    as: string;
    nom?: string;
    postnom?: string;
    cours?: string;
    dateOn?: string;
    prixCours?: string;
    code?: string;
  }): string {
    const color = this.configService.get<string>('APPPRIMARYCOLOR');
    const appname = this.configService.get<string>('APPNAME');
    const appowner = this.configService.get<string>('APPOWNER');
    const url = this.baseURL;

    switch (as) {
      case 'otp':
        return `
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
                <p>Nous avons reçu une démande de renvoie de code de vérification. voici votre de vérification</p>
        
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
                    `;
        break;
      case 'welcome':
        return `
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
            background-color: #${color};
            width: 100%;
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
        <p>Nous sommes ravis de vous accueillir sur <strong>${appname}</strong>, votre plateforme d'apprentissage en ligne.</p>
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
    `;
        break;
      case 'addformationtoenseignant':
        return '';
        break;
      default:
        return this.configService.get<string>('APPSMTPUSER') || '';
        break;
    }
  }
  async sendMail({
    to,
    subject,
    content,
    attachments,
  }: {
    to: string;
    subject: string;
    content: string;
    attachments?: any[];
  }): Promise<IInternalResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const mailOptions = {
          from: `"${this.configService.get<string>('APPNAME')}" <${this.configService.get<string>('APPSMTPUSER')}>`,
          to,
          subject: (subject || 'Configuration').toUpperCase(),
          html: content,
          attachments,
        };
        const info = await this.transporter.sendMail(mailOptions);
        log('[ Status Mail ] ', info.messageId);
        return resolve({
          code: 200,
          message: 'Email envoyé',
          data: info.messageId,
        });
      } catch (error) {
        return reject({ code: 500, message: 'Erreur', data: error });
      }
    });
  }
  async generateDocxFromHtml(
    htmlContent: string,
  ): Promise<{ buffer: Buffer; mime: string; extension: string }> {
    const docxBuffer = htmlDocx.asBlob(htmlContent) as Buffer;
    return {
      buffer: Buffer.from(docxBuffer),
      mime: 'application/pdf',
      extension: 'pdf',
    };
  }
  async onWelcomeToSessionStudent({
    to,
    session_name,
    formation_name,
    fullname,
    asAttachement,
  }: {
    to: string;
    session_name?: string;
    formation_name?: string;
    fullname?: string;
    asAttachement?: boolean;
  }): Promise<IInternalResponse> {
    try {
      const appname = this.configService.get<string>('APPNAME');
      const appowner = this.configService.get<string>('APPOWNER');
      const brut_welcome = join(
        __dirname,
        '../../src',
        'templates',
        'template.welcomenewsession.html',
      );
      const brut_roi = join(
        __dirname,
        '../../src',
        'templates',
        'template.roi.html',
      );
      const brut_anab = join(
        __dirname,
        '../../src',
        'templates',
        'template.analysedesbesoins.html',
      );
      const brut_convention = join(
        __dirname,
        '../../src',
        'templates',
        'template.conventiondeformation.html',
      );

      const html_convention = fs.readFileSync(brut_convention, 'utf8');
      const html_welcome = fs.readFileSync(brut_welcome, 'utf8');
      const html_anab = fs.readFileSync(brut_anab, 'utf8');
      const html_roi = fs.readFileSync(brut_roi, 'utf8');

      const template_welocme = Handlebars.compile(html_welcome);
      const template_roi = Handlebars.compile(html_roi);
      const template_anab = Handlebars.compile(html_anab);
      const template_convention = Handlebars.compile(html_convention);

      const content_welcome = template_welocme({
        fullname,
        session_name,
        formation_name,
        appowner,
        appname,
      });

      const content_roi = template_roi({
        fullname,
        appowner,
        appname,
      });

      const content_convention = template_convention({
        // fullname,
        appowner,
        appname,
      });

      const content_anab = template_anab({
        // fullname,
        appowner,
        appname,
      });

      let attachement: any = null;
      if (asAttachement && asAttachement === true) {
        const { buffer, extension, mime } = await this.generateDocumentFromHtml(
          content_welcome,
          'pdf',
        );
        attachement = {
          filename: `${session_name}-${fullname}.${extension}`,
          content: buffer,
          contentType: mime,
        };
      }
      return this.sendMail({
        to,
        content: content_welcome,
        subject:
          `Inscription réussie à la formation ${formation_name} | ${session_name}`.toUpperCase(),
        attachments: asAttachement ? [attachement] : undefined,
      })
        .then(async (_) => {
          const { buffer, extension, mime } =
            await this.generateDocumentFromHtml(content_roi, 'pdf');
          const anab = await this.generateDocumentFromHtml(content_anab, 'pdf');
          const convention = await this.generateDocumentFromHtml(
            content_convention,
            'pdf',
          );

          this.sendMail({
            to,
            content: content_roi,
            subject: 'RÈGLEMENT INTÉRIEUR DU CENTRE DE FORMATION'.toLowerCase(),
            attachments: [
              {
                filename: `règlement-d-ordre-intérieur-${session_name}-${fullname}.${extension}`,
                content: buffer,
                contentType: mime,
              },
            ],
          });

          this.sendMail({
            to,
            content: content_convention,
            subject: 'CONVENTION DE FORMATION PROFESSIONNELLE'.toLowerCase(),
            attachments: [
              {
                filename: `convention-${session_name}-${fullname}.${extension}`,
                content: convention.buffer,
                contentType: convention.mime,
              },
            ],
          });

          this.sendMail({
            to,
            content: content_anab,
            subject:
              'QUESTIONNAIRE D’IDENTIFICATION DES BESOINS POUR LES PERSONNES EN SITUATION DE HANDICAP (PSH)'.toLowerCase(),
            attachments: [
              {
                filename: `analyse-des-besoins-${session_name}-${fullname}.${extension}`,
                content: anab.buffer,
                contentType: anab.mime,
              },
            ],
          });

          return { code: 200, message: 'Done', data: 'This is ' };
        })
        .catch((err) => ({
          code: 500,
          message: 'Can not send roi message',
          data: err,
        }));
    } catch (error) {
      return { code: 500, message: 'Error occured', data: error };
    }
  }
  async onInviteViaMagicLink({
    to,
    role,
    link,
  }: {
    to: string;
    role: string;
    link: string;
  }): Promise<IInternalResponse> {
    const appname = this.configService.get<string>('APPNAME');
    const appowner = this.configService.get<string>('APPOWNER');
    const brut_welcome = join(
      __dirname,
      '../../src',
      'templates',
      'template.createwithmagiclink.html',
    );

    const html_welcome = fs.readFileSync(brut_welcome, 'utf8');
    const template_welocme = Handlebars.compile(html_welcome);
    const content_welcome = template_welocme({
      to,
      role,
      magicLink: link,
      appowner,
      appname,
    });
    return this.sendMail({
      to,
      content: content_welcome,
      subject: `Invitation en tant que ${role}`,
    })
      .then((inv) => ({ code: 200, message: 'Done', data: 'This is ' }))
      .catch((err) => ({ code: 500, message: 'Error occured', data: err }));
  }
  async onPayementSession({
    to,
    fullname,
    session,
    amount,
    currency,
  }: {
    to: string;
    fullname: string;
    session: string;
    amount: number;
    currency: string;
  }): Promise<IInternalResponse> {
    try {
      const appname = this.configService.get<string>('APPNAME');
      const appowner = this.configService.get<string>('APPOWNER');
      const brut_welcome = join(
        __dirname,
        '../../src',
        'templates',
        'template.onpayement.html',
      );

      const html_welcome = fs.readFileSync(brut_welcome, 'utf8');
      const template_welocme = Handlebars.compile(html_welcome);
      const content_welcome = template_welocme({
        fullname,
        session: session,
        appowner,
        appname,
        amount,
        currency,
      });

      return this.sendMail({
        to,
        content: content_welcome,
        subject: `Payement pour la session ${session}`.toUpperCase(),
      })
        .then((inv) => ({ code: 200, message: 'Done', data: 'This is ' }))
        .catch((err) => ({ code: 500, message: 'Error occured', data: err }));
    } catch (error) {
      return { code: 500, message: 'Error occured', data: error };
    }
  }
}
