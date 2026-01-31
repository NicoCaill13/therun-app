import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  InfiniteData,
} from '@tanstack/react-query';
import { normalizeApiError, NormalizedApiError } from '@/lib/api/normalizeApiError';

/**
 * Page param type for infinite queries.
 */
export interface InfinitePageParam {
  page: number;
}

/**
 * Extended infinite query options with automatic error handling.
 */
type UseApiInfiniteQueryOptions<TData, TQueryKey extends readonly unknown[]> = Omit<
  UseInfiniteQueryOptions<TData, NormalizedApiError, InfiniteData<TData>, TQueryKey, InfinitePageParam>,
  'queryFn' | 'getNextPageParam' | 'initialPageParam'
> & {
  getNextPageParam: (lastPage: TData, allPages: TData[]) => InfinitePageParam | undefined;
};

/**
 * Hook for paginated API queries with automatic error normalization.
 * Wraps TanStack Query's useInfiniteQuery with:
 * - Automatic error normalization
 * - Consistent error typing
 * - Simplified page param handling
 *
 * @example
 * const { data, error, fetchNextPage, hasNextPage } = useApiInfiniteQuery(
 *   ['events', 'mine', { scope: 'future' }],
 *   async ({ pageParam }) => {
 *     const response = await apiClient.get('/me/events', {
 *       params: { scope: 'future', page: pageParam.page }
 *     });
 *     return response.data;
 *   },
 *   {
 *     getNextPageParam: (lastPage) =>
 *       lastPage.page < Math.ceil(lastPage.total / lastPage.pageSize)
 *         ? { page: lastPage.page + 1 }
 *         : undefined,
 *   }
 * );
 */
export function useApiInfiniteQuery<TData = unknown, TQueryKey extends readonly unknown[] = readonly unknown[]>(
  queryKey: TQueryKey,
  queryFn: (context: { pageParam: InfinitePageParam }) => Promise<TData>,
  options: UseApiInfiniteQueryOptions<TData, TQueryKey>
): UseInfiniteQueryResult<InfiniteData<TData>, NormalizedApiError> {
  const { getNextPageParam, ...restOptions } = options;

  return useInfiniteQuery<TData, NormalizedApiError, InfiniteData<TData>, TQueryKey, InfinitePageParam>({
    queryKey,
    queryFn: async (context) => {
      try {
        return await queryFn({ pageParam: context.pageParam });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    initialPageParam: { page: 1 },
    getNextPageParam,
    ...restOptions,
  });
}
