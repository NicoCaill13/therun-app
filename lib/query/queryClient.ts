import { QueryClient } from '@tanstack/react-query';
import { normalizeApiError, shouldReauthenticate } from '@/lib/api/normalizeApiError';

/**
 * TanStack Query client configuration.
 * Based on spec.md Phase 0.2 requirements:
 * - staleTime: 5 min
 * - refetchOnWindowFocus: false
 * - retry: (count, err) => err.kind !== 'UNAUTHORIZED' && count < 2
 */

/**
 * Custom retry function that doesn't retry on auth errors.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Max 2 retries
  if (failureCount >= 2) {
    return false;
  }

  // Don't retry on auth errors
  const normalized = normalizeApiError(error);
  if (shouldReauthenticate(normalized)) {
    return false;
  }

  // Retry on network and server errors
  return normalized.kind === 'NETWORK' || normalized.kind === 'SERVER';
}

/**
 * Create and configure the QueryClient instance.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: shouldRetry,
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: shouldRetry,
        networkMode: 'offlineFirst',
      },
    },
  });
}

/**
 * Singleton query client instance.
 * Use this in the app provider.
 */
let queryClientInstance: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
}

/**
 * Reset the query client (useful for logout).
 */
export function resetQueryClient(): void {
  if (queryClientInstance) {
    queryClientInstance.clear();
  }
}
