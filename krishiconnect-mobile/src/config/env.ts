const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:5005/api/v1';

const CROP_DOCTOR_API_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_CROP_DOCTOR_API_URL) ||
  'http://localhost:8000/predict';

export const env = {
  API_BASE_URL: API_BASE_URL.replace(/\/$/, ''),
  CROP_DOCTOR_API_URL: CROP_DOCTOR_API_URL.replace(/\/$/, ''),
};
