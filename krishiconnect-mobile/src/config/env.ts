const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:5005/api/v1';

export const env = {
  API_BASE_URL: API_BASE_URL.replace(/\/$/, ''),
};
