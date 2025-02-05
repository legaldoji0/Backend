import { UserAdvocate } from './../app.types';
import { Prisma } from '@prisma/client';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AdvocateDbService {
  private readonly logger = new Logger(AdvocateDbService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAdvocates(params: {
    where?: Prisma.AdvocatesWhereInput;
    skip?: number;
    take?: number;
    cursor?: Prisma.AdvocatesWhereUniqueInput;
    orderBy?: Prisma.AdvocatesOrderByWithRelationInput;
    getTickets?: boolean;
  }) {
    this.logger.debug(
      `Getting advocates with params: ${JSON.stringify(params)}`,
    );
    const { where, skip, take, cursor, orderBy, getTickets } = params;
    return this.prisma.advocates.findMany({
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

  async createAdvocate(
    data: Prisma.AdvocatesCreateInput,
  ): Promise<UserAdvocate> {
    const advocate = await this.prisma.advocates.findFirst({
      where: {
        id: data.id,
        email: data.email,
        phone: data.phone,
      },
    });

    if (advocate) {
      this.logger.error('Advocate already exists with this data');
      this.logger.error(data);
      throw new ConflictException('Advocate already exists with this data');
    }

    const newAdvocate = await this.prisma.advocates.create({ data });

    return { ...newAdvocate, role: 'ADVOCATE' };
  }

  async updateAdvocate(params: {
    where: Prisma.AdvocatesWhereUniqueInput;
    data: Prisma.AdvocatesUpdateInput;
  }): Promise<UserAdvocate> {
    const updatedAdvocate = await this.prisma.advocates.update({
      where: params.where,
      data: params.data,
    });

    return { ...updatedAdvocate, role: 'ADVOCATE' };
  }
}
