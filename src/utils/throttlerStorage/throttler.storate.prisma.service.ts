import { PrismaClient } from '@prisma/client';
import {
  PrismaDataSources,
  ThrottlerStoragePrismaTypes,
  ThrottlerStorageObjectTypes,
} from './throttler.storage.prisma.types';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class ThrottlerStoragePrismaService
  implements ThrottlerStoragePrismaTypes, OnModuleDestroy
{
  prisma: PrismaClient;
  createIfNotExists: boolean;
  tableName: string;

  /**
   * model [tableName] {
   *  id        Int     @id @default(autoincrement())
   *  key       String  @unique
   *  ttl       DateTime
   * }
   */

  constructor(
    dataSources?: PrismaDataSources,
    tableName = 'throttler',
    createIfNotExists = true,
  ) {
    this.tableName = tableName;
    this.createIfNotExists = createIfNotExists;

    this.prisma = dataSources
      ? new PrismaClient({
          datasources: dataSources,
        })
      : new PrismaClient();

    // check throttler table exists in prisma schema
    if (!this.prisma[this.tableName]) {
      // check if the createIfNotExists is true
      if (this.createIfNotExists) {
        // create the throttler table
        this.prisma.$executeRaw`CREATE TABLE IF NOT EXISTS ${this.tableName} (
            id SERIAL PRIMARY KEY,
            key VARCHAR(255) NOT NULL,
            ttl TIMESTAMP NOT NULL
          );`;
      } else {
        throw new Error('The throttler table does not exist');
      }
    }
  }

  /**
   * Clean expired records, don't wait this to finish, let it run in the background
   * @returns {Promise<void>}
   * @private
   * @memberof ThrottlerStoragePrismaService
   */
  private async cleanExpiredRecords(): Promise<void> {
    const now = Date.now();

    console.log('cleanExpiredRecords', now);

    // Clean expired members manually (to avoid extra memory usage)
    await this.prisma[this.tableName].deleteMany({
      where: {
        ttl: {
          lt: new Date(now),
        },
      },
    });
  }

  /**
   * Get all records for a given key
   * @param key
   * @returns {Promise<number[]>}
   * @memberof ThrottlerStoragePrismaService
   */
  async getRecord(key: string): Promise<number[]> {
    // time stamp
    const now = Date.now();

    console.log('getRecord', key, now);

    // Clean expired members manually (to avoid extra memory usage)
    this.cleanExpiredRecords();

    const records = await this.prisma[this.tableName].findMany({
      where: {
        key,
      },
    });

    return records.map((record: ThrottlerStorageObjectTypes) => record.ttl);
  }

  async addRecord(key: string, ttl: number): Promise<void> {
    const now = Date.now();

    console.log('addRecord', key, now);
    console.log('key', key, ' - ', 'ttl', ttl);

    await this.prisma[this.tableName].create({
      data: {
        key,
        ttl: new Date(now + ttl * 1000),
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
