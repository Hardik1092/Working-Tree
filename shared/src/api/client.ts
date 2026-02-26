export type GetTokenFn = () => Promise<string | null> | string | null;
export type OnUnauthorizedFn = () => void | Promise<void>;

export interface ApiClientOptions {
  baseURL: string;
  getToken: GetTokenFn;
  onUnauthorized?: OnUnauthorizedFn;
}

/** Minimal client interface for consumers that need the reference. */
export interface ApiClient {
  request<T = unknown>(
    method: string,
    path: string,
    data?: unknown,
    opts?: RequestOptions
  ): Promise<{ data: T }>;
}

let configuredOptions: ApiClientOptions | null = null;

function getBaseURL(): string {
  if (!configuredOptions) throw new Error('API client not initialized. Call createApiClient() first.');
  return configuredOptions.baseURL.replace(/\/$/, '');
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!configuredOptions) return {};
  const token = await Promise.resolve(configuredOptions.getToken());
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create and configure the API client. Call once at app init (e.g. in mobile services/api.ts).
 * Uses fetch (no Node-only deps), so it works in React Native and browser.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  configuredOptions = options;
  return {
    request: request as ApiClient['request'],
  };
}

export function getApiClient(): ApiClient | null {
  return configuredOptions ? { request: request as ApiClient['request'] } : null;
}

export interface RequestOptions {
  body?: FormData;
  headers?: Record<string, string>;
}

/**
 * Request helper. Uses the client created by createApiClient.
 * For FormData pass opts.body and omit or pass data as null.
 */
export async function request<T = unknown>(
  method: string,
  path: string,
  data: unknown = null,
  opts: RequestOptions = {}
): Promise<{ data: T }> {
  if (!configuredOptions) {
    throw new Error('API client not initialized. Call createApiClient() first.');
  }

  const baseURL = getBaseURL();
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseURL}${urlPath}`;
  const { body, headers: extraHeaders = {} } = opts;
  const isFormData = body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...extraHeaders,
  };

  const authHeaders = await getAuthHeaders();
  Object.assign(headers, authHeaders);

  let res: Response;
  try {
    const init: RequestInit = {
      method,
      headers,
    };
    if (isFormData) {
      init.body = body;
    } else if (data != null && ['POST', 'PUT', 'PATCH'].includes(method)) {
      init.body = JSON.stringify(data);
    }
    res = await fetch(url, init);
  } catch (err) {
    throw err;
  }

  if (res.status === 401) {
    const isLogin = url.includes('auth/login');
    if (!isLogin && configuredOptions.onUnauthorized) {
      await Promise.resolve(configuredOptions.onUnauthorized());
    }
    let message: string;
    let json: unknown = undefined;
    try {
      json = await res.json();
      message = (json as { message?: string }).message ?? 'Unauthorized';
    } catch {
      message = 'Unauthorized';
    }
    const err = new Error(message) as Error & { response?: { status: number; data?: unknown } };
    err.response = { status: 401, data: json };
    throw err;
  }

  if (!res.ok) {
    let message: string;
    let json: unknown = undefined;
    try {
      json = await res.json();
      message = (json as { message?: string }).message ?? res.statusText;
    } catch {
      message = res.statusText;
    }
    const error = new Error(message) as Error & { response?: { status: number; data?: unknown } };
    error.response = { status: res.status, data: json };
    throw error;
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const responseData = isJson ? await res.json() : await res.text();

  return { data: responseData as T };
}
