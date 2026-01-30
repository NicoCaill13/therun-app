import { AxiosError } from 'axios';
import {
  normalizeApiError,
  isApiErrorKind,
  shouldShowUpsell,
  shouldReauthenticate,
} from '../normalizeApiError';

function createAxiosError(status: number, data: Record<string, unknown> = {}) {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    { status, data, statusText: String(status), headers: {}, config: {} as any }
  );
}

describe('normalizeApiError', () => {
  describe('Axios errors with response', () => {
    it('should return VALIDATION for 400', () => {
      const err = createAxiosError(400, { message: 'Validation failed' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('VALIDATION');
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Validation failed');
    });

    it('should return UNAUTHORIZED for 401', () => {
      const err = createAxiosError(401);
      const result = normalizeApiError(err);
      expect(result.kind).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
    });

    it('should return PLAN_LIMIT for 403 when message contains "plan"', () => {
      const err = createAxiosError(403, { message: 'plan limit reached' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('PLAN_LIMIT');
      expect(result.statusCode).toBe(403);
    });

    it('should return PLAN_LIMIT for 403 when code is PLAN_LIMIT', () => {
      const err = createAxiosError(403, { code: 'PLAN_LIMIT' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('PLAN_LIMIT');
    });

    it('should return FORBIDDEN for 403 when not plan limit', () => {
      const err = createAxiosError(403, { message: 'Forbidden' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('FORBIDDEN');
      expect(result.statusCode).toBe(403);
    });

    it('should return NOT_FOUND for 404', () => {
      const err = createAxiosError(404, { message: 'Event not found' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('NOT_FOUND');
      expect(result.statusCode).toBe(404);
    });

    it('should return CONFLICT for 409', () => {
      const err = createAxiosError(409, { message: 'Conflict' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('CONFLICT');
      expect(result.statusCode).toBe(409);
    });

    it('should return SERVER for 500', () => {
      const err = createAxiosError(500);
      const result = normalizeApiError(err);
      expect(result.kind).toBe('SERVER');
      expect(result.statusCode).toBe(500);
    });

    it('should return SERVER for 502', () => {
      const err = createAxiosError(502);
      const result = normalizeApiError(err);
      expect(result.kind).toBe('SERVER');
    });

    it('should return UNKNOWN for other status codes', () => {
      const err = createAxiosError(418, { message: 'Teapot' });
      const result = normalizeApiError(err);
      expect(result.kind).toBe('UNKNOWN');
      expect(result.statusCode).toBe(418);
    });
  });

  describe('Axios errors without response (network)', () => {
    it('should return NETWORK for ECONNABORTED', () => {
      const err = new AxiosError('timeout', 'ECONNABORTED');
      const result = normalizeApiError(err);
      expect(result.kind).toBe('NETWORK');
      expect(result.statusCode).toBeNull();
    });

    it('should return NETWORK for ERR_NETWORK', () => {
      const err = new AxiosError('Network Error', 'ERR_NETWORK');
      const result = normalizeApiError(err);
      expect(result.kind).toBe('NETWORK');
    });
  });

  describe('non-Axios errors', () => {
    it('should return UNKNOWN for Error instance', () => {
      const result = normalizeApiError(new Error('Something went wrong'));
      expect(result.kind).toBe('UNKNOWN');
      expect(result.message).toBe('Something went wrong');
      expect(result.statusCode).toBeNull();
    });

    it('should return UNKNOWN for unknown type', () => {
      const result = normalizeApiError('string error');
      expect(result.kind).toBe('UNKNOWN');
      expect(result.message).toContain('inattendue');
    });
  });
});

describe('isApiErrorKind', () => {
  it('should return true when kind matches', () => {
    const err = normalizeApiError(createAxiosError(404));
    expect(isApiErrorKind(err, 'NOT_FOUND')).toBe(true);
  });

  it('should return false when kind does not match', () => {
    const err = normalizeApiError(createAxiosError(404));
    expect(isApiErrorKind(err, 'VALIDATION')).toBe(false);
  });
});

describe('shouldShowUpsell', () => {
  it('should return true for PLAN_LIMIT', () => {
    const err = normalizeApiError(createAxiosError(403, { code: 'PLAN_LIMIT' }));
    expect(shouldShowUpsell(err)).toBe(true);
  });

  it('should return false for other kinds', () => {
    const err = normalizeApiError(createAxiosError(400));
    expect(shouldShowUpsell(err)).toBe(false);
  });
});

describe('shouldReauthenticate', () => {
  it('should return true for UNAUTHORIZED', () => {
    const err = normalizeApiError(createAxiosError(401));
    expect(shouldReauthenticate(err)).toBe(true);
  });

  it('should return false for other kinds', () => {
    const err = normalizeApiError(createAxiosError(404));
    expect(shouldReauthenticate(err)).toBe(false);
  });
});
