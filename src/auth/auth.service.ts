import { UtilsService } from 'src/utils/utils.service';
import { Roles } from './../app.types';
import { PrismaService } from './../database/prisma.service';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

  async verifyCode(userId: string, role: Roles, code: number) {
    // find token for user which is not created more than 5 minute ago and matches code
    const token = await this.prisma.verficationTokens.findFirst({
      where: {
        userId: userId,
        token: code,
        createdAt: {
          gte: new Date(new Date().getTime() - 5 * 60 * 1000),
        },
      },
    });

    this.logger.debug(`Token: ${token}`);

    if (token) {
      // if found, delete all tokens for user
      this.prisma.verficationTokens.deleteMany({
        where: {
          userId: userId,
        },
      });

      // and return true
      return true;
    } else {
      // if not found, return false
      return false;
    }
  }

  async genVerificationCode(userId: string) {
    // get tokens for user
    const tokens = await this.prisma.verficationTokens.findMany({
      where: {
        userId: userId,
      },
    });

    const internalGenverficationCode = async () => {
      // of length 6
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
      await this.prisma.verficationTokens.create({
        data: {
          token: newVerificationCode,
          userId: userId,
        },
      });

      return newVerificationCode;
    };

    // if have tokens, and are created in last 5 minute, throw forbidden
    if (tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      const lastTokenTime = new Date(lastToken.createdAt).getTime();
      const currentTime = new Date().getTime();
      const diff = currentTime - lastTokenTime;

      if (diff < 5 * 60 * 1000) {
        throw new ForbiddenException(
          'Wait for 1 minute before requesting again',
        );
      } else {
        // if not, delete all tokens and create new token
        await this.prisma.verficationTokens.deleteMany({
          where: {
            userId: userId,
          },
        });
        return await internalGenverficationCode();
      }
    } else {
      // if no tokens, create new token
      return await internalGenverficationCode();
    }
  }
}
