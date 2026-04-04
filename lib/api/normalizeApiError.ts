export type ApiErrorKind =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'NETWORK'
  | 'UNKNOWN';

export interface NormalizedApiError extends Error {
  kind: ApiErrorKind;
  statusCode: number;
  details?: unknown;
}

function kindForStatus(statusCode: number): ApiErrorKind {
  if (statusCode === 400) return 'VALIDATION';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  return 'UNKNOWN';
}

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }

  const err = record.error;
  if (typeof err === 'string' && err.length > 0) return err;

  if (err && typeof err === 'object' && Array.isArray((err as { message?: unknown }).message)) {
    const msgs = (err as { message: unknown[] }).message.filter((m) => typeof m === 'string');
    if (msgs.length > 0) return msgs.join(', ');
  }

  return null;
}

export function normalizeApiErrorFromResponse(statusCode: number, payload: unknown): NormalizedApiError {
  const message = extractMessage(payload) ?? `Request failed (${statusCode})`;
  const err = new Error(message) as NormalizedApiError;
  err.name = 'NormalizedApiError';
  err.kind = kindForStatus(statusCode);
  err.statusCode = statusCode;
  err.details = payload;
  return err;
}

export function normalizeNetworkError(cause?: unknown): NormalizedApiError {
  const err = new Error('Network error. Check your connection.') as NormalizedApiError;
  err.name = 'NormalizedApiError';
  err.kind = 'NETWORK';
  err.statusCode = 0;
  err.details = cause;
  return err;
}
