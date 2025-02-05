import { StatusCheckGuard } from 'src/guard/status.check.guard';
import { AdvocateDbService } from '../../database/advocate.db.service';
import { LoggedInAllowedGuard } from 'src/guard/logged.in.guard';
import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { UseZodGuard } from 'nestjs-zod';
import { ClientAdvoFilterBodySchema } from './client.advo.zod';
import { ClientAdvoFilterBodyTypes } from './client.advo.types';
import { RoleCheckGuard } from 'src/guard/role.check.guard';

@Controller('client/advocate')
@UseGuards(LoggedInAllowedGuard)
@UseGuards(StatusCheckGuard(['VERIFIED']))
@UseGuards(RoleCheckGuard('CLIENT'))
export class ClientAdvocateController {
  private readonly logger = new Logger(ClientAdvocateController.name);

  constructor(private readonly advocateDbService: AdvocateDbService) {}

  @Get('popular')
  async getPopularAdvocates() {
    // return any 5 advocates
    return this.advocateDbService.getAdvocates({
      take: 5,
      getTickets: false,
      where: {
        status: 'VERIFIED',
      },
    });
  }

  @Post('search')
  @UseZodGuard('body', ClientAdvoFilterBodySchema)
  async searchAdvocates(@Body() body: ClientAdvoFilterBodyTypes) {
    // return any 5 advocates
    return this.advocateDbService.getAdvocates({
      take: 5,
      getTickets: false,
      where: {
        status: 'VERIFIED',
        experience: body.experience,
        languages: body.language,
        court: body.court,
        speciality: body.speciality,
        designation: body.designation,
        rating: body.rating,
        price: body.price,
        state: body.state,
        city: body.city,
      },
    });
  }
}
