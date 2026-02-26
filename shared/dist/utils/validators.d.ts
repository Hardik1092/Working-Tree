import { z } from 'zod';
export declare const loginSchema: z.ZodEffects<z.ZodObject<{
    password: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}>;
export declare const registerSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}>, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}>, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}, {
    name: string;
    password: string;
    confirmPassword: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    otpId: z.ZodString;
    otp: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otpId: string;
    otp: string;
    newPassword: string;
}, {
    otpId: string;
    otp: string;
    newPassword: string;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodOptional<z.ZodString>;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otp: string;
    phoneNumber?: string | undefined;
}, {
    otp: string;
    phoneNumber?: string | undefined;
}>;
export declare const verifyRegistrationOtpSchema: z.ZodObject<{
    otpId: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otpId: string;
    otp: string;
}, {
    otpId: string;
    otp: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type VerifyRegistrationOtpInput = z.infer<typeof verifyRegistrationOtpSchema>;
//# sourceMappingURL=validators.d.ts.map