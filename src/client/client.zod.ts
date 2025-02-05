import { z } from 'nestjs-zod/z';

export const TicketStatusSchema = z.enum([
  'OPEN',
  'CLOSED',
  'REFUNDED',
  'UNDERREVIEW',
  'ALL',
  'UNPAID',
]);
