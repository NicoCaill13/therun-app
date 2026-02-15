/**
 * Expo config with env-based extra.
 * EXPO_PUBLIC_* from .env are applied to extra so the app can reach the API.
 *
 * When testing on a physical device (Expo Go), set in .env:
 *   EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_IP:3000
 */
require('dotenv').config();
const base = require('./app.json');

module.exports = {
  ...base.expo,
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? base.expo.extra?.apiBaseUrl ?? 'http://localhost:3000',
    authLoginPath: process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH ?? base.expo.extra?.authLoginPath ?? 'user/login',
    authRegisterPath: process.env.EXPO_PUBLIC_AUTH_REGISTER_PATH ?? base.expo.extra?.authRegisterPath ?? 'user/register',
    appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? base.expo.extra?.appScheme ?? 'the-run',
    webDomain: process.env.EXPO_PUBLIC_WEB_DOMAIN ?? base.expo.extra?.webDomain ?? 'the.run',
    envName: process.env.EXPO_PUBLIC_ENV_NAME ?? base.expo.extra?.envName ?? 'development',
  },
};
