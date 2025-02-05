import { RoleCheckGuard } from './../../guard/role.check.guard';
import { LoggedInAllowedGuard } from 'src/guard/logged.in.guard';
import { TicketsDbService } from '../../database/tickets.db.service';
import { AdvocateDbService } from '../../database/advocate.db.service';
import { SessionData } from 'express-session';
import { ResponseStructure } from '../../app.types';
import { ClientCreateTicketBodyTypes } from './client.ticket.types';
import {
  Controller,
  Post,
  UseGuards,
  Logger,
  Session,
  Body,
  BadRequestException,
  HttpStatus,
  ForbiddenException,
  Get,
  Param,
} from '@nestjs/common';
import { ClientCreateTicketBodySchema } from './client.ticket.zod';
import { UseZodGuard } from 'nestjs-zod';
import { StatusCheckGuard } from 'src/guard/status.check.guard';
import { RazorService } from 'src/razorpay/razor.service';

@Controller('client/ticket')
@UseGuards(LoggedInAllowedGuard)
@UseGuards(StatusCheckGuard(['VERIFIED']))
@UseGuards(RoleCheckGuard('CLIENT'))
export class ClientTicketController {
  private readonly logger = new Logger(ClientTicketController.name);

  constructor(
    private readonly advocateDbService: AdvocateDbService,
    private readonly ticketsDbService: TicketsDbService,
    private readonly razorService: RazorService,
  ) {}

  @Get()
  async FilterTickets(
    @Session() session: SessionData,
  ): Promise<ResponseStructure> {
    // fetch tickets, if numOfTickets is not specified, fetch all tickets
    const tickets = await this.ticketsDbService.getTickets({
      where: {
        clientId: session.user.id,
      },
    });

    this.logger.debug(`Fetched tickets: ${JSON.stringify(tickets)}`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tickets fetched',
      data: tickets,
    };
  }

  @Get('meet/create/:ticketId')
  async CreateMeet(
    @Session() session: SessionData,
    @Param('ticketId') ticketId: string,
  ): Promise<ResponseStructure> {
    // check ticketId, max 20, min 1
    if (ticketId.length > 20 || ticketId.length < 1) {
      throw new BadRequestException('Invalid ticketId');
    }

    this.logger.debug(`Fetching ticket with id: ${ticketId}`);
    // fetch ticket
    const ticketList = await this.ticketsDbService.getTickets({
      where: { id: ticketId },
    });

    const ticket = ticketList[0];

    this.logger.debug(`Fetched tickets: ${JSON.stringify(ticket)}`);

    // check if ticket exists
    if (!ticket) {
      throw new BadRequestException('Ticket does not exist');
    }

    // check if ticket belongs to user
    if (ticket.clientId !== session.user.id) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    // check if ticket is open
    if (ticket.status !== 'OPEN') {
      throw new BadRequestException('Ticket is not open');
    }

    // check if advocate exists
    this.logger.debug(`Fetching advocate with id: ${ticket.advocateId}`);
    const advocates = await this.advocateDbService.getAdvocates({
      where: { id: ticket.advocateId },
    });

    this.logger.debug(`Fetched advocates: ${JSON.stringify(advocates)}`);

    if (advocates.length === 0) {
      throw new BadRequestException('Advocate does not exist');
    }

    // create meet
    const createdMeet = await this.ticketsDbService.updateTicket({
      where: { id: ticketId },
      data: {
        meeting: {
          create: {},
        },
      },
    });

    this.logger.debug(`Created meet: ${JSON.stringify(createdMeet)}`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Meet created',
      data: createdMeet,
    };
  }

  @Post('refund/:ticketId')
  async RefundOneTicket(
    @Session() session: SessionData,
    @Param('ticketId') ticketId: string,
  ): Promise<ResponseStructure> {
    // check ticketId, max 20, min 1
    if (ticketId.length > 20 || ticketId.length < 1) {
      throw new BadRequestException('Invalid ticketId');
    }

    this.logger.debug(`Fetching ticket with id: ${ticketId}`);
    // fetch ticket
    const tickets = await this.ticketsDbService.getTickets({
      where: { id: ticketId, clientId: session.user.id },
    });

    this.logger.debug(`Fetched tickets: ${JSON.stringify(tickets)}`);

    // check if ticket exists
    if (tickets.length === 0) {
      throw new BadRequestException('Ticket does not exist');
    }

    // check if ticket belongs to user
    if (tickets[0].clientId !== session.user.id) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    // check if ticket is open
    if (tickets[0].status !== 'OPEN') {
      throw new BadRequestException('Ticket is not open');
    }

    // refund ticket
    const updatedTicket = await this.ticketsDbService.updateTicket({
      where: { id: ticketId },
      data: { status: 'REFUNDED' },
    });

    this.logger.debug(`Updated ticket: ${JSON.stringify(updatedTicket)}`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Ticket refunded',
      data: updatedTicket,
    };
  }

