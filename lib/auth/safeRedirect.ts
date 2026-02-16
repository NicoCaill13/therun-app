/**
 * Validate a redirect path to prevent open-redirect attacks.
 * Only allows relative paths starting with /.
 * Returns the sanitized path or undefined if invalid.
 */
export function safeRedirect(redirectTo: string | undefined | null): string | undefined {
  if (!redirectTo) return undefined;

  // Must be a relative path starting with /
  if (!redirectTo.startsWith('/')) return undefined;

  // Block protocol-relative URLs (//evil.com)
  if (redirectTo.startsWith('//')) return undefined;

  // Block javascript: and data: URIs hidden in paths
  const lower = redirectTo.toLowerCase().trim();
  if (lower.includes('javascript:') || lower.includes('data:')) return undefined;

  return redirectTo;
}
