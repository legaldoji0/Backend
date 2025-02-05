import { ClientController } from './client.controller';
import { ClientAdvocateModule } from './advocate/client.advo.module';
import { DatabaseModule } from './../database/database.module';
import { Module } from '@nestjs/common';
import { ClientTicketModule } from './ticket/client.ticket.module';
import { RazorModule } from 'src/razorpay/razor.module';

@Module({
  imports: [
    ClientTicketModule,
    DatabaseModule,
    ClientAdvocateModule,
    RazorModule,
  ],
  controllers: [ClientController],
})
export class ClientModule {}
