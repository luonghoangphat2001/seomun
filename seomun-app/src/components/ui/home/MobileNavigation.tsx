import { Link } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const MobileNavigation = () => {
  const t = useTranslations('home');

  const navItems = [
    { label: t('cart'), icon: '/images/navigate-btn/navigate-btn-1.png', href: ROUTES.MY_PAGE.CART },
    { label: t('order'), icon: '/images/navigate-btn/navigate-btn-2.png', href: ROUTES.MY_PAGE.ORDER },
    { label: t('inquiry'), icon: '/images/navigate-btn/navigate-btn-3.png', href: ROUTES.MY_PAGE.PRODUCT_INQUIRY },
    { label: t('profile'), icon: '/images/navigate-btn/navigate-btn-4.png', href: ROUTES.MY_PAGE.PROFILE },
    { label: t('announce'), icon: '/images/navigate-btn/navigate-btn-5.png', href: ROUTES.MY_PAGE.NOTICE },
    { label: t('settings'), icon: '/images/navigate-btn/navigate-btn-6.png', href: ROUTES.MY_PAGE.MAIN },
  ];

  return (
    <div className='global-padding bg-white pt-6 pb-2 md:hidden'>
      <div className='grid grid-cols-3 gap-y-6'>
        {navItems.map((item, index) => {
          return (
            <Link key={index} href={item.href} className='flex flex-col items-center gap-1'>
              <div className='flex items-center justify-center'>
                <Image src={item.icon} alt={item.icon} width={48} height={48} className='size-12' />
              </div>
              <span className='caption-12 text-center'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