  @Get('pay/:ticketId')
  async PayOneTicket(
    @Session() session: SessionData,
    @Param('ticketId') ticketId: string,
  ): Promise<ResponseStructure> {
    // check ticketId, max 20, min 1
    if (ticketId.length > 20 || ticketId.length < 1) {
      throw new BadRequestException('Invalid ticketId');
    }

    this.logger.debug(`Fetching ticket with id: ${ticketId}`);
    // fetch ticket
    const ticketList = await this.ticketsDbService.getTickets({
      where: { id: ticketId, clientId: session.user.id },
    });

    const ticket = ticketList[0];

    this.logger.debug(`Fetched tickets: ${JSON.stringify(ticket)}`);

    // check if ticket exists
    if (!ticket) {
      throw new BadRequestException('Ticket does not exist');
    }

    // check if ticket belongs to user
    if (ticket.clientId !== session.user.id) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    // check if ticket is open
    if (ticket.status !== 'UNPAID') {
      throw new BadRequestException('Ticket is not in unpaid state');
    }

    // create order
    const order = await this.razorService.getOrder(ticket.paymentId);

    const clientOrder = this.razorService.createClientOrder({
      order: order,
      description: 'Payment for ticket',
      prefill: {
        name: session.user.name,
        email: session.user.email,
        contact: session.user.phone,
      },
      callback: '/api/client/ticket/pay/callback',
    });

    this.logger.debug(`Created order: ${JSON.stringify(order)}`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment order created',
      data: clientOrder,
    };
  }

  @Post('create')
  @UseZodGuard('body', ClientCreateTicketBodySchema)
  async CreateTicket(
    @Session() session: SessionData,
    @Body() body: ClientCreateTicketBodyTypes,
  ): Promise<ResponseStructure> {
    this.logger.debug(`Creating ticket with body: ${JSON.stringify(body)}`);

    // fetch advocate, and check:
    // 1. if advocate exists
    // 2. if advocate is verified
    const advocateList = await this.advocateDbService.getAdvocates({
      where: { id: body.advocateId },
    });

    const advocate = advocateList[0];

    this.logger.debug(`Fetched advocate: ${JSON.stringify(advocate)}`);

    if (!advocate) {
      throw new BadRequestException('Advocate does not exist');
    }

    if (advocate.status !== 'VERIFIED') {
      throw new BadRequestException('Advocate is not verified');
    }

    // create ticket
    const newUnpaidTicket = await this.ticketsDbService.createTicket({
      client: {
        connect: { id: session.user.id },
      },
      advocate: {
        connect: { id: advocate.id },
      },
      status: 'UNPAID',
      price: advocate.price,
      clientDescription: body.description,
      meetDate: new Date(body.meetDate),
    });

    this.logger.debug(`Created ticket: ${JSON.stringify(newUnpaidTicket)}`);

    const newRazorpayOrder = await this.razorService.createOrder(
      advocate.price,
      `Tic#${newUnpaidTicket.id}`,
      {
        ticketId: newUnpaidTicket.id,
        type: 'TICKET',
      },
    );

    this.ticketsDbService.updateTicket({
      where: { id: newUnpaidTicket.id },
      data: { paymentId: newRazorpayOrder.id },
    });

    const newClientOrder = this.razorService.createClientOrder({
      order: newRazorpayOrder,
      description: 'Payment for ticket',
      prefill: {
        name: session.user.name,
        email: session.user.email,
        contact: session.user.phone,
      },
      callback: '/api/client/ticket/pay/callback',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Ticket created',
      data: {
        ticket: newUnpaidTicket,
        razorpayOrder: newClientOrder,
      },
    };
  }
}
