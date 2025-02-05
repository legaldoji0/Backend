import { z } from 'nestjs-zod/z';

// experience: number | null;
// language: string | null;
// court: string | null;
// speciality: string | null;
// designation: string | null;
// rating: number | null;
// price: number | null;
// state: string | null;
// city: string | null;
export const ClientAdvoFilterBodySchema = z.object({
  experience: z.number().min(1).max(100).optional(),
  language: z.string().min(1).max(20).optional(),
  court: z.string().min(1).max(20).optional(),
  speciality: z.string().min(1).max(20).optional(),
  designation: z.string().min(1).max(20).optional(),
  rating: z.number().min(0).max(5).optional(),
  price: z.number().min(1).max(9999999999999).optional(),
  state: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(20).optional(),
});
