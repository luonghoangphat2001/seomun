import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLocalStorage } from '@/lib/storages';

interface RecentSearchState {
  searches: Record<string, string[]>;
  addSearch: (userId: string | undefined, term: string) => void;
  removeSearch: (userId: string | undefined, term: string) => void;
  clearSearches: (userId: string | undefined) => void;
}

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set) => ({
      searches: {},
      addSearch: (userId, term) =>
        set((state) => {
          const key = userId || 'guest';
          const userSearches = state.searches[key] || [];
          const newSearches = [term, ...userSearches.filter((s) => s !== term)].slice(0, 20);
          return {
            searches: {
              ...state.searches,
              [key]: newSearches,
            },
          };
        }),
      removeSearch: (userId, term) =>
        set((state) => {
          const key = userId || 'guest';
          const userSearches = state.searches[key] || [];
          return {
            searches: {
              ...state.searches,
              [key]: userSearches.filter((s) => s !== term),
            },
          };
        }),
      clearSearches: (userId) =>
        set((state) => {
          const key = userId || 'guest';
          return {
            searches: {
              ...state.searches,
              [key]: [],
            },
          };
        }),
    }),
    {
      name: 'recent-search-storage',
      storage: createLocalStorage<RecentSearchState>(),
    },
  ),
);
