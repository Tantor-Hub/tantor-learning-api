import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Sercices {
    constructor(private configService: ConfigService) { }
    
}
