import { z } from 'nestjs-zod/z';
import { PaymentCallbackBodySchema } from './razor.zod';

export type PaymentCallbackBodyTypes = z.infer<
  typeof PaymentCallbackBodySchema
>;

export interface TicketPayNotes {
  ticketId: string;
  type: 'TICKET';
}

export type PayNotesTypes = TicketPayNotes;

export interface CreateOrderResTypes {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string;
  status: string;
  attempts: number;
  notes: PayNotesTypes;
  created_at: number;
}

export interface CreateOrderClientResTypes {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  callback_url: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: object;
  theme: {
    color: string;
  };
}
