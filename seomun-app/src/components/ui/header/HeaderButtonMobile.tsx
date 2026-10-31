'use client';

import { useLogoutMutation } from '@/apis/auth/auth.query';
import { useCartListQuery } from '@/apis/cart/cart.query';
import { Category } from '@/apis/category/category.response';
import { useAuthStore } from '@/hooks';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Menu, Search, Shoppingbag, User } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { NotificationBell } from '../notification';
import { HeaderMobileSidebar } from './HeaderMobileSidebar';
import HeaderSearchModal, { HeaderSearchModalHandle } from './HeaderSearchModal';
import HeaderSidebarDrawer from './HeaderSidebarDrawer';

interface HeaderButtonMobileProps {
  categories: Category[];
}

export const HeaderButtonMobile = ({ categories }: HeaderButtonMobileProps) => {
  const tCommon = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const searchModalRef = useRef<HeaderSearchModalHandle>(null);

  const { isAuthenticated, logout } = useAuthStore();
  const { data: dataCart } = useCartListQuery(undefined, { enabled: isAuthenticated });
  const cartItemCount = dataCart?.items.length || 0;

  const { mutate: logoutMutate } = useLogoutMutation({
    onSuccess: (data) => {
      toast.success(data.message ?? tCommon('success'));
    },
    onError: (error) => {
      toast.error(error.message ?? tCommon('error'));
    },
    // Complete local logout even if the server cannot invalidate the session.
    onSettled: () => {
      logout();
      window.location.replace(ROUTES.LOGIN);
    },
  });

  const handleLogoutClick = () => {
    logoutMutate(null);
  };

  const handleUserClick = () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    const isMyPage = pathname === ROUTES.MY_PAGE.MAIN || pathname.startsWith(`${ROUTES.MY_PAGE.MAIN}/`);

    if (isMyPage) {
      setIsSidebarDrawerOpen(true);
      return;
    }

    router.push(ROUTES.MY_PAGE.MAIN);
  };

  return (
    <div className='flex items-center gap-1'>
      <span className='p-2' onClick={() => searchModalRef.current?.open()}>
        <Search className='size-6' />
      </span>
      {isAuthenticated && (
        <>
          <Link href={ROUTES.MY_PAGE.CART} className='relative p-2'>
            <Shoppingbag className='size-6' />
            {cartItemCount > 0 && (
              <span className='bg-primary absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white'>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>
          <NotificationBell iconClassName='size-6' />
        </>
      )}
      <span className='p-2' onClick={handleUserClick}>
        <User className='size-6 stroke-2' />
      </span>
      {/* <span
        className='p-2 md:hidden'
        onClick={() => (isAuthenticated ? setIsSidebarDrawerOpen(true) : router.push(ROUTES.LOGIN))}>
        <User className='size-6' />
      </span> */}
      <span className='p-2' onClick={() => setIsSidebarOpen(true)}>
        <Menu className='size-6' />
      </span>

      <HeaderMobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogoutClick}
      />

      <HeaderSidebarDrawer isOpen={isSidebarDrawerOpen} onClose={() => setIsSidebarDrawerOpen(false)} />
      <HeaderSearchModal ref={searchModalRef} />
    </div>
  );
};
