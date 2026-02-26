import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
}).refine((data) => !!data.phoneNumber || !!data.email, {
  message: 'Provide either phone number or email',
  path: ['phoneNumber'],
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  confirmPassword: z.string(),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  email: z.string().email().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => !!data.phoneNumber || !!data.email, {
  message: 'Provide either phone number or email',
  path: ['phoneNumber'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email required'),
});

export const resetPasswordSchema = z.object({
  otpId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6).max(128),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const verifyRegistrationOtpSchema = z.object({
  otpId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type VerifyRegistrationOtpInput = z.infer<typeof verifyRegistrationOtpSchema>;
