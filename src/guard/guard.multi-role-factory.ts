import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuardMultiRole, MultiRoleOptions } from './guard.multi-role';
import { MULTI_ROLE_KEY } from './decorators/multi-role.decorator';

@Injectable()
export class JwtAuthGuardMultiRoleFactory implements CanActivate {
  constructor(
    private reflector: Reflector,
    private multiRoleGuard: JwtAuthGuardMultiRole,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const multiRoleOptions = this.reflector.getAllAndOverride<MultiRoleOptions>(
      MULTI_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!multiRoleOptions) {
      return true; // No multi-role requirements, allow access
    }

    // Set the options for the guard
    this.multiRoleGuard['options'] = multiRoleOptions;

    return this.multiRoleGuard.canActivate(context);
  }
}
