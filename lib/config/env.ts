import Constants from 'expo-constants';

/**
 * Environment configuration.
 * Values loaded from app.config.js extra or fallback to defaults.
 * Production: API = api.runningparty.run, Web = runningparty.run
 */

const extra = Constants.expoConfig?.extra ?? {};

/** API base URL. Dev: localhost:3000, Prod: https://api.runningparty.run */
export const API_BASE_URL: string = extra.apiBaseUrl ?? 'http://localhost:3000';

/** Auth API paths (relative to API_BASE_URL, no leading slash). */
export const AUTH_REGISTER_PATH = 'user/register';

/** Deep link scheme for native app. */
export const APP_SCHEME: string = extra.appScheme ?? 'the-run';

/** Web domain for universal links. */
export const WEB_DOMAIN: string = extra.webDomain ?? 'runningparty.run';

/** Full web URL for sharing. */
export const WEB_URL: string = extra.webUrl ?? `https://${WEB_DOMAIN}`;

/** Check if running in development mode. */
export const IS_DEV: boolean = __DEV__ ?? false;

if (IS_DEV) {
  console.log('[config] API_BASE_URL:', API_BASE_URL);
}
