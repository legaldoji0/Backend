import { z } from 'nestjs-zod/z';

/**
 * @name LoginBodySchema
 * @property
 * email: simple string with email format
 * password: simple string with min length 8
 */
export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * @name RegisterBodySchema
 * @property
 * who: advocate | client | intent
 * email: simple string with email format
 * password: simple string with min length 8
 * firstName: simple string
 * lastName: simple string
 * dateOfBirth: regex DD/MM/YYYY
 * phoneNumber: check with regex for indian phone number
 * state: simple string
 * city: simple string
 * pincode: check with regex for indian pincode
 */
export const RegisterBodySchema = z.object({
  who: z.enum(['advocate', 'client']),
  email: z.string().email().min(1).max(50),
  password: z.string().min(8),
  firstName: z.string().min(1).max(20),
  lastName: z.string().min(1).max(20),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/),
  state: z.string().min(1).max(20),
  city: z.string().min(1).max(20),
  pincode: z.string().regex(/^\d{6}$/),
});

/**
 * @name VerifyBodySchema
 * @property
 * code: 6 length integer
 */
export const VerifyBodySchema = z.object({
  code: z.number().int().min(100000).max(999999),
});

/**
 * @name ForgotPassBodySchema
 * @property
 * email: simple string with email format
 */
export const ForgotPassBodySchema = z.object({
  email: z.string().email().min(1).max(50),
});
