import { UserClient } from './../app.types';
import { Prisma, Clients } from '@prisma/client';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ClientDbService {
  private readonly logger = new Logger(ClientDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getClients(params: {
    where?: Prisma.ClientsWhereInput;
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientsWhereUniqueInput;
    orderBy?: Prisma.ClientsOrderByWithRelationInput;
    getTickets?: boolean;
  }): Promise<Clients[]> {
    this.logger.debug(`Getting clients with params: ${JSON.stringify(params)}`);
    const { where, skip, take, cursor, orderBy, getTickets } = params;
    return this.prisma.clients.findMany({
      where,
      skip,
      take,
      cursor,
      orderBy,
      include: {
        tickets: getTickets,
      },
    });
  }

  async createClient(data: Prisma.ClientsCreateInput): Promise<UserClient> {
    const client = await this.prisma.clients.findFirst({
      where: {
        id: data.id,
        email: data.email,
        phone: data.phone,
      },
    });

    if (client) {
      this.logger.error('Client already exists with this data');
      this.logger.error(data);
      throw new ConflictException('Client already exists with this data');
    }

    const newClient = await this.prisma.clients.create({ data });

    return { ...newClient, role: 'CLIENT' };
  }

  async updateClient(params: {
    where: Prisma.ClientsWhereUniqueInput;
    data: Prisma.ClientsUpdateInput;
  }): Promise<UserClient> {
    const updatedClient = await this.prisma.clients.update({
      where: params.where,
      data: params.data,
    });

    return { ...updatedClient, role: 'CLIENT' };
  }
}
