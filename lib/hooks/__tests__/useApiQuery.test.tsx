import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiQuery } from '../useApiQuery';
import { normalizeApiError } from '@/lib/api/normalizeApiError';
import { AxiosError, AxiosHeaders } from 'axios';

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useApiQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on successful query', async () => {
    const mockData = { id: '1', name: 'Test Event' };
    const queryFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useApiQuery(['test', 'success'], queryFn),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('should normalize error on failed query', async () => {
    const mockError = new AxiosError(
      'Network Error',
      'ERR_NETWORK',
      undefined,
      undefined,
      undefined
    );
    const queryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiQuery(['test', 'error'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.kind).toBe('NETWORK');
    expect(result.current.error?.message).toBeTruthy();
  });

  it('should handle 404 errors correctly', async () => {
    const mockError = new AxiosError(
      'Not Found',
      '404',
      undefined,
      undefined,
      {
        status: 404,
        data: { message: 'Resource not found' },
        statusText: 'Not Found',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const queryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiQuery(['test', '404'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('NOT_FOUND');
  });

  it('should handle 401 unauthorized errors', async () => {
    const mockError = new AxiosError(
      'Unauthorized',
      '401',
      undefined,
      undefined,
      {
        status: 401,
        data: { message: 'Session expired' },
        statusText: 'Unauthorized',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const queryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiQuery(['test', '401'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('UNAUTHORIZED');
  });

  it('should handle 400 validation errors', async () => {
    const mockError = new AxiosError(
      'Bad Request',
      '400',
      undefined,
      undefined,
      {
        status: 400,
        data: { message: 'Invalid input', field: 'email' },
        statusText: 'Bad Request',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const queryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiQuery(['test', '400'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('VALIDATION');
    expect(result.current.error?.field).toBe('email');
  });

  it('should handle 500 server errors', async () => {
    const mockError = new AxiosError(
      'Internal Server Error',
      '500',
      undefined,
      undefined,
      {
        status: 500,
        data: { message: 'Server error' },
        statusText: 'Internal Server Error',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const queryFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiQuery(['test', '500'], queryFn),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('SERVER');
  });

  it('should not fetch when enabled is false', async () => {
    const queryFn = jest.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(
      () =>
        useApiQuery(['test', 'disabled'], queryFn, {
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    // Wait a bit to ensure query doesn't start
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('should use correct query key', async () => {
    const queryFn = jest.fn().mockResolvedValue({ data: 'test' });
    const queryKey = ['events', 'list', { status: 'ONGOING' }] as const;

    const { result } = renderHook(() => useApiQuery(queryKey, queryFn), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryFn).toHaveBeenCalled();
  });
});
