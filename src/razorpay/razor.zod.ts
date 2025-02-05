import { z } from 'nestjs-zod/z';

export const PaymentCallbackBodySchema = z.object({
  razorpay_order_id: z.string().min(1).max(40),
  razorpay_payment_id: z.string().min(1).max(40),
  razorpay_signature: z.string().min(40).max(300),
});
