const BASE = import.meta.env.VITE_API_URL as string;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Typed error thrown by the api helpers so callers can inspect the HTTP
 * status and the parsed `detail` (server-provided human-readable message).
 */
export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Pull a human-readable message out of a non-2xx response body. Tries the
 * common JSON shapes first ({ message }, { error }, { error: { message } },
 * { errors[].message }), then falls back to the raw text.
 */
function extractErrorMessage(body: string): string {
  if (!body) return '';
  try {
    const json = JSON.parse(body);
    if (typeof json === 'string') return json;
    if (json && typeof json === 'object') {
      const j = json as Record<string, unknown>;
      if (typeof j.message === 'string' && j.message) return j.message;
      if (typeof j.error === 'string' && j.error) return j.error;
      if (j.error && typeof j.error === 'object') {
        const m = (j.error as Record<string, unknown>).message;
        if (typeof m === 'string' && m) return m;
      }
      if (Array.isArray(j.errors) && j.errors.length > 0) {
        const first = j.errors[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object') {
          const m = (first as Record<string, unknown>).message;
          if (typeof m === 'string' && m) return m;
        }
      }
      return JSON.stringify(json);
    }
  } catch {
    /* not JSON */
  }
  return body;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    const detail = extractErrorMessage(raw);
    throw new ApiError(detail || `HTTP ${res.status}`, res.status, detail);
  }
  const json: unknown = await res.json();
  // Unwrap { data: ... } envelope if present, otherwise return as-is.
  if (
    json !== null &&
    typeof json === 'object' &&
    !Array.isArray(json) &&
    'data' in (json as object)
  ) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { ...authHeaders() },
  });
  return parseResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

// Omit Content-Type so the browser sets multipart boundary automatically.
export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  return parseResponse<T>(res);
}

export async function apiPutForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { ...authHeaders() },
    body: form,
  });
  return parseResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    const detail = extractErrorMessage(raw);
    throw new ApiError(detail || `HTTP ${res.status}`, res.status, detail);
  }
  // 204 No Content — nothing to parse
}
