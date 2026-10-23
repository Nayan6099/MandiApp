/**
 * Every generated API hook calls this function.
 * One place to set the base URL, parse JSON and turn HTTP errors into exceptions.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { accept: 'application/json', ...options?.headers },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};
