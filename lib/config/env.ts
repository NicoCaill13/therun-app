import Constants from 'expo-constants';

/**
 * Environment configuration.
 * Values are loaded from app.config.js extra or fallback to defaults.
 */

const extra = Constants.expoConfig?.extra ?? {};

/**
 * API base URL for backend requests.
 * In development, defaults to localhost.
 */
export const API_BASE_URL: string = extra.apiBaseUrl ?? 'http://localhost:3000';

/**
 * Application scheme for deep linking.
 */
export const APP_SCHEME: string = extra.appScheme ?? 'the-run';

/**
 * Web domain for universal links.
 */
export const WEB_DOMAIN: string = extra.webDomain ?? 'the.run';

/**
 * Check if running in development mode.
 */
export const IS_DEV: boolean = __DEV__ ?? false;

/**
 * Environment name (development, staging, production).
 */
export const ENV_NAME: string = extra.envName ?? (IS_DEV ? 'development' : 'production');
