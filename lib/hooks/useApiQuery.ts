import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { normalizeApiError, NormalizedApiError } from '@/lib/api/normalizeApiError';

/**
 * Extended query options with automatic error handling.
 * queryKey and queryFn are provided as separate arguments to useApiQuery.
 */
type UseApiQueryOptions<TData, TQueryKey extends readonly unknown[]> = Omit<
  UseQueryOptions<TData, NormalizedApiError, TData, TQueryKey>,
  'queryFn' | 'queryKey'
>;

/**
 * Hook for API queries with automatic error normalization.
 * Wraps TanStack Query's useQuery with:
 * - Automatic error normalization
 * - Consistent error typing
 *
 * @example
 * const { data, error, isLoading } = useApiQuery(
 *   ['events', 'mine'],
 *   async () => {
 *     const response = await apiClient.get('/me/events');
 *     return response.data;
 *   }
 * );
 *
 * if (error?.kind === 'UNAUTHORIZED') {
 *   // Handle auth error
 * }
 */
export function useApiQuery<TData = unknown, TQueryKey extends readonly unknown[] = readonly unknown[]>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
  options?: UseApiQueryOptions<TData, TQueryKey>
): UseQueryResult<TData, NormalizedApiError> {
  return useQuery<TData, NormalizedApiError, TData, TQueryKey>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    ...options,
  });
}
