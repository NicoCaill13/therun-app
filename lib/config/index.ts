export {
  API_BASE_URL,
  APP_SCHEME,
  WEB_DOMAIN,
  WEB_URL,
  IS_DEV,
  ENV_NAME,
} from './env';

import {
  API_BASE_URL,
  APP_SCHEME,
  WEB_DOMAIN,
  WEB_URL,
  IS_DEV,
  ENV_NAME,
} from './env';

/**
 * Configuration object for convenient access.
 */
export const config = {
  apiBaseUrl: API_BASE_URL,
  appScheme: APP_SCHEME,
  webDomain: WEB_DOMAIN,
  webUrl: WEB_URL,
  isDev: IS_DEV,
  envName: ENV_NAME,
} as const;
