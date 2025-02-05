import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UseZodGuard } from 'nestjs-zod';
import { ResponseStructure } from 'src/app.types';
import { TicketsDbService } from 'src/database/tickets.db.service';
import { LoggedOutAllowedGuard } from 'src/guard/logged.out.guard';
import { RazorService } from 'src/razorpay/razor.service';
import { PaymentCallbackBodyTypes } from 'src/razorpay/razor.types';
import { PaymentCallbackBodySchema } from 'src/razorpay/razor.zod';

@Controller('client/ticket')
@UseGuards(LoggedOutAllowedGuard)
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(
    private readonly ticketsDbService: TicketsDbService,
    private readonly razorService: RazorService,
  ) {}

  @Post('pay/callback')
  @UseZodGuard('body', PaymentCallbackBodySchema)
  async PaymentCallback(
    @Body() body: PaymentCallbackBodyTypes,
  ): Promise<ResponseStructure> {
    this.logger.debug(`Payment callback with body: ${JSON.stringify(body)}`);

    // check if payment is correct
    const paymentVerificationResult =
      this.razorService.verifyPaymentSignature(body);

    this.logger.debug(
      `Payment verification result: ${paymentVerificationResult}`,
    );

    if (!paymentVerificationResult) {
      throw new BadRequestException('Payment verification failed');
    }

    const razorpayOrder = await this.razorService.getOrder(
      body.razorpay_order_id,
    );

    this.logger.debug(
      `Fetched razorpay order: ${JSON.stringify(razorpayOrder)}`,
    );

    if (!razorpayOrder) {
      throw new BadRequestException('Razorpay order not found');
    }

    // check order receipt starts with 'Tic#'
    if (razorpayOrder.notes.type === 'TICKET') {
      // fetch ticket
      const ticketList = await this.ticketsDbService.getTickets({
        where: { id: razorpayOrder.notes.ticketId },
      });

      const ticket = ticketList[0];

      this.logger.debug(`Fetched ticket: ${JSON.stringify(ticket)}`);

      // check if ticket exists
      if (!ticket) {
        throw new BadRequestException('Ticket does not exist');
      }

      // check if ticket is UNPAID
      if (ticket.status !== 'UNPAID') {
        throw new BadRequestException('Ticket is not unpaid status');
      }

      // check if ticket amount is same as payment amount
      if (ticket.price !== razorpayOrder.amount) {
        throw new BadRequestException('Ticket amount does not match');
      }

      // update ticket
      const updatedTicket = await this.ticketsDbService.updateTicket({
        where: { id: ticket.id },
        data: {
          status: 'OPEN',
          advocate: {
            update: {
              unverifiedBallance: {
                increment: ticket.price,
              },
            },
          },
        },
      });

      this.logger.debug(`Updated ticket: ${JSON.stringify(updatedTicket)}`);
    } else {
      throw new BadRequestException('Invalid receipt');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment callback successful',
    };
  }
}
