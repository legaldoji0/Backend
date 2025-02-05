import { SessionData } from 'express-session';
import { TicketsDbService } from '../../database/tickets.db.service';
import {
  Controller,
  Get,
  Session,
  UseGuards,
  HttpStatus,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { LoggedInAllowedGuard } from 'src/guard/logged.in.guard';
import { ResponseStructure } from 'src/app.types';
import { StatusCheckGuard } from 'src/guard/status.check.guard';
import { RoleCheckGuard } from 'src/guard/role.check.guard';

@Controller('advocate/ticket')
@UseGuards(LoggedInAllowedGuard)
@UseGuards(StatusCheckGuard(['VERIFIED']))
@UseGuards(RoleCheckGuard('ADVOCATE'))
export class AdvoTicketController {
  constructor(private readonly ticketsDbService: TicketsDbService) {}

  @Get()
  async getAllTickets(
    @Session() session: SessionData,
  ): Promise<ResponseStructure> {
    const tickets = await this.ticketsDbService.getTickets({
      where: { advocateId: session.user.id },
      getAdvocate: false,
      getClient: false,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Tickets fetched successfully',
      data: tickets,
    };
  }

  @Get('close/:ticketId')
  async closeTicket(
    @Session() session: SessionData,
    @Param('ticketId') ticketId: string,
  ): Promise<ResponseStructure> {
    // check ticketId, max 20, min 1
    if (ticketId.length > 20 || ticketId.length < 1) {
      throw new BadRequestException('Invalid ticketId');
    }

    const ticketList = await this.ticketsDbService.getTickets({
      where: { id: ticketId, advocateId: session.user.id },
      getAdvocate: false,
      getClient: false,
    });

    const ticket = ticketList[0];

    if (!ticket) {
      throw new BadRequestException('Invalid ticketId');
    }

    if (ticket.status !== 'OPEN') {
      throw new BadRequestException('Ticket is already closed');
    }

    // check meeting in ticket was created 24 hours ago

    if (!ticket.meeting) {
      throw new BadRequestException('Meeting has not been done yet');
    }

    const meetingDate = new Date(ticket.meeting.createdAt);
    const currentDate = new Date();

    if (currentDate.getTime() - meetingDate.getTime() < 86400000) {
      throw new BadRequestException('You can close ticket after 24 hours');
    }

    // close ticket
    const updatedTicket = await this.ticketsDbService.updateTicket({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Ticket closed successfully',
      data: updatedTicket,
    };
  }
}
