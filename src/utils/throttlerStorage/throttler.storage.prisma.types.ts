import { PrismaClient } from '@prisma/client';
export interface ThrottlerStoragePrismaTypes {
  prisma: PrismaClient;

  /**
   * Get a record via its key and return all its request ttls.
   */
  getRecord(key: string): Promise<number[]>;

  /**
   * Add a record to the storage. The record will automatically be removed from
   * the storage once its TTL has been reached.
   */
  addRecord(key: string, ttl: number): Promise<void>;
}

type PrismaDataSource = {
  url?: string;
};

export type PrismaDataSources = {
  [name in string]: PrismaDataSource;
};

export interface ThrottlerStorageObjectTypes {
  id: number;
  key: string;
  ttl: number;
}
