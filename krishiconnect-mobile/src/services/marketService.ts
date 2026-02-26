import { MARKET } from '@krishiconnect/shared';
import type { MarketPrice, Commodity, StateOption } from '@krishiconnect/shared';
import { request } from './api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface MarketPricesParams {
  state?: string;
  district?: string;
  commodity?: string;
  date?: string;
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
}

export const marketService = {
  async getPrices(params: MarketPricesParams = {}): Promise<{
    prices: MarketPrice[];
    pagination?: { nextCursor?: string };
  }> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') q.set(k, String(v));
    });
    const query = q.toString();
    const { data } = await request<{ data: MarketPrice[]; meta?: { pagination?: { nextCursor?: string } } }>(
      'GET',
      query ? `${MARKET.PRICES}?${query}` : MARKET.PRICES
    );
    const inner = (data as { data?: MarketPrice[] }).data ?? data;
    const prices = Array.isArray(inner) ? inner : [];
    const meta = (data as { meta?: { pagination?: { nextCursor?: string } } }).meta;
    return { prices, pagination: meta?.pagination };
  },

  async getCommodities(): Promise<Commodity[]> {
    const { data } = await request<ApiEnvelope<Commodity[]>>('GET', MARKET.COMMODITIES);
    const inner = (data as { data?: Commodity[] }).data ?? data;
    return Array.isArray(inner) ? inner : [];
  },

  async getStates(): Promise<StateOption[]> {
    const { data } = await request<ApiEnvelope<StateOption[]>>('GET', MARKET.STATES);
    const inner = (data as { data?: StateOption[] }).data ?? data;
    return Array.isArray(inner) ? inner : [];
  },
};
