import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils';
import {
  CreateOrderClientResTypes,
  CreateOrderResTypes,
  PayNotesTypes,
  PaymentCallbackBodyTypes,
} from './razor.types';

@Injectable()
export class RazorService {
  private readonly razorpayKeyID = process.env.RAZORPAY_KEY_ID;
  private readonly razorpayKeySec = process.env.RAZORPAY_KEY_SEC;
  public readonly clientUrl = process.env.CLIENT_URL;
  private readonly razorpay = new Razorpay({
    key_id: this.razorpayKeyID,
    key_secret: this.razorpayKeySec,
  });

  async createOrder(
    amount: number,
    receipt: string,
    notes: PayNotesTypes,
  ): Promise<CreateOrderResTypes> {
    const order = await this.razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes,
    });
    return order;
  }

  async getOrder(orderId: string): Promise<CreateOrderResTypes | null> {
    const order = await this.razorpay.orders.fetch(orderId);
    return order;
  }

  verifyPaymentSignature(payment: PaymentCallbackBodyTypes): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      payment;
    return validatePaymentVerification(
      {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
      razorpay_signature,
      this.razorpayKeySec,
    );
  }

  createClientOrder({
    order,
    prefill,
    description,
    callback,
    notes,
  }: {
    order: CreateOrderResTypes;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    description: string;
    callback: string;
    notes?: object;
  }): CreateOrderClientResTypes {
    // check callback url starts with '/api'
    if (!callback.startsWith('/api')) {
      throw new InternalServerErrorException(
        'Callback url must start with /api',
      );
    }

    return {
      key: this.razorpayKeyID,
      amount: order.amount.toString(),
      currency: order.currency,
      name: 'Legaldoji',
      description,
      image: 'https://legaldoji.com/assets/images/logo.png',
      order_id: order.id,
      callback_url: `${this.clientUrl}${callback}`,
      prefill,
      notes,
      theme: {
        color: '#3399cc',
      },
    };
  }
}
