export type GetTokenFn = () => Promise<string | null> | string | null;
export type OnUnauthorizedFn = () => void | Promise<void>;
export interface ApiClientOptions {
    baseURL: string;
    getToken: GetTokenFn;
    onUnauthorized?: OnUnauthorizedFn;
}
/** Minimal client interface for consumers that need the reference. */
export interface ApiClient {
    request<T = unknown>(method: string, path: string, data?: unknown, opts?: RequestOptions): Promise<{
        data: T;
    }>;
}
/**
 * Create and configure the API client. Call once at app init (e.g. in mobile services/api.ts).
 * Uses fetch (no Node-only deps), so it works in React Native and browser.
 */
export declare function createApiClient(options: ApiClientOptions): ApiClient;
export declare function getApiClient(): ApiClient | null;
export interface RequestOptions {
    body?: FormData;
    headers?: Record<string, string>;
}
/**
 * Request helper. Uses the client created by createApiClient.
 * For FormData pass opts.body and omit or pass data as null.
 */
export declare function request<T = unknown>(method: string, path: string, data?: unknown, opts?: RequestOptions): Promise<{
    data: T;
}>;
//# sourceMappingURL=client.d.ts.map