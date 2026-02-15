/**
 * Callback invoked when the API returns 401 (session expired / invalid token).
 * AuthProvider registers signOut here so the API client can trigger logout without circular deps.
 */
let handler: (() => void) | null = null;

export function setOnUnauthorized(fn: () => void): void {
  handler = fn;
}

export function clearOnUnauthorized(): void {
  handler = null;
}

export function triggerOnUnauthorized(): void {
  if (handler) {
    handler();
  }
}
