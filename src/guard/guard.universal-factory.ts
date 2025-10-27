import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  JwtAuthGuardUniversalMultiRole,
  UniversalRoleOptions,
} from './guard.universal-multi-role';
import { UNIVERSAL_ROLES_KEY } from './decorators/universal-roles.decorator';

@Injectable()
export class JwtAuthGuardUniversalFactory implements CanActivate {
  constructor(
    private reflector: Reflector,
    private universalGuard: JwtAuthGuardUniversalMultiRole,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleOptions = this.reflector.getAllAndOverride<UniversalRoleOptions>(
      UNIVERSAL_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roleOptions) {
      // No role requirements specified, allow access
      return true;
    }

    // Set the role options for the guard
    this.universalGuard.setRoleOptions(roleOptions);

    return this.universalGuard.canActivate(context);
  }
}
