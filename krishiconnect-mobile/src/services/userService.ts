import { USERS } from '@krishiconnect/shared';
import type { User } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await request<ApiEnvelope<User>>('GET', USERS.ME);
    return (data.data ?? data) as User;
  },

  async updateProfile(payload: Partial<Pick<User, 'name' | 'bio' | 'location'>>): Promise<User> {
    const { data } = await request<ApiEnvelope<User>>('PATCH', USERS.UPDATE_ME, payload);
    return (data.data ?? data) as User;
  },

  async uploadAvatar(formData: FormData): Promise<User> {
    const { data } = await request<ApiEnvelope<User>>('POST', USERS.PROFILE_PHOTO, null, { body: formData });
    return (data.data ?? data) as User;
  },

  async follow(userId: string): Promise<void> {
    await request('POST', USERS.FOLLOW(userId));
  },
};
