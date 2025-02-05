import { StatusCheckGuard } from '../guard/status.check.guard';
import { UtilsService } from 'src/utils/utils.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SessionData } from 'express-session';
import { Request } from 'express';
import { LoggedInAllowedGuard } from './../guard/logged.in.guard';
import { LoginBodyTypes, RegisterBodyTypes } from './auth.types';
import { ResponseStructure, UserAdvocate, UserClient } from './../app.types';
import { emailVerificationHtml } from './../utils/mailer/html.templatest';
import { AuthService } from './auth.service';
import { ClientDbService } from './../database/client.db.service';
import { AdvocateDbService } from './../database/advocate.db.service';
import { MailService } from './../utils/mailer/mail.service';
import { LoggedOutAllowedGuard } from '../guard/logged.out.guard';
import { UseZodGuard } from 'nestjs-zod';
import {
  LoginBodySchema,
  RegisterBodySchema,
  VerifyBodySchema,
} from './auth.zod';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly mailService: MailService,
    private readonly advocateDbService: AdvocateDbService,
    private readonly clientDbService: ClientDbService,
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
  ) {}

  @Get('user')
  @UseGuards(LoggedInAllowedGuard)
  async GetUser(@Session() session: SessionData): Promise<ResponseStructure> {
    return {
      statusCode: HttpStatus.OK,
      message: 'User data',
      data: session.user,
    };
  }

  @Get('logout')
  @UseGuards(LoggedInAllowedGuard)
  async Logout(@Req() req: Request): Promise<ResponseStructure> {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException(err.message);
      }
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out',
    };
  }

  @Get('register/newcode')
  @UseGuards(LoggedInAllowedGuard)
  @UseGuards(StatusCheckGuard(['NOTVERIFIED']))
  async RegisterCode(
    @Session() session: SessionData,
  ): Promise<ResponseStructure> {
    const verificationCode = await this.authService.genVerificationCode(
      session.user.id,
    );

    this.logger.debug(`Verification code: ${verificationCode}`);

    const emailVerificationMail = await this.mailService.sendMail({
      to: session.user.email,
      subject: 'Email Verification',
      html: emailVerificationHtml(verificationCode),
    });

    this.logger.debug(`Email verification mail: ${emailVerificationMail}`);

    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent to your email',
    };
  }

  @Post('register/verify')
  @UseGuards(LoggedInAllowedGuard)
  @UseGuards(StatusCheckGuard(['NOTVERIFIED']))
  @UseZodGuard('body', VerifyBodySchema)
  async RegisterVerify(
    @Session() session: SessionData,
    @Body('code') code: number,
  ): Promise<ResponseStructure> {
    const verificationCode = await this.authService.verifyCode(
      session.user.id,
      session.user.role,
      code,
    );

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
    } else {
      // change status to verified
      if (session.user.role === 'ADVOCATE') {
        const updatedAdvocate = await this.advocateDbService.updateAdvocate({
          where: {
            id: session.user.id,
          },
          data: {
            status: 'INCOMPLETE',
          },
        });

        session.user = updatedAdvocate;
      } else if (session.user.role === 'CLIENT') {
        const updatedClient = await this.clientDbService.updateClient({
          where: {
            id: session.user.id,
          },
          data: {
            status: 'VERIFIED',
          },
        });

        session.user = updatedClient;
      }
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User verified',
      data: session.user,
    };
  }

  @Post('login')
  @UseGuards(LoggedOutAllowedGuard)
  @UseZodGuard('body', LoginBodySchema)
  async Login(
    @Body() loginBody: LoginBodyTypes,
    @Session() session: SessionData,
  ): Promise<ResponseStructure> {
    //  make two parallel calls to the database
    // one for advocate and one for client
    // wait for both to complete
    // if both fail, return error
    // if one succeeds, use that data to create session
    const [advocateList, clientList] = await Promise.all([
      this.advocateDbService.getAdvocates({
        where: {
          email: loginBody.email,
        },
      }),
      this.clientDbService.getClients({
        where: {
          email: loginBody.email,
        },
      }),
    ]);

    const client = { ...clientList[0], role: 'CLIENT' } as UserClient;
    const advocate = { ...advocateList[0], role: 'ADVOCATE' } as UserAdvocate;

    if (!advocate && !client) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (advocate) {
      if (
        advocate.password !== this.utilsService.hashString(loginBody.password)
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }

      session.user = advocate;
    } else if (client) {
      if (
        client.password !== this.utilsService.hashString(loginBody.password)
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }

      session.user = client;
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: session.user,
    };
  }

  @Post('register')
  @UseGuards(LoggedOutAllowedGuard)
  @UseZodGuard('body', RegisterBodySchema)
  async Register(
    @Body() registerBody: RegisterBodyTypes,
    @Session() session: SessionData,
  ): Promise<ResponseStructure> {
    let newUser: UserClient | UserAdvocate;

    if (registerBody.who === 'advocate') {
      newUser = await this.advocateDbService.createAdvocate({
        email: registerBody.email,
        password: this.utilsService.hashString(registerBody.password),
        name: `${registerBody.firstName} ${registerBody.lastName}`,
        dob: new Date(registerBody.dateOfBirth),
        phone: registerBody.phoneNumber,
        state: registerBody.state,
        city: registerBody.city,
        pincode: parseInt(registerBody.pincode),
        status: 'NOTVERIFIED',
      });

      this.logger.log('New Advocate: ' + JSON.stringify(newUser));
    } else if (registerBody.who === 'client') {
      newUser = await this.clientDbService.createClient({
        email: registerBody.email,
        password: this.utilsService.hashString(registerBody.password),
        name: `${registerBody.firstName} ${registerBody.lastName}`,
        dob: new Date(registerBody.dateOfBirth),
        phone: registerBody.phoneNumber,
        state: registerBody.state,
        city: registerBody.city,
        pincode: parseInt(registerBody.pincode),
        status: 'NOTVERIFIED',
      });

      this.logger.log('New Client: ' + JSON.stringify(newUser));
    } else {
      throw new InternalServerErrorException('Invalid user type');
    }

    const verificationCode = await this.authService.genVerificationCode(
      newUser.id,
    );

    this.logger.log('Verification Code: ' + verificationCode);

    const verificationMailClient = await this.mailService.sendMail({
      to: registerBody.email,
      subject: 'Welcome to Legaldoji',
      html: emailVerificationHtml(verificationCode),
    });

    this.logger.log(
      'Verification Mail: ' + JSON.stringify(verificationMailClient),
    );

    session.user = newUser;

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      data: newUser,
    };
  }
}
