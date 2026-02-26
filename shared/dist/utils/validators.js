"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRegistrationOtpSchema = exports.verifyOtpSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    password: zod_1.z.string().min(1, 'Password is required'),
    phoneNumber: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
}).refine((data) => !!data.phoneNumber || !!data.email, {
    message: 'Provide either phone number or email',
    path: ['phoneNumber'],
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').max(128),
    confirmPassword: zod_1.z.string(),
    phoneNumber: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
    email: zod_1.z.string().email().optional(),
    state: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
}).refine((data) => !!data.phoneNumber || !!data.email, {
    message: 'Provide either phone number or email',
    path: ['phoneNumber'],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email required'),
});
exports.resetPasswordSchema = zod_1.z.object({
    otpId: zod_1.z.string().min(1),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    newPassword: zod_1.z.string().min(6).max(128),
});
exports.verifyOtpSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
exports.verifyRegistrationOtpSchema = zod_1.z.object({
    otpId: zod_1.z.string().min(1),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
