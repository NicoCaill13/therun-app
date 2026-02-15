import { createContext, useContext, useEffect, useReducer, useCallback, useMemo, ReactNode } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  clearAuthStorage,
  hasStoredCredentials,
  type StoredUserData,
} from './storage';
import { setOnUnauthorized, clearOnUnauthorized } from './onUnauthorized';
import { resetQueryClient } from '@/lib/query/queryClient';

/**
 * Auth state structure.
 */
export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  user: StoredUserData | null;
  token: string | null;
}

/**
 * Auth context methods.
 */
export interface AuthContextValue extends AuthState {
  signIn: (token: string, user: StoredUserData) => Promise<void>;
  signInAsGuest: (token: string, guestId: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<StoredUserData>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Reducer
// ============================================================================

type AuthAction =
  | { type: 'REHYDRATE_START' }
  | { type: 'REHYDRATE_SUCCESS'; payload: { token: string; user: StoredUserData } }
  | { type: 'REHYDRATE_FAILURE' }
  | { type: 'SIGN_IN'; payload: { token: string; user: StoredUserData } }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; payload: StoredUserData };

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  user: null,
  token: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'REHYDRATE_START':
      return { ...state, isLoading: true };

    case 'REHYDRATE_SUCCESS':
      return {
        isLoading: false,
        isAuthenticated: true,
        isGuest: action.payload.user.isGuest,
        user: action.payload.user,
        token: action.payload.token,
      };

    case 'REHYDRATE_FAILURE':
      return { ...initialState, isLoading: false };

    case 'SIGN_IN':
      return {
        isLoading: false,
        isAuthenticated: true,
        isGuest: action.payload.user.isGuest,
        user: action.payload.user,
        token: action.payload.token,
      };

    case 'SIGN_OUT':
      return { ...initialState, isLoading: false };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        isGuest: action.payload.isGuest,
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider component.
 * Handles authentication state and rehydration from storage.
 * Uses useReducer for predictable state management (per .cursorrules).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate auth state from storage on mount
  useEffect(() => {
    async function rehydrate() {
      try {
        const hasCredentials = await hasStoredCredentials();

        if (!hasCredentials) {
          dispatch({ type: 'REHYDRATE_FAILURE' });
          return;
        }

        const [token, user] = await Promise.all([
          getAuthToken(),
          getUserData(),
        ]);

        if (token && user) {
          dispatch({ type: 'REHYDRATE_SUCCESS', payload: { token, user } });
        } else {
          await clearAuthStorage();
          dispatch({ type: 'REHYDRATE_FAILURE' });
        }
      } catch (error) {
        console.error('Auth rehydration failed:', error);
        await clearAuthStorage();
        dispatch({ type: 'REHYDRATE_FAILURE' });
      }
    }

    rehydrate();
  }, []);

  /**
   * Sign in with token and user data.
   */
  const signIn = useCallback(async (token: string, user: StoredUserData) => {
    await Promise.all([
      setAuthToken(token),
      setUserData(user),
    ]);

    dispatch({ type: 'SIGN_IN', payload: { token, user } });
  }, []);

  /**
   * Sign in as a guest user.
   */
  const signInAsGuest = useCallback(async (token: string, guestId: string) => {
    const guestUser: StoredUserData = {
      id: guestId,
      email: null,
      displayName: 'Invité',
      isGuest: true,
    };

    await signIn(token, guestUser);
  }, [signIn]);

  /**
   * Sign out and clear all auth state.
   */
  const signOut = useCallback(async () => {
    await clearAuthStorage();
    resetQueryClient();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  // Register signOut so API client can trigger it on 401 (session expired)
  useEffect(() => {
    setOnUnauthorized(signOut);
    return () => clearOnUnauthorized();
  }, [signOut]);

  /**
   * Update user data (e.g., after profile edit).
   */
  const updateUser = useCallback(async (updates: Partial<StoredUserData>) => {
    if (!state.user) return;

    const updatedUser: StoredUserData = {
      ...state.user,
      ...updates,
    };

    await setUserData(updatedUser);
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  }, [state.user]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    signIn,
    signInAsGuest,
    signOut,
    updateUser,
  }), [state, signIn, signInAsGuest, signOut, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access auth context.
 * Must be used within AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to check if user is authenticated.
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if auth is still loading (rehydrating).
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}
