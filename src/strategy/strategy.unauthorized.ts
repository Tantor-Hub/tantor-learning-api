import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomUnauthorizedException extends HttpException {
  constructor(message: string) {
    super(
      {
        status: HttpStatus.UNAUTHORIZED,
        message: message,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
