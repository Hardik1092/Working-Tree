import { NETWORK } from '@krishiconnect/shared';
import type { NetworkRecommendation } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const networkService = {
  async getRecommendations(params: { page?: number; limit?: number } = {}): Promise<{
    recommendations: NetworkRecommendation[];
    pagination?: { nextCursor?: string };
  }> {
    const q = new URLSearchParams();
    if (params.page != null) q.set('page', String(params.page));
    if (params.limit != null) q.set('limit', String(params.limit));
    const query = q.toString();
    const { data } = await request<{ data: NetworkRecommendation[]; meta?: { pagination?: { nextCursor?: string } } }>(
      'GET',
      query ? `${NETWORK.RECOMMENDATIONS}?${query}` : NETWORK.RECOMMENDATIONS
    );
    const inner = (data as { data?: NetworkRecommendation[] }).data ?? data;
    const recommendations = Array.isArray(inner) ? inner : [];
    const meta = (data as { meta?: { pagination?: { nextCursor?: string } } }).meta;
    return { recommendations, pagination: meta?.pagination };
  },
};
