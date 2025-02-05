import { RazorModule } from './../../razorpay/razor.module';
import { DatabaseModule } from '../../database/database.module';
import { Module } from '@nestjs/common';
import { ClientTicketController } from './client.ticket.controller';
import { TicketService } from './client.ticket.service';

@Module({
  imports: [DatabaseModule, RazorModule],
  controllers: [ClientTicketController],
  providers: [TicketService],
})
export class ClientTicketModule {}
