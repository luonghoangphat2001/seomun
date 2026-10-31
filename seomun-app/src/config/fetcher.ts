import { TokenService } from './token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const responseBody = async <ResponseType>(response: Response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`API Error: ${response.status} - ${response.url}`, errorText);
    throw new Error(`Request failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data as Promise<ResponseType>;
};

const getHeaders = (requestOption?: RequestInit): HeadersInit => {
  const token = TokenService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(requestOption?.headers || {}),
  };
};

export const fetcher = {
  get: async <ResponseType>(url: string, requestOption?: RequestInit & { params?: Record<string, unknown> }) => {
    let finalUrl = BASE_URL + url;

    if (requestOption?.params) {
      const params = new URLSearchParams();

      Object.entries(requestOption.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      finalUrl += `?${params.toString()}`;
    }

    return fetch(finalUrl, {
      method: 'GET',
      credentials: 'include',
      ...requestOption,
      headers: getHeaders(requestOption),
      cache: requestOption?.cache ?? 'no-store',
    }).then((res) => responseBody<ResponseType>(res));
  },

  post: async <ResponseType>(url: string, body: object, requestOption?: RequestInit) => {
    return fetch(BASE_URL + url, {
      method: 'POST',
      credentials: 'include',
      ...requestOption,
      headers: getHeaders(requestOption),
      body: JSON.stringify(body),
    }).then((res) => responseBody<ResponseType>(res));
  },

  put: async <ResponseType>(url: string, body: object, requestOption?: RequestInit) => {
    return fetch(BASE_URL + url, {
      method: 'PUT',
      credentials: 'include',
      ...requestOption,
      headers: getHeaders(requestOption),
      body: JSON.stringify(body),
    }).then((res) => responseBody<ResponseType>(res));
  },

  patch: async <ResponseType>(url: string, body: object, requestOption?: RequestInit) => {
    return fetch(BASE_URL + url, {
      method: 'PATCH',
      credentials: 'include',
      ...requestOption,
      headers: getHeaders(requestOption),
      body: JSON.stringify(body),
    }).then((res) => responseBody<ResponseType>(res));
  },

  delete: async <ResponseType>(url: string, requestOption?: RequestInit) =>
    fetch(BASE_URL + url, {
      method: 'DELETE',
      credentials: 'include',
      ...requestOption,
      headers: getHeaders(requestOption),
    }).then((res) => responseBody<ResponseType>(res)),
} as const;
