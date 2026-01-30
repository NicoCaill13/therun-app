import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { normalizeApiError, NormalizedApiError, shouldShowUpsell } from '@/lib/api/normalizeApiError';
import { useUpsellModal } from '@/components/providers';

/**
 * Extended mutation options with automatic error handling.
 */
interface UseApiMutationOptions<TData, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, NormalizedApiError, TVariables, TContext>, 'mutationFn'> {
  /**
   * If true, automatically show upsell modal on PLAN_LIMIT errors.
   * @default true
   */
  autoShowUpsell?: boolean;
}

/**
 * Hook for API mutations with automatic error normalization.
 * Wraps TanStack Query's useMutation with:
 * - Automatic error normalization
 * - Automatic upsell modal on plan limit errors
 *
 * @example
 * const createEvent = useApiMutation(
 *   async (data: CreateEventDto) => {
 *     const response = await apiClient.post('/events', data);
 *     return response.data;
 *   },
 *   {
 *     onSuccess: (event) => {
 *       queryClient.setQueryData(['events', event.id], event);
 *       router.push(`/event/${event.id}`);
 *     },
 *   }
 * );
 */
export function useApiMutation<TData = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables, TContext>
): UseMutationResult<TData, NormalizedApiError, TVariables, TContext> {
  const { showUpsell } = useUpsellModal();
  const { autoShowUpsell = true, onError, ...restOptions } = options ?? {};

  return useMutation<TData, NormalizedApiError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onError: (error, variables, context, mutation) => {
      // Auto-show upsell on plan limit errors
      if (autoShowUpsell && shouldShowUpsell(error)) {
        showUpsell(error);
      }

      // Call user-provided onError handler
      onError?.(error, variables, context, mutation);
    },
    ...restOptions,
  });
}
