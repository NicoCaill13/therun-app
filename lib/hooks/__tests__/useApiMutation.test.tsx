import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiMutation } from '../useApiMutation';
import { AxiosError, AxiosHeaders } from 'axios';

// Mock the UpsellModalProvider
const mockShowUpsell = jest.fn();

jest.mock('@/components/providers', () => ({
  useUpsellModal: () => ({
    showUpsell: mockShowUpsell,
    hideUpsell: jest.fn(),
    isVisible: false,
  }),
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('useApiMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on successful mutation', async () => {
    const mockData = { id: '1', name: 'Created Event' };
    const mutationFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      await result.current.mutateAsync({ name: 'New Event' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mutationFn).toHaveBeenCalledWith({ name: 'New Event' });
  });

  it('should normalize error on failed mutation', async () => {
    const mockError = new AxiosError(
      'Network Error',
      'ERR_NETWORK',
      undefined,
      undefined,
      undefined
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('NETWORK');
  });

  it('should show upsell modal on PLAN_LIMIT error by default', async () => {
    const mockError = new AxiosError(
      'Plan Limit',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 403,
        data: { code: 'PLAN_LIMIT', message: 'You have reached your plan limit' },
        statusText: 'Forbidden',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('PLAN_LIMIT');
    expect(mockShowUpsell).toHaveBeenCalledTimes(1);
    expect(mockShowUpsell).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'PLAN_LIMIT' })
    );
  });

  it('should not show upsell modal when autoShowUpsell is false', async () => {
    const mockError = new AxiosError(
      'Plan Limit',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 403,
        data: { code: 'PLAN_LIMIT', message: 'You have reached your plan limit' },
        statusText: 'Forbidden',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useApiMutation(mutationFn, { autoShowUpsell: false }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('PLAN_LIMIT');
    expect(mockShowUpsell).not.toHaveBeenCalled();
  });

  it('should not show upsell modal for non-PLAN_LIMIT errors', async () => {
    const mockError = new AxiosError(
      'Not Found',
      'ERR_BAD_REQUEST',
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
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('NOT_FOUND');
    expect(mockShowUpsell).not.toHaveBeenCalled();
  });

  it('should call custom onError handler', async () => {
    const mockError = new AxiosError(
      'Server Error',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);
    const onError = jest.fn();

    const { result } = renderHook(
      () => useApiMutation(mutationFn, { onError }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'SERVER' }),
      {},
      undefined,
      expect.anything()
    );
  });

  it('should call onSuccess handler on success', async () => {
    const mockData = { id: '1' };
    const mutationFn = jest.fn().mockResolvedValue(mockData);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useApiMutation(mutationFn, { onSuccess }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.mutateAsync({ data: 'test' });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    // TanStack Query v5 passes (data, variables, context) or (data, variables, context, mutation)
    expect(onSuccess).toHaveBeenCalledWith(
      mockData,
      { data: 'test' },
      undefined,
      expect.anything()
    );
  });

  it('should handle validation errors correctly', async () => {
    const mockError = new AxiosError(
      'Validation Error',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        data: {
          message: 'Invalid email format',
          field: 'email',
          errors: [{ field: 'email', message: 'Invalid format' }],
        },
        statusText: 'Bad Request',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ email: 'invalid' });
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('VALIDATION');
    expect(result.current.error?.field).toBe('email');
  });

  it('should handle 403 forbidden errors (non-plan limit)', async () => {
    const mockError = new AxiosError(
      'Forbidden',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 403,
        data: { message: 'Access denied' },
        statusText: 'Forbidden',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    );
    const mutationFn = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApiMutation(mutationFn), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.kind).toBe('FORBIDDEN');
    expect(mockShowUpsell).not.toHaveBeenCalled();
  });
});
