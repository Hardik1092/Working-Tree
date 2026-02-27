import { request } from './api';

export type Expert = {
  _id: string;
  name?: string;
  headline?: string;
  profilePhoto?: { url?: string };
  avatar?: string | { url?: string };
  [key: string]: unknown;
};

export const expertService = {
  async getExperts(): Promise<Expert[]> {
    const { data } = await request('GET', '/experts');
    const list = (data as any)?.data ?? data ?? [];
    if (Array.isArray(list)) return list as Expert[];
    return list ? [list as Expert] : [];
  },
};

