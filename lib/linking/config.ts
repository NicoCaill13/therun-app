import * as Linking from 'expo-linking';

import { APP_SCHEME, WEB_DOMAIN } from '@/lib/config/env';

/**
 * Deep linking configuration.
 * Based on spec.md Phase 0.1 requirements:
 * - Universal Links: https://the.run/join/[code]
 * - App Scheme: the-run://
 * - Mapping: /join/[code] (Web) <-> the-run://join/[code] (Native)
 */

/**
 * Shape compatible with Expo / React Navigation linking `config`.
 * Defined locally to avoid importing `@react-navigation/native` in app code.
 */
export interface AppLinkingConfig {
  screens: {
    '(tabs)': {
      screens: {
        home: string;
        two: string;
      };
    };
    'join/[code]': string;
    'event/[id]': string;
    modal: string;
    '+not-found': string;
  };
}

export interface AppLinkingOptions {
  prefixes: string[];
  config: AppLinkingConfig;
}

/**
 * Get the linking prefix for the current platform.
 */
export function getLinkingPrefix(): string {
  return Linking.createURL('/');
}

/**
 * All supported URL prefixes for deep linking.
 */
export const linkingPrefixes = [
  // Native app scheme
  `${APP_SCHEME}://`,
  // Universal links (iOS)
  `https://${WEB_DOMAIN}`,
  `https://www.${WEB_DOMAIN}`,
  // Expo development
  Linking.createURL('/'),
];

/**
 * Route configuration for deep linking.
 * Maps URL paths to screen names.
 */
export const linkingConfig: AppLinkingConfig = {
  screens: {
    // Tab navigator
    '(tabs)': {
      screens: {
        home: '',
        two: 'explore',
      },
    },
    // Join flow (main deep link target)
    'join/[code]': 'join/:code',
    // Event detail
    'event/[id]': 'event/:id',
    // Modal screens
    modal: 'modal',
    // Not found fallback
    '+not-found': '*',
  },
};

/**
 * Full linking options (prefixes + config).
 */
export const linkingOptions: AppLinkingOptions = {
  prefixes: linkingPrefixes,
  config: linkingConfig,
};

/**
 * Parse a deep link URL and extract parameters.
 *
 * @example
 * parseDeepLink('https://the.run/join/ABC123')
 * // Returns: { path: 'join', params: { code: 'ABC123' } }
 */
export function parseDeepLink(url: string): { path: string; params: Record<string, string> } | null {
  try {
    const parsed = Linking.parse(url);

    if (!parsed.path) {
      return null;
    }

    // Handle join/:code pattern
    const joinMatch = parsed.path.match(/^join\/([A-Z0-9]+)$/i);
    if (joinMatch) {
      return {
        path: 'join',
        params: { code: joinMatch[1].toUpperCase() },
      };
    }

    // Handle event/:id pattern
    const eventMatch = parsed.path.match(/^event\/([a-z0-9-]+)$/i);
    if (eventMatch) {
      return {
        path: 'event',
        params: { id: eventMatch[1] },
      };
    }

    return {
      path: parsed.path,
      params: (parsed.queryParams as Record<string, string> | undefined) ?? {},
    };
  } catch {
    return null;
  }
}

/**
 * Generate a join link for sharing.
 *
 * @param code - The event join code
 * @param preferNative - If true, use the native app scheme; otherwise use universal link
 */
export function generateJoinLink(code: string, preferNative = false): string {
  if (preferNative) {
    return `${APP_SCHEME}://join/${code}`;
  }
  return `https://${WEB_DOMAIN}/join/${code}`;
}

/**
 * Generate an event detail link.
 *
 * @param eventId - The event ID
 * @param preferNative - If true, use the native app scheme
 */
export function generateEventLink(eventId: string, preferNative = false): string {
  if (preferNative) {
    return `${APP_SCHEME}://event/${eventId}`;
  }
  return `https://${WEB_DOMAIN}/event/${eventId}`;
}
