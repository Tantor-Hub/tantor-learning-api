import { SetMetadata } from '@nestjs/common';
import { MultiRoleOptions } from '../guard.multi-role';

export const MULTI_ROLE_KEY = 'multiRole';
export const MultiRole = (options: MultiRoleOptions) =>
  SetMetadata(MULTI_ROLE_KEY, options);
