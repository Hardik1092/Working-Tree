"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiClient = createApiClient;
exports.getApiClient = getApiClient;
exports.request = request;
let configuredOptions = null;
function getBaseURL() {
    if (!configuredOptions)
        throw new Error('API client not initialized. Call createApiClient() first.');
    return configuredOptions.baseURL.replace(/\/$/, '');
}
async function getAuthHeaders() {
    if (!configuredOptions)
        return {};
    const token = await Promise.resolve(configuredOptions.getToken());
    if (!token)
        return {};
    return { Authorization: `Bearer ${token}` };
}
/**
 * Create and configure the API client. Call once at app init (e.g. in mobile services/api.ts).
 * Uses fetch (no Node-only deps), so it works in React Native and browser.
 */
function createApiClient(options) {
    configuredOptions = options;
    return {
        request: request,
    };
}
function getApiClient() {
    return configuredOptions ? { request: request } : null;
}
/**
 * Request helper. Uses the client created by createApiClient.
 * For FormData pass opts.body and omit or pass data as null.
 */
async function request(method, path, data = null, opts = {}) {
    if (!configuredOptions) {
        throw new Error('API client not initialized. Call createApiClient() first.');
    }
    const baseURL = getBaseURL();
    const urlPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${baseURL}${urlPath}`;
    const { body, headers: extraHeaders = {} } = opts;
    const isFormData = body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...extraHeaders,
    };
    const authHeaders = await getAuthHeaders();
    Object.assign(headers, authHeaders);
    let res;
    try {
        const init = {
            method,
            headers,
        };
        if (isFormData) {
            init.body = body;
        }
        else if (data != null && ['POST', 'PUT', 'PATCH'].includes(method)) {
            init.body = JSON.stringify(data);
        }
        res = await fetch(url, init);
    }
    catch (err) {
        throw err;
    }
    if (res.status === 401) {
        const isLogin = url.includes('auth/login');
        if (!isLogin && configuredOptions.onUnauthorized) {
            await Promise.resolve(configuredOptions.onUnauthorized());
        }
        let message;
        let json = undefined;
        try {
            json = await res.json();
            message = json.message ?? 'Unauthorized';
        }
        catch {
            message = 'Unauthorized';
        }
        const err = new Error(message);
        err.response = { status: 401, data: json };
        throw err;
    }
    if (!res.ok) {
        let message;
        let json = undefined;
        try {
            json = await res.json();
            message = json.message ?? res.statusText;
        }
        catch {
            message = res.statusText;
        }
        const error = new Error(message);
        error.response = { status: res.status, data: json };
        throw error;
    }
    const contentType = res.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const responseData = isJson ? await res.json() : await res.text();
    return { data: responseData };
}
