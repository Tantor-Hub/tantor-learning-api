import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import randomstring from 'randomstring';
import { IInternalResponse } from 'src/interface/interface.internalresponse';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { userColumns } from 'src/interface/interface.usercolomuns';
import { literal, Op } from 'sequelize';
import Stripe from 'stripe';

@Injectable()
export class AllSercices {
  private stripe: Stripe;
  private stripeCommission: number;
  private stripeCommissionFixed: number;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
    );
    this.stripeCommission = parseFloat(
      this.configService.get<string>('STRIPE_COMMISSION') || '0',
    );
    this.stripeCommissionFixed = parseFloat(
      this.configService.get<string>('STRIPE_COMMISSION_FIXED') || '0',
    );
  }

  formatDate({ dateString }: { dateString: string | Date }): string | any {
    const date = moment(dateString);
    if (!date.isValid()) {
      return null;
    }
    return date.format('DD/MM/YYYY');
  }
  unixToDate({ stringUnix }: { stringUnix: string | number }): string {
    return moment.unix(Number(stringUnix)).format('YYYY-MM-DD HH:mm:ss');
  }
  calcHoursBetweenDates = (
    { start, end }: { start: string; end: string },
    formatTexte = false,
  ): IInternalResponse => {
    const dateDebut = new Date(start);
    const dateFin = new Date(end);

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      return {
        code: 400,
        message: 'Dates invalides',
        data: {} as any,
      };
    }

    const differenceMs = dateFin.getTime() - dateDebut.getTime();
    const totalMinutes = Math.floor(differenceMs / (1000 * 60));
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const result = formatTexte
      ? `${heures}h ${minutes}min`
      : { heures, minutes, totalMinutes };

    return {
      code: 200,
      message: 'Durée calculée avec succès',
      data: result,
    };
  };
  groupArrayElementByColumn = ({ arr, columnName, convertColumn }): any[] => {
    const groups = new Map();
    arr.forEach((item: any) => {
      const columnValue = item[columnName];
      if (groups.has(columnValue)) {
        groups.get(columnValue).push(item);
      } else {
        groups.set(columnValue, [item]);
      }
    });
    return Object.fromEntries(groups);
  };
  truncateAmount = ({ amount }): string => {
    return Number(amount).toFixed(3);
  };
  capitalizeWords = ({ text }): string => {
    return text.replace(/\b\w/g, (char: string) => char.toUpperCase());
  };
  truncatestring = ({ string, separator }): string => {
    return string.substring(0, string.lastIndexOf(separator));
  };
  addPersentToPrice = ({ persent, price }): number => {
    persent = parseFloat(persent);
    price = parseFloat(price);
    return price + price * (persent / 100);
  };
  renderAsLisibleNumber = ({ nombre }): string => {
    const nombreString = nombre.toString();

    let partieEntiere = nombreString.split('.')[0];
    const partieDecimale = nombreString.split('.')[1] || '';

    partieEntiere = partieEntiere.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const nombreLisible =
      partieEntiere + (partieDecimale ? '.' + partieDecimale : '');
    return nombreLisible;
  };
  generateIdentifier = ({ prefix }): string => {
    const pfx = Math.floor(Math.random() * 1000);
    const sfx = Math.floor(Math.random() * 100);

    return `${prefix ? prefix : 'BLBL'}-${pfx}-${sfx}`;
  };
  generateFilename = ({ prefix, tempname }) => {
    const extension = tempname.substring(tempname.lastIndexOf('.'));
    return `${prefix ? prefix + '-' : ''}${randomstring.generate()}${extension}`;
  };
  randomLongNumber = ({ length }: { length: number }): string => {
    const len = Number.isInteger(length) && length > 0 ? length : 6;
    return Array.from({ length: len }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
  };
  generateUuid(): string {
    return uuidv4();
  }
  base64Econde(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
  parseDate(date: string): Date | null {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  now(): number {
    return Date.now();
  }
  nowDate(): string | Date {
    return moment.utc().format('YYYY-MM-DDTHH:mm:ss');
  }
  checkIntersection({
    arr_a,
    arr_b,
  }: {
    arr_a: number[];
    arr_b: number[];
  }): boolean {
    const intersection = arr_a.filter((value) => arr_b.includes(value));
    return intersection.length > 0 ? true : false;
  }
  createDesignationSessionName({
    start,
    end,
  }: {
    start: string;
    end: string;
  }): string {
    return String(' SESSION : ').concat(start).concat(' - ').concat(end);
  }
  fullName({ fs, ls }: { fs?: string; ls?: string }): string {
    return (fs ?? '')
      .concat(' ')
      .concat(ls ?? '')
      .trim();
  }
  filterUserFields(userInstance: Record<string, any>): Record<string, any> {
    const userFields = userColumns;
    return userFields.reduce(
      (filtered, field) => {
        if (field in userInstance) {
          filtered[field] = userInstance[field];
        }
        return filtered;
      },
      {} as Record<string, any>,
    );
  }
  formatRoles(roles: any[]): number[] {
    return roles.map((role) => role?.id);
  }
  buildClauseMessage(groupe: number, id_user: number): any {
    switch (groupe) {
      case 1: // Messages envoyés, ni archivés ni supprimés
        return {
          id_user_sender: id_user,
          [Op.and]: [
            literal(`NOT (${id_user} = ANY("is_deletedto"))`),
            literal(`NOT (${id_user} = ANY("is_archievedto"))`),
          ],
        };

      case 2: // Messages archivés par l'utilisateur
        return {
          [Op.or]: [{ id_user_sender: id_user }, { id_user_receiver: id_user }],
          [Op.and]: [
            literal(`${id_user} = ANY("is_archievedto")`),
            literal(`NOT (${id_user} = ANY("is_deletedto"))`),
          ],
        };

      case 3: // Messages reçus, non archivés, non supprimés
        return {
          id_user_receiver: id_user,
          [Op.and]: [
            literal(`NOT (${id_user} = ANY("is_deletedto"))`),
            literal(`NOT (${id_user} = ANY("is_archievedto"))`),
          ],
        };

      case 4: // Messages supprimés
        return {
          [Op.or]: [{ id_user_sender: id_user }, { id_user_receiver: id_user }],
          [Op.and]: [literal(`${id_user} = ANY("is_deletedto")`)],
        };

      case 5:
      default: // Tous les messages (sans filtrer suppression ou archivage)
        return {
          [Op.or]: [{ id_user_sender: id_user }, { id_user_receiver: id_user }],
        };
    }
  }
  dateToUnixOnly(dateString: string): number {
    return moment(dateString).startOf('day').unix();
  }
  async onPay({
    currency,
    amount,
    payment_method_types,
    return_url,
  }: {
    currency: string;
    amount: number;
    payment_method_types?: string[];
    return_url?: string;
  }): Promise<{ code: number; message: string; data: any }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        // ...(payment_method_types?.length
        //     ? { payment_method_types }
        //     : { automatic_payment_methods: { enabled: true } }),
        // ...(return_url ? { return_url } : {}),
      });

      return {
        code: 200,
        message: 'Paiement créé avec succès',
        data: {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
          amount: this.renderAsLisibleNumber({ nombre: paymentIntent.amount }),
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          nextAction: paymentIntent.next_action ?? null,
        },
      };
    } catch (error: any) {
      return {
        code: 500,
        message: 'Erreur lors du paiement',
        data: {
          error: error.message,
        },
      };
    }
  }

  calcTotalAmount(amount: number): number {
    const pourcentage = this.stripeCommission; // 1.4%
    const fixe = this.stripeCommissionFixed; // 10 centimes
    const frais = amount * pourcentage + fixe;
    return frais + amount; // arrondi à 2 décimales
  }
}
