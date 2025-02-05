import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  mixin,
} from '@nestjs/common';
import { AdvocateStatus } from '@prisma/client';
import { Request } from 'express';

/**
 * Status check guard
 * @param allowedStatus Allowed status of user
 */
export const StatusCheckGuard = (allowedStatus: AdvocateStatus[]) => {
  class StatusCheckGuardMixin implements CanActivate {
    private readonly logger = new Logger(StatusCheckGuardMixin.name);

    canActivate(context: ExecutionContext) {
      this.logger.debug(`Status check guard: ${allowedStatus}`);
      const req: Request = context.switchToHttp().getRequest();

      // check status of user is there or not
      if (!req.session.user) {
        this.logger.debug('User not allowed');
        throw new ForbiddenException('You are allowed');
      }

      if (!allowedStatus.includes(req.session.user.status)) {
        this.logger.debug('User not not allowed');
        throw new ForbiddenException('You are not allowed');
      }
      return true;
    }
  }

  const guard = mixin(StatusCheckGuardMixin);
  return guard;
};
