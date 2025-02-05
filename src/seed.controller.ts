import { UtilsService } from 'src/utils/utils.service';
import { Controller, Get, Logger } from '@nestjs/common';
import { AdvocateDbService } from './database/advocate.db.service';
import { ClientDbService } from './database/client.db.service';
import { TicketsDbService } from './database/tickets.db.service';
import { MailService } from './utils/mailer/mail.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly advocateDbService: AdvocateDbService,
    private readonly clientDbService: ClientDbService,
    private readonly ticketsDbService: TicketsDbService,
    private readonly mailService: MailService,
    private readonly utilsService: UtilsService,
  ) {}

  @Get('seed/advocates')
  async SeedAdvocates() {
    // email: random number @gmail.com
    // password: random number
    // name: random first name small case + random last name small case
    // dob: random date
    // phone: random number
    // state: "test state"
    // city: "test city"
    // pincode: random number
    // status: random "VERIFIED" or "NOTVERIFIED

    const newAdvocate = await this.advocateDbService.createAdvocate({
      email: Math.floor(Math.random() * 1000000000) + '@gmail.com',
      password: this.utilsService.hashString(
        Math.floor(Math.random() * 1000000000).toString(),
      ),
      name: Math.floor(Math.random() * 1000000000).toString(),
      dob: new Date(Math.floor(Math.random() * 1000000000)),
      phone: Math.floor(Math.random() * 1000000000).toString(),
      state: 'test state',
      city: 'test city',
      pincode: Math.floor(Math.random() * 1000000000),
      status: Math.random() > 0.5 ? 'VERIFIED' : 'NOTVERIFIED',
    });

    this.logger.log('New Advocate: ' + JSON.stringify(newAdvocate));

    return newAdvocate;
  }
}
