import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsDbService {
  private readonly logger = new Logger(TicketsDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  // default returns one ticket
  async getTickets(params: {
    where?: Prisma.TicketsWhereInput;
    skip?: number;
    take?: number;
    cursor?: Prisma.TicketsWhereUniqueInput;
    orderBy?: Prisma.TicketsOrderByWithRelationInput;
    getClient?: boolean;
    getAdvocate?: boolean;
  }) {
    this.logger.debug(`Getting tickets with params: ${JSON.stringify(params)}`);
    const { where, skip, take, cursor, orderBy, getAdvocate, getClient } =
      params;
    return this.prisma.tickets.findMany({
      where,
      skip,
      take,
      cursor,
      orderBy,
      include: {
        meeting: true,
        documents: true,
        client: getClient,
        advocate: getAdvocate,
      },
    });
  }

  async createTicket(data: Prisma.TicketsCreateInput) {
    this.logger.debug(`Creating ticket with data: ${JSON.stringify(data)}`);
    return this.prisma.tickets.create({
      data,
      include: { meeting: true, documents: true },
    });
  }

  async updateTicket(params: {
    where: Prisma.TicketsWhereUniqueInput;
    data: Prisma.TicketsUpdateInput;
  }) {
    this.logger.debug(
      `Updating ticket with where: ${JSON.stringify(
        params.where,
      )} and data: ${JSON.stringify(params.data)}`,
    );
    const { where, data } = params;
    return this.prisma.tickets.update({
      data,
      where,
      include: { meeting: true, documents: true },
    });
  }

  private async deleteTicket(where: Prisma.TicketsWhereUniqueInput) {
    this.logger.debug(`Deleting ticket with where: ${JSON.stringify(where)}`);

    await this.prisma.meetings.deleteMany({
      where: { ticketId: where.id },
    });

    await this.prisma.documents.deleteMany({
      where: { ticketId: where.id },
    });

    return this.prisma.tickets.delete({
      where,
      include: { meeting: true, documents: true },
    });
  }
}
