export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(url: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

const apiBase = '/api';

export const api = {
  get: <T>(path: string) => request<T>(`${apiBase}${path}`, 'GET'),
  post: <T>(path: string, body?: unknown) => request<T>(`${apiBase}${path}`, 'POST', body),
  put: <T>(path: string, body?: unknown) => request<T>(`${apiBase}${path}`, 'PUT', body),
  delete: <T>(path: string) => request<T>(`${apiBase}${path}`, 'DELETE')
};


