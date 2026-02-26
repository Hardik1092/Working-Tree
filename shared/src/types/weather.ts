export interface WeatherCurrent {
  temperature?: number;
  condition?: string;
  description?: string;
  humidity?: number;
  windSpeed?: number;
  location?: string;
  icon?: string;
  [key: string]: unknown;
}
