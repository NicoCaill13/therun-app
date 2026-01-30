import { AxiosError } from 'axios';

/**
 * Normalized error kinds for consistent error handling across the app.
 * Based on spec.md Phase 0.2 requirements.
 */
export type ApiErrorKind =
  | 'PLAN_LIMIT'    // 403 - User exceeded plan limits (triggers upsell)
  | 'VALIDATION'    // 400 - Bad request / validation error
  | 'UNAUTHORIZED'  // 401 - Not authenticated
  | 'FORBIDDEN'     // 403 - Not authorized (not plan-related)
  | 'NOT_FOUND'     // 404 - Resource not found
  | 'CONFLICT'      // 409 - Resource conflict
  | 'NETWORK'       // Network error / timeout / offline
  | 'SERVER'        // 500+ - Server error
  | 'UNKNOWN';      // Fallback for unexpected errors

/**
 * Normalized API error structure.
 * Provides consistent error handling regardless of the source.
 */
export interface NormalizedApiError {
  kind: ApiErrorKind;
  message: string;
  statusCode: number | null;
  field?: string;           // For validation errors, the field that failed
  details?: unknown;        // Original error details for debugging
  originalError: unknown;   // The original error for logging
}

/**
 * Check if error response indicates a plan limit issue.
 * Plan limit errors should have specific markers in the response.
 */
function isPlanLimitError(data: unknown): boolean {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    return (
      obj.code === 'PLAN_LIMIT' ||
      obj.error === 'PLAN_LIMIT' ||
      (typeof obj.message === 'string' && obj.message.includes('plan'))
    );
  }
  return false;
}

/**
 * Extract error message from various response formats.
 */
function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
    if (typeof obj.error === 'string') {
      return obj.error;
    }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors[0];
      if (typeof first === 'string') return first;
      if (typeof first?.message === 'string') return first.message;
    }
  }
  return fallback;
}

/**
 * Extract validation field from error response.
 */
function extractField(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.field === 'string') {
      return obj.field;
    }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const first = obj.errors[0];
      if (typeof first?.field === 'string') return first.field;
      if (typeof first?.path === 'string') return first.path;
    }
  }
  return undefined;
}

/**
 * Normalize any API error into a consistent structure.
 * Use this in all API call catch blocks for uniform error handling.
 * 
 * @example
 * try {
 *   await apiClient.post('/events', data);
 * } catch (error) {
 *   const normalized = normalizeApiError(error);
 *   if (normalized.kind === 'PLAN_LIMIT') {
 *     showUpsellModal();
 *   } else {
 *     showToast(normalized.message);
 *   }
 * }
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const { response, code } = error;

    // Network errors (no response)
    if (!response) {
      const isTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT';
      const isOffline = code === 'ERR_NETWORK';
      
      return {
        kind: 'NETWORK',
        message: isTimeout
          ? 'La requête a expiré. Vérifiez votre connexion.'
          : isOffline
            ? 'Vous êtes hors ligne. Vérifiez votre connexion internet.'
            : 'Erreur réseau. Veuillez réessayer.',
        statusCode: null,
        originalError: error,
      };
    }

    const { status, data } = response;
    const message = extractMessage(data, error.message);

    // 400 - Validation error
    if (status === 400) {
      return {
        kind: 'VALIDATION',
        message,
        statusCode: status,
        field: extractField(data),
        details: data,
        originalError: error,
      };
    }

    // 401 - Unauthorized
    if (status === 401) {
      return {
        kind: 'UNAUTHORIZED',
        message: 'Session expirée. Veuillez vous reconnecter.',
        statusCode: status,
        originalError: error,
      };
    }

    // 403 - Forbidden (check for plan limit vs regular forbidden)
    if (status === 403) {
      if (isPlanLimitError(data)) {
        return {
          kind: 'PLAN_LIMIT',
          message: message || 'Vous avez atteint la limite de votre forfait.',
          statusCode: status,
          details: data,
          originalError: error,
        };
      }
      return {
        kind: 'FORBIDDEN',
        message: message || 'Vous n\'avez pas les droits pour cette action.',
        statusCode: status,
        originalError: error,
      };
    }

    // 404 - Not found
    if (status === 404) {
      return {
        kind: 'NOT_FOUND',
        message: message || 'Ressource introuvable.',
        statusCode: status,
        originalError: error,
      };
    }

    // 409 - Conflict
    if (status === 409) {
      return {
        kind: 'CONFLICT',
        message: message || 'Conflit avec une ressource existante.',
        statusCode: status,
        originalError: error,
      };
    }

    // 5xx - Server errors
    if (status >= 500) {
      return {
        kind: 'SERVER',
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        statusCode: status,
        originalError: error,
      };
    }

    // Other HTTP errors
    return {
      kind: 'UNKNOWN',
      message,
      statusCode: status,
      details: data,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      kind: 'UNKNOWN',
      message: error.message,
      statusCode: null,
      originalError: error,
    };
  }

  // Handle unknown error types
  return {
    kind: 'UNKNOWN',
    message: 'Une erreur inattendue s\'est produite.',
    statusCode: null,
    originalError: error,
  };
}

/**
 * Type guard to check if an error is a specific kind.
 */
export function isApiErrorKind(error: NormalizedApiError, kind: ApiErrorKind): boolean {
  return error.kind === kind;
}

/**
 * Check if error should trigger upsell modal.
 */
export function shouldShowUpsell(error: NormalizedApiError): boolean {
  return error.kind === 'PLAN_LIMIT';
}

/**
 * Check if error should trigger logout/re-auth.
 */
export function shouldReauthenticate(error: NormalizedApiError): boolean {
  return error.kind === 'UNAUTHORIZED';
}
