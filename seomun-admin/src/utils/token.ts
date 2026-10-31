import { Cookies } from './cookies';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export class TokenService {
  static setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
    if (typeof window !== 'undefined') {
      if (expiresIn) {
        const expiryDate = new Date(Date.now() + expiresIn * 1000);
        Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, { expires: expiryDate });
      } else {
        Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken, { expires: 7 });
      }

      Cookies.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, { expires: 30 });
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
    }
  }

  static hasValidTokens(): boolean {
    if (typeof window !== 'undefined') {
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      return !!accessToken || !!refreshToken;
    }
    return false;
  }
}
