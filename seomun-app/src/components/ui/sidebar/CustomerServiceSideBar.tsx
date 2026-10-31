'use client';

import { customerServiceTabs } from '@/constants/sidebar';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export default function CustomerServiceSideBar({ isMypage }: { isMypage?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('customer_service');

  return (
    <nav className={cn('w-full md:mt-4 md:w-47', isMypage && 'md:hidden')}>
      <div className='border-border-soft hidden border-b px-4 py-3 md:block'>
        <span className='title-14'>{t('customer_service')}</span>
      </div>

      <div className='border-border-soft grid grid-cols-2 border-b md:grid-cols-1 md:border-none'>
        {customerServiceTabs(isMypage).map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`body-14 block px-4 py-3 text-center md:text-left ${isActive ? 'md:bg-border-light title-14 md:body-14 text-text-brand border-text-brand border-b-1 md:border-none' : 'text-text-main'}`}>
              {t(tab.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
