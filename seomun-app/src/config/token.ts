import { Cookies } from '@/lib/storages/cookies';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  AUTH_SESSION: 'seomun_auth_session',
} as const;

export class TokenService {
  /**
   * Proxy login exchanges only issue a short-lived access token.  Keep this
   * separate from the regular login flow, which also receives a refresh token.
   */
  static setAccessToken(accessToken: string, expiresIn?: number) {
    if (typeof window === 'undefined') return;

    const expiresInMs = expiresIn ? expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000;

    Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, expiresInMs, true);
    Cookies.set(TOKEN_KEYS.AUTH_SESSION, true, expiresInMs, true);
    // Do not retain the previous customer's refresh token after impersonation.
    Cookies.remove(TOKEN_KEYS.REFRESH_TOKEN);
  }

  static setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
    if (typeof window !== 'undefined') {
      // expiresIn is in seconds, convert to milliseconds for precise expiry
      if (expiresIn) {
        const expiresInMs = expiresIn * 1000;
        Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, expiresInMs, true);
        Cookies.set(TOKEN_KEYS.AUTH_SESSION, true, expiresInMs, true);
      } else {
        // Default: 7 days
        Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, 7, false);
        Cookies.set(TOKEN_KEYS.AUTH_SESSION, true, 7, false);
      }
      // Refresh token: 30 days
      Cookies.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, 30, false);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(TOKEN_KEYS.ACCESS_TOKEN);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get(TOKEN_KEYS.REFRESH_TOKEN);
    }
    return null;
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      Cookies.remove(TOKEN_KEYS.ACCESS_TOKEN);
      Cookies.remove(TOKEN_KEYS.REFRESH_TOKEN);
      Cookies.remove(TOKEN_KEYS.AUTH_SESSION);
    }
  }
}
