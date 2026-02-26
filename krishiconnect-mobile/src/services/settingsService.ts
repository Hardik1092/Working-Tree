import { SETTINGS } from '@krishiconnect/shared';
import type { PrivacySettings } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const settingsService = {
  async getPrivacy(): Promise<PrivacySettings> {
    const { data } = await request<ApiEnvelope<PrivacySettings>>('GET', SETTINGS.PRIVACY);
    return (data.data ?? data) as PrivacySettings;
  },

  async updatePrivacy(payload: Partial<{ twoFactorEnabled: boolean; activityStatusEnabled: boolean }>): Promise<PrivacySettings> {
    const { data } = await request<ApiEnvelope<PrivacySettings>>('PATCH', SETTINGS.PRIVACY, payload);
    return (data.data ?? data) as PrivacySettings;
  },
};
