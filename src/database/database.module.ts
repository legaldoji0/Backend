import { ClientDbService } from './client.db.service';
import { PrismaService } from './prisma.service';
import { Module } from '@nestjs/common';
import { TicketsDbService } from './tickets.db.service';
import { AdvocateDbService } from './advocate.db.service';

@Module({
  providers: [
    PrismaService,
    ClientDbService,
    TicketsDbService,
    AdvocateDbService,
  ],
  exports: [ClientDbService, TicketsDbService, AdvocateDbService],
})
export class DatabaseModule {}
