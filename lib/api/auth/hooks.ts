import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { AUTH_REGISTER_PATH } from '@/lib/config/env';
import { useAuth } from '@/lib/auth';
import { normalizeApiError } from '@/lib/api/normalizeApiError';
import { AuthResponseSchema } from './types';
import type { RegisterInput, AuthResponse } from './types';

/**
 * Register a new user account.
 * POST /api/user/register
 * Auto-signs in on success.
 */
export function useRegister() {
  const { signIn } = useAuth();

  return useMutation<AuthResponse, ReturnType<typeof normalizeApiError>, RegisterInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post(`/api/${AUTH_REGISTER_PATH}`, {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        acceptTerms: input.acceptTerms,
      });
      return AuthResponseSchema.parse(data);
    },
    onSuccess: async (response) => {
      const { accessToken, user } = response;
      await signIn(accessToken, {
        id: user.id,
        email: user.email,
        displayName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
        isGuest: user.isGuest,
      });
    },
    onError: (error) => {
      console.error('[useRegister] error:', error);
    },
  });
}
