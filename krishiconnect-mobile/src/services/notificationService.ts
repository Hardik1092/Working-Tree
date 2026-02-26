import { NOTIFICATIONS } from '@krishiconnect/shared';
import type { NotificationSettings, NotificationItem } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const notificationService = {
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await request<ApiEnvelope<NotificationSettings>>('GET', NOTIFICATIONS.SETTINGS);
    return (data.data ?? data) as NotificationSettings;
  },

  async updateSettings(payload: NotificationSettings): Promise<NotificationSettings> {
    const { data } = await request<ApiEnvelope<NotificationSettings>>('PUT', NOTIFICATIONS.SETTINGS, payload);
    return (data.data ?? data) as NotificationSettings;
  },

  async getNotifications(params: { cursor?: string; limit?: number; unreadOnly?: boolean } = {}): Promise<{
    notifications: NotificationItem[];
    nextCursor?: string;
  }> {
    const q = new URLSearchParams();
    if (params.cursor) q.set('cursor', params.cursor);
    if (params.limit != null) q.set('limit', String(params.limit));
    if (params.unreadOnly) q.set('unreadOnly', 'true');
    const query = q.toString();
    const { data } = await request<{ data: NotificationItem[]; meta?: { pagination?: { nextCursor?: string } } }>(
      'GET',
      query ? `${NOTIFICATIONS.LIST}?${query}` : NOTIFICATIONS.LIST
    );
    const inner = (data as { data?: NotificationItem[] }).data ?? data;
    const notifications = Array.isArray(inner) ? inner : [];
    const meta = (data as { meta?: { pagination?: { nextCursor?: string } } }).meta;
    return { notifications, nextCursor: meta?.pagination?.nextCursor };
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await request<ApiEnvelope<{ count: number }>>('GET', NOTIFICATIONS.UNREAD_COUNT);
    const raw = data.data ?? data;
    return (raw as { count?: number })?.count ?? 0;
  },

  async markRead(id: string): Promise<void> {
    await request('PATCH', NOTIFICATIONS.READ(id));
  },

  async markAllRead(): Promise<void> {
    await request('PATCH', NOTIFICATIONS.READ_ALL);
  },

  async deleteNotification(id: string): Promise<void> {
    await request('DELETE', NOTIFICATIONS.DELETE(id));
  },
};
