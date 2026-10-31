import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';

import type { CustomerMember } from '../../types/customer.type';

type ExposureCustomerListProps = {
  customers: CustomerMember[];
  searchTerm: string;
  selectedCustomerId: number | null;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onSearchTermChange: (value: string) => void;
  onSelectCustomer: (customerId: number) => void;
  onReachEnd?: () => void;
};

export function ExposureCustomerList({
  customers,
  searchTerm,
  selectedCustomerId,
  isLoading,
  isFetchingNextPage,
  onSearchTermChange,
  onSelectCustomer,
  onReachEnd,
}: ExposureCustomerListProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: the panel grows with the page, so observe the sentinel against the viewport.
  useEffect(() => {
    if (!onReachEnd || isFetchingNextPage) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onReachEnd();
      },
      { rootMargin: '200px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onReachEnd, isFetchingNextPage, customers.length]);

  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.exposure.customer_list_title')}</h2>
      </div>
      <div className='space-y-3 p-5'>
        <AppInput
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder={t('page.customers.exposure.search_customer_placeholder')}
        />
        {isLoading ? <p className='text-muted-foreground text-sm'>{t('common.message.loading')}</p> : null}
        {!isLoading && customers.length === 0 ? <p className='text-muted-foreground text-sm'>{t('page.customers.exposure.no_customers')}</p> : null}
        <div className='space-y-2'>
          {customers.map((customer) => (
            <button
              key={customer.id}
              type='button'
              onClick={() => onSelectCustomer(customer.id)}
              className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                selectedCustomerId === customer.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/40'
              }`}
            >
              <p className='font-medium'>{customer.name}</p>
              <p className='text-muted-foreground text-sm'>{[customer.username, customer.email].filter(Boolean).join(' · ')}</p>
            </button>
          ))}
        </div>
        <div ref={sentinelRef} aria-hidden className='h-px' />
        {isFetchingNextPage ? (
          <div className='text-muted-foreground flex items-center justify-center py-2'>
            <Loader2 className='size-4 animate-spin' />
          </div>
        ) : null}
      </div>
    </section>
  );
}
