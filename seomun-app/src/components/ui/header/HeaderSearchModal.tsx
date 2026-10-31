'use client';

import { Input, Modal, ModalHandle } from '@/components/common';
import { useAuthStore, useRecentSearchStore } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { Search, XIcon } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

export interface HeaderSearchModalHandle {
  open: () => void;
  close: () => void;
}

const HeaderSearchModal = forwardRef<HeaderSearchModalHandle>((_, ref) => {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user } = useAuthStore();
  const { searches, addSearch, removeSearch, clearSearches } = useRecentSearchStore();

  const modalRef = useRef<ModalHandle>(null);
  const [query, setQuery] = useState('');

  const userSearches = useMemo(() => searches[user?.username || 'guest'] || [], [searches, user?.username]);

  const filteredSearches = useMemo(() => {
    if (!query.trim()) return userSearches;
    return userSearches.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
  }, [userSearches, query]);

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

  const handleSearch = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    addSearch(user?.username ?? 'guest', trimmedTerm);
    modalRef.current?.close();
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
    <Modal ref={modalRef} position='bottom' title={t('enter_name')} className='rounded-t-2xl' onClose={() => setQuery('')}>
      <div className='space-y-4 px-4 py-6'>
        <Input
          placeholder={t('enter_name')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          suffix={<Search className='h-5 w-5 text-gray-400' onClick={() => handleSearch(query)} />}
          className='body-14 h-12 bg-[#fafafa] placeholder:text-[#444444]'
          showClear={false}
          autoFocus
        />

        <div>
          <div className='flex items-center justify-between pb-2'>
            <span className='title-14 text-text-third'>{t('recent_search')}</span>
            {userSearches.length > 0 && (
              <button
                onClick={clearAllRecentSearches}
                className='button-13 hover:text-text-secondary underline underline-offset-2'>
                {t('clear_all')}
              </button>
            )}
          </div>

          <div className='max-h-[60vh] overflow-y-auto'>
            {filteredSearches.length > 0 ? (
              filteredSearches.map((term) => (
                <div key={term} className='group flex items-center justify-between py-3'>
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
              <div className='caption-12 text-text-secondary py-8 text-center'>{tCommon('no_search')}</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
});

HeaderSearchModal.displayName = 'HeaderSearchModal';

export default HeaderSearchModal;
