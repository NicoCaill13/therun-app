import type { AuthSuccessPayload, RegisterRequestBody } from '@/lib/api/types';
import { apiPostJson } from '@/lib/api/authClient';

const DEFAULT_LOGIN_PATH = '/api/auth/login';

function getLoginPath(): string {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_LOGIN_PATH;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().startsWith('/') ? fromEnv.trim() : `/${fromEnv.trim()}`;
  }
  return DEFAULT_LOGIN_PATH;
}

export async function postLogin(email: string, password: string): Promise<AuthSuccessPayload> {
  return apiPostJson<AuthSuccessPayload, { email: string; password: string }>(getLoginPath(), {
    email,
    password,
  });
}

export async function postRegister(body: RegisterRequestBody): Promise<AuthSuccessPayload> {
  return apiPostJson<AuthSuccessPayload, RegisterRequestBody>('/api/user/register', body);
}
