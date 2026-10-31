import JsCookie from 'js-cookie';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

type CookieOptions = Parameters<typeof JsCookie.set>[2];

export const Cookies = {
  set<T>(name: string, value: T, options?: CookieOptions) {
    const encoded = encodeURIComponent(JSON.stringify(value));

    JsCookie.set(name, encoded, {
      path: '/',
      sameSite: 'Lax',
      secure: import.meta.env.PROD,
      ...options,
    });
  },

  get<T>(name: string): T | null {
    const value = JsCookie.get(name);
    if (!value) return null;

    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      console.error('Cookie decode error:', error);
      JsCookie.remove(name, { path: '/' });
      return null;
    }
  },

  remove(name: string, options?: CookieOptions) {
    JsCookie.remove(name, { path: '/', ...options });
  },
};

export const createCookieStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): StorageValue<T> | null => Cookies.get<StorageValue<T>>(name),
  setItem: (name: string, value: StorageValue<T>): void => Cookies.set<StorageValue<T>>(name, value),
  removeItem: (name: string): void => Cookies.remove(name),
});
