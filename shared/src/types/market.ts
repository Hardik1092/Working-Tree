export interface MarketPrice {
  _id?: string;
  commodity?: string;
  market?: string;
  state?: string;
  district?: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  date?: string;
  [key: string]: unknown;
}

export interface Commodity {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface StateOption {
  _id?: string;
  name?: string;
  state?: string;
  [key: string]: unknown;
}
