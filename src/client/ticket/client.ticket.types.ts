import { ClientCreateTicketBodySchema } from './client.ticket.zod';
import { z } from 'nestjs-zod/z';

export type ClientCreateTicketBodyTypes = z.infer<
  typeof ClientCreateTicketBodySchema
>;
