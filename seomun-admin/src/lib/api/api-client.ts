import { ENDPOINTS } from '@/config/endpoints';
import { env } from '@/config/env';
import { TokenService } from '@/utils/token';
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = env.VITE_API_ENDPOINT ?? env.VITE_API_URL ?? '';
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'lang';

const getCurrentLanguage = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenService.getAccessToken();
    if (config.headers) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
        Accept: 'application/json',
        'Accept-Language': getCurrentLanguage(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as unknown as AxiosRequestHeaders;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = Boolean(
      originalRequest?.url?.includes(ENDPOINTS.AUTH.LOGIN) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.REFRESH) ||
      originalRequest?.url?.includes(ENDPOINTS.AUTH.LOGOUT),
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          } as AxiosRequestHeaders;

          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) {
        processQueue(error, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${apiClient.defaults.baseURL}${ENDPOINTS.AUTH.REFRESH}`,
          {
            refresh_token: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Accept-Language': getCurrentLanguage(),
            },
          },
        );

        const { access_token, refresh_token: newRefreshToken, expires_in } = response.data.data;
        const tokenToStore = newRefreshToken || refreshToken;
        TokenService.setTokens(access_token, tokenToStore, expires_in);

        processQueue(null, access_token);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access_token}`,
        } as AxiosRequestHeaders;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          import('react-hot-toast').then(({ toast }) => {
            toast.error('Session expired. Please login again.');
          });
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const responseBody = <ResponseType>(response: AxiosResponse<ResponseType>) => response.data;

export const api = {
  get: <ResponseType>(url: string, requestOption?: AxiosRequestConfig) => apiClient.get<ResponseType>(url, requestOption).then(responseBody),

  post: <ResponseType>(url: string, body?: object, requestOption?: AxiosRequestConfig) =>
    apiClient.post<ResponseType>(url, body ?? {}, requestOption).then(responseBody),
  postWithRetry: async <ResponseType>(url: string, body?: object, requestOption?: object, retries = 2, delayMs = 1000): Promise<ResponseType> => {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const res = await apiClient.post<ResponseType>(url, body, requestOption);
        return responseBody(res);
      } catch (err) {
        if (attempt >= retries) {
          throw err;
        }
        attempt++;
        await sleep(delayMs);
      }
    }
    throw new Error('Max retries reached');
  },

  put: <ResponseType>(url: string, body: object, requestOption?: AxiosRequestConfig) =>
    apiClient.put<ResponseType>(url, body, requestOption).then(responseBody),

  patch: <ResponseType>(url: string, body?: object, requestOption?: AxiosRequestConfig) =>
    apiClient.patch<ResponseType>(url, body, requestOption).then(responseBody),

  delete: <ResponseType>(url: string, requestOption?: AxiosRequestConfig) => apiClient.delete<ResponseType>(url, requestOption).then(responseBody),
} as const;
