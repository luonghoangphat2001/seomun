import { PersistStorage, StorageValue } from 'zustand/middleware';
import { decrypt, encrypt } from '@/lib/utils/crypto';

export const Cookies = {
  set<T>(name: string, value: T, expiresInDaysOrMs: number = 7, isMilliseconds = false) {
    const encryptedValue = encrypt<T>(value);
    const expires = new Date();

    if (isMilliseconds) {
      expires.setTime(expires.getTime() + expiresInDaysOrMs);
    } else {
      expires.setDate(expires.getDate() + expiresInDaysOrMs);
    }

    document.cookie = `${name}=${encodeURIComponent(encryptedValue)};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
  },

  get<T>(name: string): T | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match && match[2] ? decrypt<T>(decodeURIComponent(match[2])) : null;
  },

  remove(name: string) {
    // Keep the same root path used by `set` and include Max-Age for browsers
    // which prioritise it over Expires when removing a cookie.
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;Max-Age=0;path=/;SameSite=Lax`;
  },
};

export const createCookieStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): StorageValue<T> | null => Cookies.get<StorageValue<T>>(name),
  setItem: (name: string, value: StorageValue<T>): void => Cookies.set<StorageValue<T>>(name, value),
  removeItem: (name: string): void => Cookies.remove(name),
});
