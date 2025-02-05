import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/app.types';

/**
 * Role check guard
 * @param role Allowed role of user
 */
export const RoleCheckGuard = (role: Roles) => {
  class RoleCheckGuardMixin implements CanActivate {
    private readonly logger = new Logger(RoleCheckGuardMixin.name);

    canActivate(context: ExecutionContext) {
      this.logger.debug('Role check guard');
      const req: Request = context.switchToHttp().getRequest();

      if (req.session.user?.role !== role) {
        throw new ForbiddenException(
          'You not allowed to access this route, please get lost',
        );
      }
      return true;
    }
  }

  const guard = mixin(RoleCheckGuardMixin);
  return guard;
};
