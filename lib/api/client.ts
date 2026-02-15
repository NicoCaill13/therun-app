import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '@/lib/auth/storage';
import { triggerOnUnauthorized } from '@/lib/auth/onUnauthorized';
import { API_BASE_URL } from '@/lib/config/env';

/**
 * Centralized Axios instance for all API calls.
 * - Auto-attaches Bearer token
 * - Auto-unwraps therun API wrapped responses ({ statusCode, path, data, timestamp })
 * - Triggers signOut on 401
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Attach auth token to every request.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor:
 * 1. Unwrap the therun API response envelope ({ statusCode, path, data, timestamp }) -> data
 * 2. On 401, trigger sign out
 */
apiClient.interceptors.response.use(
  (response) => {
    // therun API wraps successful responses in { statusCode, path, data, timestamp }
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && 'statusCode' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      triggerOnUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
