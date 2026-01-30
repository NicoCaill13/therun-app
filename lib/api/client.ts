import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '@/lib/auth/storage';
import { API_BASE_URL } from '@/lib/config/env';

/**
 * Centralized Axios instance for all API calls.
 * Configured with base URL, interceptors for auth and error handling.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Attach auth token to every request
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
 * Response interceptor: Handle global error scenarios
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Let the caller handle the error via normalizeApiError
    return Promise.reject(error);
  }
);

export default apiClient;
