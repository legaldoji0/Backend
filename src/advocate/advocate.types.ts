import { z } from 'nestjs-zod/z';
import { AdvocateProfileUpdateBodySchema } from './advocate.zod';

export interface AvailableDatesJsonType {
  year: number;
  month: number;
  days: number[];
}

export type AdvocateProfileUpdateBodyType = z.infer<
  typeof AdvocateProfileUpdateBodySchema
>;
