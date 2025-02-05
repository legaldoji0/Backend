import { AdvocateModule } from './advocate/advocate.module';
import { AppController } from './seed.controller';
import { MailService } from './utils/mailer/mail.service';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStoragePrismaService } from './utils/throttlerStorage/throttler.storate.prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { ClientModule } from './client/client.module';
import { UtilsService } from './utils/utils.service';
import { RazorModule } from './razorpay/razor.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ClientModule,
    AdvocateModule,
    RazorModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 30,
      storage: new ThrottlerStoragePrismaService(),
    }),
  ],
  controllers: [AppController],
  providers: [
    MailService,
    UtilsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
