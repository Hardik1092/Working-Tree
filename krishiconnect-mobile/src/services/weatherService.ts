import { WEATHER } from '@krishiconnect/shared';
import type { WeatherCurrent } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const weatherService = {
  async getCurrent(params?: { state?: string; district?: string }): Promise<WeatherCurrent> {
    const q = new URLSearchParams();
    if (params?.state) q.set('state', params.state);
    if (params?.district) q.set('district', params.district);
    const query = q.toString();
    const { data } = await request<ApiEnvelope<WeatherCurrent>>(
      'GET',
      query ? `${WEATHER.CURRENT}?${query}` : WEATHER.CURRENT
    );
    return (data.data ?? data) as WeatherCurrent;
  },
};
