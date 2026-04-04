import { normalizeApiErrorFromResponse, normalizeNetworkError } from '@/lib/api/normalizeApiError';

describe('normalizeApiError', () => {
  it('maps status codes to kinds', () => {
    const e400 = normalizeApiErrorFromResponse(400, { message: 'Bad' });
    expect(e400.kind).toBe('VALIDATION');
    expect(e400.message).toBe('Bad');

    const e401 = normalizeApiErrorFromResponse(401, { message: 'Nope' });
    expect(e401.kind).toBe('UNAUTHORIZED');

    const e404 = normalizeApiErrorFromResponse(404, { message: 'Missing' });
    expect(e404.kind).toBe('NOT_FOUND');

    const e409 = normalizeApiErrorFromResponse(409, { message: 'Conflict' });
    expect(e409.kind).toBe('CONFLICT');
  });

  it('falls back to status text when message missing', () => {
    const e = normalizeApiErrorFromResponse(500, {});
    expect(e.kind).toBe('UNKNOWN');
    expect(e.message).toContain('500');
  });

  it('creates network error', () => {
    const e = normalizeNetworkError();
    expect(e.kind).toBe('NETWORK');
    expect(e.statusCode).toBe(0);
  });
});
