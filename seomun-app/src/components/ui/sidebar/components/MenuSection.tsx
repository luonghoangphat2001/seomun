'use client';

import { getMySidebarMenu } from '@/constants/sidebar';
import { useAuthStore } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';

type MenuSectionProps = {
  isMobile?: boolean;
  onCloseDrawer?: () => void;
};

const MenuSection = ({ isMobile, onCloseDrawer }: MenuSectionProps) => {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('sidebar');
  const { user } = useAuthStore();
  const menuGroups = getMySidebarMenu(user?.member_type);

  // '/ko/orders' → '/orders'
  const strippedPath = pathname.replace(`/${locale}`, '') || '/';

  const handleNavigate = () => {
    onCloseDrawer?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={cn('mt-6 flex flex-col gap-4', isMobile && 'mt-3 gap-3')}>
      {menuGroups.map((group) => (
        <section
          key={group.title}
          className={cn('border-border-soft border-b pb-4 last:border-0 last:pb-0', isMobile && 'border-b-0 pb-0')}>
          <p className={cn('title-14 text-text-secondary font-semibold', isMobile && 'text-text-third')}>{t(group.title)}</p>
          <ul className='mt-2 flex flex-col gap-1'>
            {group.items.map((item) => (
              <li
                key={item.label}
                className={cn(
                  'body-14 hover:bg-border-light hover:title-14 cur p-2 hover:rounded-lg hover:font-semibold',
                  strippedPath.includes(item.link) && 'bg-border-light title-14 rounded-lg font-semibold',
                )}>
                <Link href={item.link} scroll={false} className='block w-full' onClick={handleNavigate}>
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
};

export default MenuSection;
