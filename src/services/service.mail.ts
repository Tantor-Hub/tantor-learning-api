import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AllSercices } from './serices.all';
import { log } from 'console';
import { IInternalResponse } from 'src/interface/interface.internalresponse';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { Buffer } from 'buffer';
import { CloudinaryService } from './service.cloudinary';
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
    private readonly cloudinaryService: CloudinaryService,
  ) {
    const host = this.configService.get<string>('APPSMTP_HOST');
    const port = this.configService.get<number>('APPSMTP_PORT');
    const secureEnv = this.configService.get<string>('APPSMTP_SECURE');
    const secure =
      typeof secureEnv === 'string'
        ? ['1', 'true', 'yes'].includes(secureEnv.toLowerCase())
        : Boolean(secureEnv);

    if (host) {
      // Use custom SMTP (recommended for sending to corporate domains)
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 465,
        secure: port ? port === 465 || secure : true,
        auth: {
          user: this.configService.get<string>('APPSMTPUSER'),
          pass: this.configService.get<string>('APPSMTPPASS'),
        },
      });
    } else {
      // Fallback to Gmail service
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.configService.get<string>('APPSMTPUSER'),
          pass: this.configService.get<string>('APPSMTPPASS'),
        },
      });
    }
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
    firstName,
    lastName,
    cours,
    dateOn,
    prixCours,
    code,
    basePrice,
    stripeFee,
    totalAmount,
    errorMessage,
  }: {
    as: string;
    firstName?: string;
    lastName?: string;
    cours?: string;
    dateOn?: string;
    prixCours?: string;
    code?: string;
    basePrice?: number;
    stripeFee?: number;
    totalAmount?: number;
    errorMessage?: string;
  }): string {
    const color = '#0077b6'; // Utilisation de votre couleur primaire
    const ringColor = '#0096c7'; // Utilisation de votre couleur ring
    const destructiveColor = '#e53e3e'; // Utilisation de votre couleur destructive
    const secondaryColor = '#f1f5f9'; // Utilisation de votre couleur secondaire
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
                            background-color: #f8fafc;
                            margin: 0;
                            padding: 0;
                            color: #1a202c;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                        }
                        .header {
                            background-color: ${color};
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
                            color: ${color};
                        }
                        .footer {
                            background: ${secondaryColor};
                            padding: 20px;
                            text-align: center;
                            font-size: 14px;
                            color: #64748b;
                        }
                        .footer p {
                            margin: 5px 0;
                        }
                        .code-container {
                            background: ${secondaryColor};
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .code {
                            font-size: 32px;
                            font-weight: bold;
                            color: ${color};
                            letter-spacing: 5px;
                        }
                    </style>
                    <title>Code de vérification - ${appname}</title>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 class="color: #fff;">Code de vérification</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour <strong>${firstName}</strong>,</p>
                            <p>Nous avons reçu une demande de code de vérification. Voici votre code :</p>
                            
                            <div class="code-container">
                                <div class="code">${code}</div>
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
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .content ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        .content li {
            margin-bottom: 8px;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Bienvenue chez ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Bonjour, ${this.allSercices.capitalizeWords({ text: firstName })} ${this.allSercices.capitalizeWords({ text: lastName })}!</h1>
        </div>
        <div class="content">
            <p>Bonjour <span class="highlight">${this.allSercices.capitalizeWords({ text: firstName })}</span>,</p>
            <p>Votre compte a été créé avec succès. Nous sommes ravis de vous accueillir sur <strong>${appname}</strong>, votre plateforme d'apprentissage en ligne.</p>
            <p>Chez <strong>${appname}</strong>, nous croyons que l'accès à la connaissance ne doit pas être limité par le temps ou l'espace. C'est pourquoi nous avons conçu une plateforme intuitive et riche en contenus de qualité pour vous accompagner dans votre apprentissage.</p>
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
            <div style="text-align: center;">
                <a href="${url}" class="button">Accéder à votre espace</a>
            </div>
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
      case 'newsletter-subscribe':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Inscription à la newsletter - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Bienvenue dans notre communauté !</h1>
        </div>
        <div class="content">
            <p>Merci de vous être inscrit à notre newsletter !</p>
            <p>Vous recevrez désormais régulièrement des informations sur nos dernières formations, actualités et conseils pour votre apprentissage.</p>
            <p>Restez connecté avec <strong>${appname}</strong> et continuez votre parcours d'apprentissage avec nous.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Découvrir nos formations</a>
            </div>
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
      case 'newsletter-unsubscribe':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Désinscription de la newsletter - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Au revoir !</h1>
        </div>
        <div class="content">
            <p>Vous avez été désinscrit de notre newsletter.</p>
            <p>Nous sommes tristes de vous voir partir, mais nous respectons votre choix.</p>
            <p>Si vous changez d'avis, vous pouvez toujours vous réinscrire à tout moment.</p>
            <p>Continuez votre apprentissage avec <strong>${appname}</strong> !</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Revenir sur la plateforme</a>
            </div>
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
      case 'payment-card-success':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement par carte confirmé - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>💳 Paiement Confirmé</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous vous confirmons que votre paiement par carte bancaire a été effectué avec succès pour la formation :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">✅ Paiement Validé</div>
            ${
              basePrice !== undefined &&
              stripeFee !== undefined &&
              totalAmount !== undefined
                ? `
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${color};">
                <h3 style="margin: 0 0 10px 0; color: ${color};">Détail du paiement</h3>
                <p style="margin: 5px 0;"><strong>Prix de la formation :</strong> ${basePrice.toFixed(2)} €</p>
                <p style="margin: 5px 0;"><strong>Frais de traitement Stripe :</strong> ${stripeFee.toFixed(2)} €</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: ${color};"><strong>Total payé :</strong> ${totalAmount.toFixed(2)} €</p>
            </div>
            `
                : `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 5px 0; color: #856404;"><strong>Debug Info:</strong> basePrice=${basePrice}, stripeFee=${stripeFee}, totalAmount=${totalAmount}</p>
            </div>
            `
            }
            <p>Vous pouvez maintenant accéder à votre session de formation. Un secrétaire validera votre paiement dans les plus brefs délais.</p>
            <p>Si vous souhaitez effectuer un autre paiement, vous pouvez accéder à votre espace personnel.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Accéder à ma formation</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-cpf-pending':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #f59e0b;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement CPF en attente - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎓 Paiement CPF Enregistré</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous vous confirmons que votre demande de paiement par CPF a été enregistrée pour la formation :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">⏳ En Attente de Validation</div>
            <p>Un secrétaire examinera votre demande et validera votre paiement dans les plus brefs délais.</p>
            <p>Vous recevrez une notification par email dès que votre paiement sera validé.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Suivre ma formation</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-opco-pending':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #f59e0b;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement OPCO en attente - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏢 Paiement OPCO Enregistré</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous vous confirmons que votre demande de paiement par OPCO a été enregistrée pour la formation :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">⏳ En Attente de Validation</div>
            <p>Un secrétaire examinera votre demande et validera votre paiement dans les plus brefs délais.</p>
            <p>Vous recevrez une notification par email dès que votre paiement sera validé.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Suivre ma formation</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-cpf-validated':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement CPF validé - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎓 Paiement CPF Validé</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Excellente nouvelle ! Votre paiement par CPF a été validé par notre équipe pour la formation :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">✅ Paiement Validé</div>
            <p>Vous pouvez maintenant accéder à votre session de formation. Toutes les informations nécessaires vous ont été communiquées.</p>
            <p>Nous vous souhaitons une excellente formation !</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Accéder à ma formation</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-cpf-rejected':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #e53e3e;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement CPF rejeté - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎓 Paiement CPF Rejeté</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous vous informons que votre demande de paiement par CPF pour la formation suivante n'a pas pu être validée :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">❌ Paiement Rejeté</div>
            <p>Veuillez nous contacter pour plus d'informations ou choisir une autre méthode de paiement.</p>
            <p>Nous restons à votre disposition pour vous accompagner.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Nous contacter</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-opco-validated':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement OPCO validé - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏢 Paiement OPCO Validé</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Excellente nouvelle ! Votre paiement par OPCO a été validé par notre équipe pour la formation :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">✅ Paiement Validé</div>
            <p>Vous pouvez maintenant accéder à votre session de formation. Toutes les informations nécessaires vous ont été communiquées.</p>
            <p>Nous vous souhaitons une excellente formation !</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Accéder à ma formation</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-opco-rejected':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${color};
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
            color: ${color};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: #e53e3e;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
    </style>
    <title>Paiement OPCO rejeté - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏢 Paiement OPCO Rejeté</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            <p>Nous vous informons que votre demande de paiement par OPCO pour la formation suivante n'a pas pu être validée :</p>
            <p class="highlight">${cours}</p>
            <div class="status-badge">❌ Paiement Rejeté</div>
            <p>Veuillez nous contacter pour plus d'informations ou choisir une autre méthode de paiement.</p>
            <p>Nous restons à votre disposition pour vous accompagner.</p>
            <div style="text-align: center;">
                <a href="${url}" class="button">Nous contacter</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p><em>"Une plateforme d'apprentissage pour vous"</em></p>
        </div>
    </div>
</body>
</html>
        `;
        break;
      case 'payment-card-failure':
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #1a202c;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${destructiveColor};
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
            color: ${destructiveColor};
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background-color: ${destructiveColor};
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        .error-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        .error-box p {
            margin: 5px 0;
            color: #dc2626;
            font-weight: 500;
        }
        .footer {
            background: ${secondaryColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            color: #ffffff;
            background-color: ${color};
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
            font-weight: 600;
            text-align: center;
        }
        .button:hover {
            background-color: ${ringColor};
        }
        .training-info {
            background-color: ${secondaryColor};
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .training-info h3 {
            margin: 0 0 10px 0;
            color: ${color};
        }
        .training-info p {
            margin: 5px 0;
        }
    </style>
    <title>Problème de paiement - ${appname}</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>❌ Problème de paiement</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
            
            <p>Nous avons rencontré un problème lors du traitement de votre paiement pour la formation.</p>
            
            <div class="status-badge">PAIEMENT NON VALIDÉ</div>
            
            <div class="error-box">
                <p><strong>Raison du problème :</strong></p>
                <p>${errorMessage || 'Une erreur est survenue lors de la validation du paiement.'}</p>
            </div>
            
            ${
              cours
                ? `
            <div class="training-info">
                <h3>📚 Détails de la formation</h3>
                <p><strong>Formation :</strong> ${cours}</p>
                ${dateOn ? `<p><strong>Date :</strong> ${dateOn}</p>` : ''}
                ${prixCours ? `<p><strong>Prix :</strong> ${prixCours} €</p>` : ''}
            </div>
            `
                : ''
            }
            
            <p><strong>Que faire maintenant ?</strong></p>
            <ul>
                <li>Vérifiez que votre carte bancaire a des fonds suffisants</li>
                <li>Assurez-vous que votre carte n'est pas expirée</li>
                <li>Contactez votre banque si le problème persiste</li>
                <li>Réessayez le paiement depuis votre espace personnel</li>
            </ul>
            
            <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="${url}" class="button">Retourner à la plateforme</a>
            </div>
        </div>
        <div class="footer">
            <p>Cordialement,</p>
            <p><strong>L'équipe ${appname}</strong></p>
            <p>${appowner}</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
        `;
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
        const fromAddress =
          this.configService.get<string>('APPSMTP_FROM') ||
          this.configService.get<string>('APPSMTPUSER');
        console.log('📧 [SEND MAIL] Preparing email with options:', {
          from: `"${this.configService.get<string>('APPNAME')}" <${fromAddress}>`,
          to: to,
          subject: (subject || 'Configuration').toUpperCase(),
          hasContent: !!content,
          hasAttachments: !!attachments,
        });

        const mailOptions = {
          from: `"${this.configService.get<string>('APPNAME')}" <${fromAddress}>`,
          to,
          subject: (subject || 'Configuration').toUpperCase(),
          html: content,
          attachments,
        };
        const info = await this.transporter.sendMail(mailOptions);
        log('[ Status Mail ] ', info.messageId, info.response || '');
        return resolve({
          code: 200,
          message: 'Email envoyé',
          data: info.messageId,
        });
      } catch (error) {
        log('[ Mail Error ]', error?.code || '', error?.response || error);
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

  async sendPaymentFailureEmail(
    sessionId: string,
    userId: string,
    errorMessage: string,
  ): Promise<IInternalResponse> {
    try {
      console.log('📧 [MAIL SERVICE] Sending payment failure email...');
      console.log('  - Session ID:', sessionId);
      console.log('  - User ID:', userId);
      console.log('  - Error Message:', errorMessage);

      // Get user and training session details
      const { Users } = await import('../models/model.users');
      const { TrainingSession } = await import(
        '../models/model.trainingssession'
      );
      const { Training } = await import('../models/model.trainings');

      const user = await Users.findByPk(userId);
      if (!user) {
        console.log(
          '❌ [MAIL SERVICE] User not found for payment failure email',
        );
        return {
          code: 404,
          message: 'User not found',
          data: null,
        };
      }

      const trainingSession = await TrainingSession.findByPk(sessionId, {
        include: [
          {
            model: Training,
            as: 'trainings',
            required: false,
            attributes: ['id', 'title', 'prix'],
          },
        ],
      });

      if (!trainingSession) {
        console.log(
          '❌ [MAIL SERVICE] Training session not found for payment failure email',
        );
        return {
          code: 404,
          message: 'Training session not found',
          data: null,
        };
      }

      const trainingTitle = trainingSession.trainings?.title || 'Formation';
      const trainingPrice = trainingSession.trainings?.prix || 0;
      const sessionDate = trainingSession.begining_date
        ? new Date(trainingSession.begining_date).toLocaleDateString('fr-FR')
        : '';

      console.log('📧 [MAIL SERVICE] Email data prepared:', {
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        trainingTitle,
        trainingPrice,
        sessionDate,
        errorMessage,
      });

      const emailContent = this.templates({
        as: 'payment-card-failure',
        firstName: user.firstName || 'Utilisateur',
        lastName: user.lastName || '',
        cours: trainingTitle,
        dateOn: sessionDate,
        prixCours: trainingPrice.toString(),
        errorMessage: errorMessage,
      });

      const result = await this.sendMail({
        to: user.email,
        subject: `❌ Problème de paiement - ${trainingTitle}`,
        content: emailContent,
      });

      console.log('✅ [MAIL SERVICE] Payment failure email sent successfully');
      return result;
    } catch (error) {
      console.error(
        '❌ [MAIL SERVICE] Error sending payment failure email:',
        error,
      );
      return {
        code: 500,
        message: 'Failed to send payment failure email',
        data: { error: error.message },
      };
    }
  }

  async sendPaymentConfirmationEmail(
    sessionId: string,
    userId: string,
    basePrice?: number,
    stripeFee?: number,
    totalAmount?: number,
  ): Promise<IInternalResponse> {
    try {
      console.log('📧 [MAIL SERVICE] Sending payment confirmation email...');
      console.log('  - Session ID:', sessionId);
      console.log('  - User ID:', userId);
      console.log('  - Base Price:', basePrice);
      console.log('  - Stripe Fee:', stripeFee);
      console.log('  - Total Amount:', totalAmount);

      // Get user and training session details
      const { Users } = await import('../models/model.users');
      const { TrainingSession } = await import(
        '../models/model.trainingssession'
      );
      const { Training } = await import('../models/model.trainings');

      const user = await Users.findByPk(userId);
      if (!user) {
        console.log(
          '❌ [MAIL SERVICE] User not found for payment confirmation email',
        );
        return {
          code: 404,
          message: 'User not found',
          data: null,
        };
      }

      const trainingSession = await TrainingSession.findByPk(sessionId, {
        include: [
          {
            model: Training,
            as: 'trainings',
            required: false,
            attributes: ['id', 'title', 'prix'],
          },
        ],
      });

      if (!trainingSession) {
        console.log(
          '❌ [MAIL SERVICE] Training session not found for payment confirmation email',
        );
        return {
          code: 404,
          message: 'Training session not found',
          data: null,
        };
      }

      const trainingTitle = trainingSession.trainings?.title || 'Formation';
      const trainingPrice = trainingSession.trainings?.prix || 0;
      const sessionDate = trainingSession.begining_date
        ? new Date(trainingSession.begining_date).toLocaleDateString('fr-FR')
        : '';

      console.log('📧 [MAIL SERVICE] Email data prepared:', {
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        trainingTitle,
        trainingPrice,
        sessionDate,
        basePrice,
        stripeFee,
        totalAmount,
      });

      // Verify email address is valid
      if (!user.email || !user.email.includes('@')) {
        console.log('❌ [MAIL SERVICE] Invalid email address:', user.email);
        return {
          code: 400,
          message: 'Invalid email address',
          data: null,
        };
      }

      console.log('📧 [MAIL SERVICE] Sending email to:', user.email);

      const emailContent = this.templates({
        as: 'payment-card-success',
        firstName: user.firstName || 'Utilisateur',
        lastName: user.lastName || '',
        cours: trainingTitle,
        dateOn: sessionDate,
        prixCours: trainingPrice.toString(),
        basePrice: Number(basePrice) || 0,
        stripeFee: Number(stripeFee) || 0,
        totalAmount: Number(totalAmount) || 0,
      });

      const result = await this.sendMail({
        to: user.email,
        subject: `✅ Paiement confirmé - ${trainingTitle}`,
        content: emailContent,
      });

      console.log(
        '✅ [MAIL SERVICE] Payment confirmation email sent successfully',
      );
      return result;
    } catch (error) {
      console.error(
        '❌ [MAIL SERVICE] Error sending payment confirmation email:',
        error,
      );
      return {
        code: 500,
        message: 'Failed to send payment confirmation email',
        data: { error: error.message },
      };
    }
  }
}
