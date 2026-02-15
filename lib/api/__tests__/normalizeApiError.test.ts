import { AxiosError, AxiosHeaders } from 'axios';
import { normalizeApiError } from '../normalizeApiError';

function createAxiosError(
  status: number,
  data: unknown,
  code?: string
): AxiosError {
  const error = new AxiosError(
    'Request failed',
    code ?? 'ERR_BAD_REQUEST',
    undefined,
    {},
    {
      status,
      data,
      statusText: 'Error',
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
  );
  return error;
}

function createNetworkError(code: string): AxiosError {
  const error = new AxiosError('Network Error', code);
  return error;
}

describe('normalizeApiError', () => {
  it('should normalize 400 as VALIDATION', () => {
    const error = createAxiosError(400, { message: 'Invalid email' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('VALIDATION');
    expect(result.message).toBe('Invalid email');
    expect(result.statusCode).toBe(400);
  });

  it('should normalize 401 as UNAUTHORIZED', () => {
    const error = createAxiosError(401, { message: 'Unauthorized' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('UNAUTHORIZED');
    expect(result.statusCode).toBe(401);
  });

  it('should normalize 403 with PLAN_LIMIT marker', () => {
    const error = createAxiosError(403, { code: 'PLAN_LIMIT', message: 'Limit reached' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('PLAN_LIMIT');
  });

  it('should normalize 403 without PLAN_LIMIT as FORBIDDEN', () => {
    const error = createAxiosError(403, { message: 'Forbidden' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('FORBIDDEN');
  });

  it('should normalize 404 as NOT_FOUND', () => {
    const error = createAxiosError(404, { message: 'Not found' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('NOT_FOUND');
    expect(result.statusCode).toBe(404);
  });

  it('should normalize 500 as SERVER', () => {
    const error = createAxiosError(500, { message: 'Internal Server Error' });
    const result = normalizeApiError(error);
    expect(result.kind).toBe('SERVER');
  });

  it('should normalize network error (timeout)', () => {
    const error = createNetworkError('ECONNABORTED');
    const result = normalizeApiError(error);
    expect(result.kind).toBe('NETWORK');
    expect(result.statusCode).toBeNull();
  });

  it('should normalize network error (offline)', () => {
    const error = createNetworkError('ERR_NETWORK');
    const result = normalizeApiError(error);
    expect(result.kind).toBe('NETWORK');
  });

  it('should handle standard Error', () => {
    const result = normalizeApiError(new Error('Something broke'));
    expect(result.kind).toBe('UNKNOWN');
    expect(result.message).toBe('Something broke');
  });

  it('should handle unknown error type', () => {
    const result = normalizeApiError('string error');
    expect(result.kind).toBe('UNKNOWN');
  });
});
