import { DatabaseModule } from './../database/database.module';
import { MailService } from './../utils/mailer/mail.service';
import { PrismaService } from './../database/prisma.service';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UtilsService } from 'src/utils/utils.service';

// remove Prisma service from providers
// make ticket db service

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, MailService, UtilsService],
})
export class AuthModule {}
