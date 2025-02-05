import { DatabaseModule } from '../../database/database.module';
import { Module } from '@nestjs/common';
import { AdvoTicketController } from './advo.ticket.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdvoTicketController],
  providers: [],
})
export class AdvocateTicketModule {}
