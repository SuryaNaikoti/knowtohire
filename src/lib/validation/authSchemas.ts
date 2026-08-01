import { z } from 'zod';

// Reusable Atomic Schemas
export const nameSchema = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .min(2, `${fieldName} must be at least 2 characters`)
    .max(50, `${fieldName} cannot exceed 50 characters`)
    .regex(/^[a-zA-Z\s'-]+$/, `${fieldName} contains invalid characters`);

export const emailSchema = z
  .string()
  .min(1, 'Professional email is required')
  .email('Please enter a valid professional email address (e.g. name@company.com)')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must contain at least one number (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)')
  .refine((val) => !/\s/.test(val), 'Password must not contain spaces');

export const otpSchema = z
  .string()
  .min(1, 'Verification code is required')
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain digits only (0-9)');

// 1. Register Form Schema
export const registerSchema = z
  .object({
    firstName: nameSchema('First Name'),
    lastName: nameSchema('Last Name'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept the Terms & Conditions'),
    privacyAccepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept the Privacy Policy'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please check and re-enter.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// 2. Login Form Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// 3. Forgot Password Form Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// 4. Reset Password Form Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please check and re-enter.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// 5. Verify Email OTP Form Schema
export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
