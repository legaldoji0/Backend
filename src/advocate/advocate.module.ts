import { AdvocateController } from './advocate.controller';
import { AdvocateTicketModule } from './ticket/advo.ticket.module';
import { DatabaseModule } from './../database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, AdvocateTicketModule],
  providers: [],
  controllers: [AdvocateController],
})
export class AdvocateModule {}
