import { Clients, Advocates } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

export type Roles = 'CLIENT' | 'ADVOCATE';

export interface UserClient extends Clients {
  role: Roles;
}

export interface UserAdvocate extends Advocates {
  role: Roles;
}

export interface ResponseStructure<T = any> {
  statusCode: HttpStatus;
  message?: any;
  error?: any;
  data?: T;
}
