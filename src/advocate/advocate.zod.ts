import { z } from 'nestjs-zod/z';

export const AdvocateProfileUpdateBodySchema = z.object({
  name: z.string().min(5).max(15).optional(),
  city: z.string().min(1).max(15).optional(),
  state: z.string().min(1).max(15).optional(),
  // pincode number should be 6 digits long
  pincode: z.number().min(100000).max(999999).optional(),
  country: z.string().min(1).max(15).optional(),
  price: z.number().min(0).max(99999999999999).optional(),
  // number array, each number in array should be between 1 and 28
  dates: z.array(z.number().min(1).max(28)).optional(),
});
