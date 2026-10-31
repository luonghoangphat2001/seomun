'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/common';
import { Search, XIcon } from '@/icons';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore, useRecentSearchStore } from '@/hooks';
import { AnimatePresence, motion } from 'motion/react';
import { ROUTES } from '@/routes';

export const HeaderSearch = () => {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const { user } = useAuthStore();
  const { searches, addSearch, removeSearch, clearSearches } = useRecentSearchStore();

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const userSearches = useMemo(() => searches[user?.username || 'guest'] || [], [searches, user?.username]);

  const filteredSearches = useMemo(() => {
    if (!query.trim()) return userSearches;
    return userSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
  }, [userSearches, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    addSearch(user?.username ?? 'guest', trimmedTerm);
    setIsFocused(false);
    router.push(ROUTES.SEARCH.Q(encodeURIComponent(trimmedTerm)));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearches(user?.username ?? 'guest');
  };

  return (
    <div className='relative max-w-106 flex-1' ref={containerRef}>
      <Input
        name='header-search-query'
        autoComplete='new-password'
        placeholder={t('enter_name')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={onKeyDown}
        suffix={<Search className='h-5 w-5 text-gray-400' onClick={() => handleSearch(query)} />}
        className='body-14 h-10 bg-gray-50 placeholder:text-gray-800'
        showClear={false}
      />

      <AnimatePresence>
        {isFocused && (filteredSearches.length > 0 || !query) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className='border-border-soft absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl'>
            <div className='flex items-center justify-between p-4 pb-1.5'>
              <span className='title-14 text-text-third'>{t('recent_search')}</span>
              <button
                onClick={clearAllRecentSearches}
                className='button-13 hover:text-text-secondary underline underline-offset-2'>
                {t('clear_all')}
              </button>
            </div>

            <div className='max-h-80 overflow-y-auto py-2'>
              {filteredSearches.length > 0 ? (
                filteredSearches.map((term) => (
                  <div key={term} className='group flex items-center justify-between px-4 py-3 hover:bg-gray-50'>
                    <button
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                      className='title-14 flex-1 text-left'>
                      {term}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(user?.username ?? 'guest', term);
                      }}
                      className='text-text-third hover:text-gray-500'>
                      <XIcon className='h-4 w-4' />
                    </button>
                  </div>
                ))
              ) : (
                <div className='caption-12 text-text-secondary px-4 py-8 text-center'>{tCommon('no_search')}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
