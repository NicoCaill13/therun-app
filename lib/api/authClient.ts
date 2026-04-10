import type { ApiEnvelope } from '@/lib/api/types';
import { normalizeApiErrorFromResponse, normalizeNetworkError } from '@/lib/api/normalizeApiError';

function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl || typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }
  return baseUrl.replace(/\/$/, '');
}

function joinUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function unwrapEnvelope<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid API response');
  }
  const env = payload as ApiEnvelope<T>;
  if (!('data' in env)) {
    throw new Error('Invalid API response: missing data');
  }
  return env.data;
}

export async function apiPostJson<TResponse, TBody extends object>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const url = joinUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw normalizeNetworkError(e);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw normalizeApiErrorFromResponse(response.status, payload);
  }

  return unwrapEnvelope<TResponse>(payload);
}

export async function apiPostJsonAuth<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  accessToken: string,
): Promise<TResponse> {
  const url = joinUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw normalizeNetworkError(e);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw normalizeApiErrorFromResponse(response.status, payload);
  }

  return unwrapEnvelope<TResponse>(payload);
}
