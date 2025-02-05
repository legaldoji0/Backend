import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoggedOutAllowedGuard implements CanActivate {
  private readonly logger = new Logger(LoggedOutAllowedGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.debug('Public route guard');
    const req: Request = context.switchToHttp().getRequest();

    if (req.session.user) {
      this.logger.debug('Already logged in');
      throw new ForbiddenException('Already logged in');
    }

    return true;
  }
}
