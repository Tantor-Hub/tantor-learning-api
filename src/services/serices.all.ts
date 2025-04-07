import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AllSercices {
    constructor(private configService: ConfigService) { }

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
        let nombreString = nombre.toString();

        let partieEntiere = nombreString.split(".")[0];
        let partieDecimale = nombreString.split(".")[1] || "";

        partieEntiere = partieEntiere.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

        let nombreLisible =
            partieEntiere + (partieDecimale ? "." + partieDecimale : "");
        return nombreLisible;
    };

    generateIdentifier = ({ prefix }): string => {
        const pfx = Math.floor(Math.random() * 1000);
        const sfx = Math.floor(Math.random() * 100);

        return `${prefix ? prefix : "BLBL"}-${pfx}-${sfx}`;
    };

    generateFilename = ({ prefix, tempname }) => {
        const extension = tempname.substring(tempname.lastIndexOf("."));
        return `${prefix ? prefix + "-" : ""}${randomstring.generate()}${extension}`;
    };

    randomLongNumber = ({ length }: { length: number }): string => {
        const len = Number.isInteger(length) && length > 0 ? length : 6;
        return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
    };

    generateUuid(): string {
        return uuidv4();
    };

    base64Econde(str: string): string {
        return Buffer.from(str, 'utf-8').toString('base64');
    };

    base64Decode(str: string): string {
        return Buffer.from(str, 'base64').toString('utf-8');
    };

    now(): number {
        return Date.now()
    }
}
