import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

// TODO:
// add option for verifying email
// according to options we will allow or not allow

@Injectable()
export class LoggedInAllowedGuard implements CanActivate {
  private readonly logger = new Logger(LoggedInAllowedGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.debug('Private route guard');
    const req: Request = context.switchToHttp().getRequest();

    if (!req.session.user) {
      this.logger.debug('User not logged in');
      throw new UnauthorizedException("You're not logged in");
    }

    return true;
  }
}
