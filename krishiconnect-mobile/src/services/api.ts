import { createApiClient, request as sharedRequest } from '@krishiconnect/shared';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

let apiInitialized = false;
let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void): void {
  onUnauthorizedCallback = cb;
}

export function initApi(): void {
  if (apiInitialized) return;
  createApiClient({
    baseURL: env.API_BASE_URL,
    getToken: () => useAuthStore.getState().accessToken,
    onUnauthorized: async () => {
      await useAuthStore.getState().logout();
      onUnauthorizedCallback?.();
    },
  });
  apiInitialized = true;
}

export async function request<T = unknown>(
  method: string,
  path: string,
  data?: unknown,
  opts?: { body?: FormData; headers?: Record<string, string> }
): Promise<{ data: T }> {
  return sharedRequest<T>(method, path, data ?? null, opts ?? {});
}
