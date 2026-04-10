import { apiPostJson, apiPostJsonAuth } from '@/lib/api/authClient';

describe('apiPostJson', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;
  const fetchMock = jest.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    fetchMock.mockReset();
    jest.restoreAllMocks();
  });

  it('throws when EXPO_PUBLIC_API_URL is missing', async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    await expect(apiPostJson('/x', { a: 1 })).rejects.toThrow('EXPO_PUBLIC_API_URL');
  });

  it('returns unwrapped data on success', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:9';
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 201, path: '/x', data: { ok: true }, timestamp: 't' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await apiPostJson<{ ok: boolean }, { a: number }>('/x', { a: 1 });
    expect(data).toEqual({ ok: true });
  });

  it('throws normalized error on non-OK response', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:9';
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 400, message: 'Invalid', path: '/x' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiPostJson('/x', { a: 1 })).rejects.toMatchObject({
      message: 'Invalid',
    });
  });
});

describe('apiPostJsonAuth', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;
  const fetchMock = jest.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    fetchMock.mockReset();
  });

  it('sends Authorization header and returns unwrapped data', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:9';
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 201, path: '/api/events', data: { id: '1' }, timestamp: 't' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await apiPostJsonAuth<{ id: string }, { title: string }>(
      '/api/events',
      { title: 'Run' },
      'secret-token',
    );
    expect(data).toEqual({ id: '1' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:9/api/events',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token',
        }),
      }),
    );
  });
});
