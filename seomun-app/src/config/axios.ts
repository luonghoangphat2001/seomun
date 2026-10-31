import { useAuthStore, useLoginStore } from '@/hooks';
import axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { TokenService } from './token';
import { ENDPOINTS } from '@/apis/auth/auth.api';
import { ROUTES } from '@/routes';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig) {
    const token = TokenService.getAccessToken();

    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as unknown as AxiosRequestHeaders;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (reason: unknown) => void }> = [];

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const isAuthLoginPage = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes(ROUTES.LOGIN);
};

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * The proxy considers any access-token cookie as an authenticated session.
 * Always clear the browser session before redirecting, otherwise `/login` is
 * redirected back to the home page by the proxy.
 */
const invalidateSession = () => {
  if (typeof window === 'undefined') return;

  TokenService.clearTokens();
  useAuthStore.getState().logout();
  useLoginStore.getState().closeLoginModal();

  if (!isAuthLoginPage()) {
    // A document navigation makes the next proxy request observe the deleted cookies.
    window.location.replace(ROUTES.LOGIN);
  }
};

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes(ENDPOINTS.REFRESH);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            } as AxiosRequestHeaders;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenService.getRefreshToken();
        if (!refreshToken) {
          processQueue(error);
          invalidateSession();
          return Promise.reject(error);
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.REFRESH}`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken, expires_in } = response.data.data;
        if (!access_token || typeof access_token !== 'string') {
          throw new Error('Refresh response does not contain an access token');
        }

        // Use new refresh_token if provided, otherwise keep the old one
        const tokenToStore = newRefreshToken || refreshToken;
        TokenService.setTokens(access_token, tokenToStore, expires_in);

        processQueue(null, access_token);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access_token}`,
        } as AxiosRequestHeaders;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        invalidateSession();
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
  get: <ResponseType>(url: string, requestOption?: AxiosRequestConfig) =>
    axiosInstance.get<ResponseType>(url, requestOption).then(responseBody),

  post: <ResponseType>(url: string, body?: object, requestOption?: AxiosRequestConfig) =>
    axiosInstance.post<ResponseType>(url, body ?? {}, requestOption).then(responseBody),
  postWithRetry: async <ResponseType>(
    url: string,
    body?: object,
    requestOption?: object,
    retries = 2,
    delayMs = 1000,
  ): Promise<ResponseType> => {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const res = await axiosInstance.post<ResponseType>(url, body, requestOption);
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
    axiosInstance.put<ResponseType>(url, body, requestOption).then(responseBody),

  patch: <ResponseType>(url: string, body: object, requestOption?: AxiosRequestConfig) =>
    axiosInstance.patch<ResponseType>(url, body, requestOption).then(responseBody),

  delete: <ResponseType>(url: string, body?: object, requestOption?: AxiosRequestConfig) =>
    axiosInstance
      .delete<ResponseType>(url, {
        ...requestOption,
        data: body,
      })
      .then(responseBody),
} as const;
