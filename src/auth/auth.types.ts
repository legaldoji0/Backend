import { z } from 'nestjs-zod/z';
import {
  LoginBodySchema,
  RegisterBodySchema,
  VerifyBodySchema,
  ForgotPassBodySchema,
} from './auth.zod';

export type LoginBodyTypes = z.infer<typeof LoginBodySchema>;

export type RegisterBodyTypes = z.infer<typeof RegisterBodySchema>;

export type VerifyBodyTypes = z.infer<typeof VerifyBodySchema>;

export type ForgotPassBodyTypes = z.infer<typeof ForgotPassBodySchema>;
