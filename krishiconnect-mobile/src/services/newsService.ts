import { request } from './api';

export type NewsItem = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  source?: string;
  publishedAt?: string;
  [key: string]: unknown;
};

export const newsService = {
  async getAgricultureNews(): Promise<NewsItem[]> {
    try {
      const { data } = await request('GET', '/news/agriculture');
      const list = (data as any)?.data ?? data ?? [];
      return Array.isArray(list) ? (list as NewsItem[]) : [];
    } catch {
      return [];
    }
  },
};

