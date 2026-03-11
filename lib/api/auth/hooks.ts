import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { AUTH_REGISTER_PATH } from '@/lib/config/env';
import { useAuth } from '@/lib/auth';
import { normalizeApiError } from '@/lib/api/normalizeApiError';
import { AuthResponseSchema, LoginResponseSchema } from './types';
import type { RegisterInput, AuthResponse, LoginInput, LoginResponse } from './types';

/**
 * Build a StoredUserData shape from an auth response user.
 */
function toStoredUser(user: AuthResponse['user'] | LoginResponse['user']) {
  return {
    id: user.id,
    email: user.email,
    displayName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
    isGuest: user.isGuest,
  };
}

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
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        acceptTerms: input.acceptTerms,
      });
      return AuthResponseSchema.parse(data);
    },
    onSuccess: async (response) => {
      await signIn(response.accessToken, toStoredUser(response.user));
    },
    onError: (error) => {
      console.error('[useRegister] error:', error);
    },
  });
}

/**
 * Login with email and password.
 * POST /api/user/login
 * Auto-signs in on success.
 */
export function useLogin() {
  const { signIn } = useAuth();

  return useMutation<LoginResponse, ReturnType<typeof normalizeApiError>, LoginInput>({
    mutationFn: async (input) => {
      const { data } = await apiClient.post('/api/user/login', {
        email: input.email,
        password: input.password,
      });
      return LoginResponseSchema.parse(data);
    },
    onSuccess: async (response) => {
      await signIn(response.accessToken, toStoredUser(response.user));
    },
    onError: (error) => {
      console.error('[useLogin] error:', error);
    },
  });
}
