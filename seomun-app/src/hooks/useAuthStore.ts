import { ProfileRESP } from '@/apis/my/profile/profile.response';
import { TokenService } from '@/config/token';
import { createLocalStorage, LOCAL_STORAGE_KEYS, LocalStorage } from '@/lib/storages';
import { User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  profile: ProfileRESP | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setHydrated: () => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileRESP | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
      setUser: (user) => set(user ? { user, isAuthenticated: true } : { user: null, profile: null, isAuthenticated: false }),
      setProfile: (profile) => set({ profile }),

      logout: () => {
        TokenService.clearTokens();
        set({ user: null, profile: null, isAuthenticated: false });
        LocalStorage.remove(LOCAL_STORAGE_KEYS.AUTH_STORAGE);
        LocalStorage.remove(LOCAL_STORAGE_KEYS.PRODUCT_SELECTED_OPTIONS);
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.AUTH_STORAGE,
      storage: createLocalStorage<{
        user: User | null;
        profile: ProfileRESP | null;
        isAuthenticated: boolean;
      }>(),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
