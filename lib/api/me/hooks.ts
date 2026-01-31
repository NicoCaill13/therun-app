import { useApiQuery } from '@/lib/hooks';
import { apiClient } from '@/lib/api/client';
import {
  ProfileWithBenefitsResponse,
  ProfileWithBenefitsResponseSchema,
} from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const meKeys = {
  all: ['me'] as const,
  profile: () => [...meKeys.all, 'profile'] as const,
};

// ============================================================================
// useProfile - Get current user's profile with plan benefits
// ============================================================================

interface UseProfileOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch current user's profile with plan benefits.
 * Uses GET /me endpoint.
 */
export function useProfile(options?: UseProfileOptions) {
  return useApiQuery<ProfileWithBenefitsResponse>(
    meKeys.profile(),
    async () => {
      const response = await apiClient.get('/me');

      // Validate response with Zod (DoD 1)
      return ProfileWithBenefitsResponseSchema.parse(response.data);
    },
    {
      enabled: options?.enabled ?? true,
    }
  );
}
