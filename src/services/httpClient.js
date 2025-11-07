// Lightweight HTTP client built on Fetch API
// - Base URL from Vite env: VITE_API_BASE_URL
// - Attaches Bearer token from localStorage key "accessToken"
// - Handles JSON and FormData bodies
// - Supports query params and request timeout via AbortController

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Get API base URL from environment variable or fallback
 * Production fallback: https://api.beanhotelvn.id.vn/api
 * Development fallback: http://localhost:5000/api
 */
export function getBaseUrl() {
  const envBase = import.meta?.env?.VITE_API_BASE_URL;
  if (typeof envBase === 'string' && envBase.length > 0) {
    return envBase;
  }
  
  // Fallback: check if we're in production (not localhost)
  const isProduction = typeof window !== 'undefined' && 
    !window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1');
  
  return isProduction 
    ? 'https://api.beanhotelvn.id.vn/api'
    : 'http://localhost:5000/api';
}

function safeJoinPaths(baseUrl, path) {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const suffix = path?.startsWith('/') ? path.slice(1) : path;
  return `${base}/${suffix ?? ''}`;
}

function appendQueryParams(url, params) {
  if (!params) return url;
  const u = new URL(url);
  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => u.searchParams.append(key, value));
    return u.toString();
  }
  if (typeof params === 'string') {
    // accept raw query string like "a=1&b=2"
    const parsed = new URLSearchParams(params.startsWith('?') ? params.slice(1) : params);
    parsed.forEach((value, key) => u.searchParams.append(key, value));
    return u.toString();
  }
  if (typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => u.searchParams.append(key, String(v)));
      } else {
        u.searchParams.append(key, String(value));
      }
    });
    return u.toString();
  }
  return url;
}

function getAccessToken() {
  try {
    return localStorage.getItem('accessToken') || '';
  } catch (_err) {
    return '';
  }
}

function createAbortSignalWithTimeout(existingSignal, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return existingSignal ?? undefined;
  const controller = new AbortController();

  const timerId = setTimeout(() => controller.abort(new DOMException('Request timeout', 'TimeoutError')), timeoutMs);

  if (existingSignal) {
    if (existingSignal.aborted) {
      controller.abort(existingSignal.reason);
    } else {
      existingSignal.addEventListener('abort', () => controller.abort(existingSignal.reason), { once: true });
    }
  }

  // Clear timer if our controller aborts for any reason
  controller.signal.addEventListener('abort', () => clearTimeout(timerId), { once: true });

  return controller.signal;
}

async function parseResponseBody(response) {
  // No content
  if (response.status === 204 || response.headers.get('content-length') === '0') return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function handleResponse(response) {
  const body = await parseResponseBody(response);
  if (response.ok) {
    return body;
  }

  const error = new Error(
    (body && (body.message || body.error || body.errorMessage)) || `HTTP ${response.status}`
  );
  error.status = response.status;
  error.data = body;
  throw error;
}

export function createHttpClient({ baseURL = getBaseUrl(), getToken = getAccessToken, onUnauthorized } = {}) {
  async function request(path, { method = 'GET', headers, params, data, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    const urlWithBase = safeJoinPaths(baseURL, path);
    const finalUrl = appendQueryParams(urlWithBase, params);

    const token = getToken?.();
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const finalHeaders = new Headers(headers || {});
    if (!isFormData) {
      // Only set JSON content-type if not sending FormData
      finalHeaders.set('Accept', 'application/json');
      if (data !== undefined && data !== null) {
        finalHeaders.set('Content-Type', 'application/json');
      }
    }
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }

    const fetchOptions = {
      method,
      headers: finalHeaders,
      signal: createAbortSignalWithTimeout(signal, timeoutMs),
    };

    if (data !== undefined && data !== null) {
      fetchOptions.body = isFormData ? data : JSON.stringify(data);
    }

    let response;
    try {
      response = await fetch(finalUrl, fetchOptions);
    } catch (err) {
      // Normalize AbortError name across browsers
      if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
        const timeoutError = new Error('Request was aborted or timed out');
        timeoutError.name = 'AbortError';
        throw timeoutError;
      }
      throw err;
    }

    if (response.status === 401 && typeof onUnauthorized === 'function') {
      try { onUnauthorized(); } catch (_) {}
    }

    return handleResponse(response);
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, data, options) => request(path, { ...options, method: 'POST', data }),
    put: (path, data, options) => request(path, { ...options, method: 'PUT', data }),
    patch: (path, data, options) => request(path, { ...options, method: 'PATCH', data }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  };
}

const http = createHttpClient({
  baseURL: getBaseUrl(),
  getToken: getAccessToken,
  onUnauthorized: () => {
    try { localStorage.removeItem('accessToken'); } catch (_err) {}
  },
});

export default http;


