import { ResponseStructure } from 'src/app.types';
import { UseZodGuard } from 'nestjs-zod';
import { AdvocateDbService } from './../database/advocate.db.service';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { LoggedInAllowedGuard } from 'src/guard/logged.in.guard';
import { RoleCheckGuard } from 'src/guard/role.check.guard';
import { StatusCheckGuard } from 'src/guard/status.check.guard';
import { AdvocateProfileUpdateBodySchema } from './advocate.zod';
import { AdvocateProfileUpdateBodyType } from './advocate.types';
import { SessionData } from 'express-session';

@Controller('advocate')
@UseGuards(LoggedInAllowedGuard)
@UseGuards(StatusCheckGuard(['VERIFIED']))
@UseGuards(RoleCheckGuard('ADVOCATE'))
export class AdvocateController {
  constructor(private readonly advocateDbService: AdvocateDbService) {}

  @Post('profile/update')
  @UseZodGuard('body', AdvocateProfileUpdateBodySchema)
  async updateProfile(
    @Session() session: SessionData,
    @Body() body: AdvocateProfileUpdateBodyType,
  ): Promise<ResponseStructure> {
    const currentDate = new Date();

    const updatedAdvocate = await this.advocateDbService.updateAdvocate({
      where: { id: session.user.id },
      data: {
        name: body.name ? body.name : session.user.name,
        city: body.city ? body.city : session.user.city,
        state: body.state ? body.state : session.user.state,
        pincode: body.pincode ? body.pincode : session.user.pincode,
        country: body.country ? body.country : session.user.country,
        price: body.price ? body.price : undefined,
        AvailabelDates: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth(),
          days: body.dates ? body.dates : [],
        },
      },
    });

    session.user = updatedAdvocate;

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
    };
  }
}
