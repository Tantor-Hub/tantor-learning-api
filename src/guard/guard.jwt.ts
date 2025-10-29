import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('[JWT GUARD] 🔐 Checking JWT authentication');
    const request = context.switchToHttp().getRequest();
    console.log('[JWT GUARD] 📋 Request headers:', {
      authorization: request.headers.authorization
        ? 'Bearer [PRESENT]'
        : 'Missing',
      'content-type': request.headers['content-type'],
    });
    return super.canActivate(context);
  }
}
