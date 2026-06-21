import { clearAccessToken, getAccessToken } from './auth-token';
import type { ApiErrorResponse, ApiSuccessResponse } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: string[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  authenticated?: boolean;
  body?: unknown;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.authenticated) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
    });
  } catch {
    throw new ApiClientError(
      'Unable to reach Kodeye API. Make sure the backend is running.',
      0,
    );
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || !payload.success) {
    if (response.status === 401 && options.authenticated) {
      clearAccessToken();
      if (typeof window !== 'undefined') window.location.assign('/login');
    }
    throw new ApiClientError(
      payload.message || 'Something went wrong. Please try again.',
      response.status,
      'errors' in payload ? (payload.errors ?? []) : [],
    );
  }

  return payload.data;
}

async function parseApiResponse<T>(
  response: Response,
): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return {
      message: response.ok
        ? 'Kodeye API returned an unexpected response.'
        : `Kodeye API returned an unexpected ${response.status} response.`,
      success: false,
    };
  }
  try {
    return (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    return {
      message: 'Kodeye API returned invalid JSON.',
      success: false,
    };
  }
}
