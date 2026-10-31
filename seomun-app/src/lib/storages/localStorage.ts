import { PersistStorage, StorageValue } from 'zustand/middleware';
import { decrypt, encrypt } from '@/lib/utils/crypto';

export const LOCAL_STORAGE_KEYS = {
  AUTH_STORAGE: 'auth-storage',
  REMEMBER: 'remember',
  PRODUCT_SELECTED_OPTIONS: 'product-selected-options',
  CART_SELECTED_ITEM_IDS: 'cart-selected-item-ids',
} as const;

const isLocalStorageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const LocalStorage = {
  set<T>(key: string, value: T) {
    if (!isLocalStorageAvailable()) return;

    const encryptedValue = encrypt<T>(value);
    window.localStorage.setItem(key, encryptedValue);
  },

  get<T>(key: string): T | null {
    if (!isLocalStorageAvailable()) return null;

    const item = window.localStorage.getItem(key);
    if (item) {
      const decryptedValue = decrypt<T>(item);
      return decryptedValue;
    } else {
      return null;
    }
  },

  remove(key: string) {
    if (!isLocalStorageAvailable()) return;

    window.localStorage.removeItem(key);
  },

  clear() {
    if (!isLocalStorageAvailable()) return;

    window.localStorage.clear();
  },
};

export const createLocalStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): StorageValue<T> | null => LocalStorage.get<StorageValue<T>>(name),
  setItem: (name: string, value: StorageValue<T>): void => LocalStorage.set<StorageValue<T>>(name, value),
  removeItem: (name: string): void => LocalStorage.remove(name),
});
