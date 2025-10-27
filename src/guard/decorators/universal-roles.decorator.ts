import { SetMetadata } from '@nestjs/common';
import { UniversalRoleOptions } from '../guard.universal-multi-role';

export const UNIVERSAL_ROLES_KEY = 'universalRoles';

/**
 * Decorator to specify role requirements for the universal multi-role guard
 *
 * @param options - Role configuration options
 * @example
 * @UniversalRoles({
 *   requiredRoles: ['admin', 'secretary'],
 *   requireAll: false, // User needs admin OR secretary
 *   allowAdminOverride: true
 * })
 */
export const UniversalRoles = (options: UniversalRoleOptions) =>
  SetMetadata(UNIVERSAL_ROLES_KEY, options);

/**
 * Helper decorator for requiring ANY of the specified roles
 * @param roles - Array of roles (user needs ANY of these)
 */
export const RequireAnyRole = (...roles: string[]) =>
  UniversalRoles({
    requiredRoles: roles,
    requireAll: false,
    allowAdminOverride: true,
  });

/**
 * Helper decorator for requiring ALL of the specified roles
 * @param roles - Array of roles (user needs ALL of these)
 */
export const RequireAllRoles = (...roles: string[]) =>
  UniversalRoles({
    requiredRoles: roles,
    requireAll: true,
    allowAdminOverride: true,
  });

/**
 * Helper decorator for requiring ANY of the specified roles with no admin override
 * @param roles - Array of roles (user needs ANY of these, admin override disabled)
 */
export const RequireAnyRoleStrict = (...roles: string[]) =>
  UniversalRoles({
    requiredRoles: roles,
    requireAll: false,
    allowAdminOverride: false,
  });

/**
 * Helper decorator for requiring ALL of the specified roles with no admin override
 * @param roles - Array of roles (user needs ALL of these, admin override disabled)
 */
export const RequireAllRolesStrict = (...roles: string[]) =>
  UniversalRoles({
    requiredRoles: roles,
    requireAll: true,
    allowAdminOverride: false,
  });
