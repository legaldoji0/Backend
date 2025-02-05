import { z } from 'nestjs-zod/z';

// advocateId: string and required
// description: string and optional, 1000 characters max, min 50 characters
// message: string and optional, 200 characters max
// meetDate: string and required
export const ClientCreateTicketBodySchema = z.object({
  advocateId: z.string().nonempty().max(100),
  description: z.string().max(1000).min(50),
  message: z.string().max(200).optional(),
  meetDate: z.string().nonempty().max(100),
});
