import { AUTH } from '@krishiconnect/shared';
import type { LoginPayload, RegisterPayload, ApiResponse, LoginResponse } from '@krishiconnect/shared';
import { request } from './api';

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    const { data } = await request<ApiResponse<LoginResponse>>('POST', AUTH.LOGIN, payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<{ otpSent?: boolean; otpId?: string; email?: string; phoneNumber?: string }>> {
    const { data } = await request('POST', AUTH.REGISTER, payload);
    return data;
  },

  async verifyOTP(payload: { phoneNumber: string; otp: string }): Promise<ApiResponse<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>> {
    const { data } = await request('POST', AUTH.VERIFY_OTP, payload);
    return data;
  },

  async verifyRegistrationOTP(payload: { otpId: string; otp: string }): Promise<ApiResponse<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>> {
    const { data } = await request('POST', AUTH.VERIFY_REGISTRATION_OTP, payload);
    return data;
  },

  async logout(refreshToken: string | null): Promise<void> {
    await request('POST', AUTH.LOGOUT, refreshToken ? { refreshToken } : undefined);
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const { data } = await request<ApiResponse<{ accessToken: string }>>('POST', AUTH.REFRESH_TOKEN, { refreshToken });
    return data;
  },
};
