'use client';

import { useLogoutMutation } from '@/apis/auth/auth.query';
import { Button, Modal, ModalHandle } from '@/components/common';
import { useAuthStore } from '@/hooks';
import { Link } from '@/i18n/navigation';
import { Logout, Shoppingbag, Truck, User2 } from '@/icons';
import { formatNumber } from '@/lib/utils';
import { getCurrentMembershipLevel } from '@/lib/utils/helper';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { NotificationBell } from '../notification';
import { HeaderIconTooltip } from './HeaderIconTooltip';
import { useCartListQuery } from '@/apis/cart/cart.query';

export const HeaderButton = () => {
  const t = useTranslations('header');
  const tSidebar = useTranslations('sidebar');
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');

  const modalRef = useRef<ModalHandle>(null);

  const { user, isAuthenticated, logout, profile } = useAuthStore();
  const { currentLevel } = getCurrentMembershipLevel(profile?.membership.current_quarter_spent || 0);
  const balance = profile?.balance?.balance ?? 0;
  const isOutstandingBalance = balance < 0;
  const balanceLabel = isOutstandingBalance ? t('outstanding') : t('prepayment');
  const displayBalance = Math.abs(balance);

  //api get length cart
  const { data: dataCart } = useCartListQuery(undefined, { enabled: isAuthenticated });
  const cartItemCount = dataCart?.items.length || 0;

  const { mutate: logoutMutate, isPending } = useLogoutMutation({
    onSuccess: (data) => {
      toast.success(data.message ?? tCommon('success'));
    },
    onError: (error) => {
      toast.error(error.message ?? tCommon('error'));
    },
    // Local logout must not depend on the API response. The current access token
    // may already be expired, or the network request may fail.
    onSettled: () => {
      logout();
      window.location.replace(ROUTES.LOGIN);
    },
  });

  const handleLogoutClick = () => {
    modalRef.current?.open();
  };

  const onConfirmLogout = () => {
    logoutMutate(null);
    modalRef.current?.close();
  };

  const renderUserInfo = () => (
    <>
      {/* <Link href={ROUTES.MY_PAGE.MAIN} className='hover:text-primary p-2 transition-colors'>
        {`${user?.name} (${user?.username})`}
      </Link> */}
      {/* <div className='-mr-3 min-w-6'>
        <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={24} height={24} unoptimized />
      </div> */}
      <span className='p-2'>{`${user?.name} (${user?.username})`}</span>
      <span className='text-border-soft max-lg:hidden'>|</span>
      {/* <span className='p-2 max-lg:hidden'>{formatKoreanPhone(user?.phone ?? '-')}</span> */}
      {/* <span className='p-2 max-lg:hidden'>{profile?.virtual_account?.account_number || '-'}</span>
      <span className='text-border-soft max-lg:hidden'>|</span> */}
      <span className={isOutstandingBalance ? 'text-error p-2 max-lg:hidden' : 'text-primary p-2 max-lg:hidden'}>
        {balanceLabel} <span className='font-semibold'>{t('won', { amount: formatNumber(displayBalance) })}</span>
      </span>
    </>
  );

  const renderGuestLinks = () => (
    <>
      <Link href={ROUTES.LOGIN} className='hover:text-primary p-2 transition-colors'>
        {t('login')}
      </Link>
      <Link href={ROUTES.REGISTER} className='hover:text-primary p-2 transition-colors'>
        {t('join_membership')}
      </Link>
      {/* <Link href={ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT} className='hover:text-primary p-2 transition-colors'>
        {t('customer_service')}
      </Link> */}
    </>
  );

  return (
    <div className='body-14 md:body-16 flex items-center justify-between gap-1 md:gap-2.5'>
      {isAuthenticated && !isPending ? renderUserInfo() : renderGuestLinks()}

      <div className='ml-2 flex items-center gap-1'>
        {isAuthenticated && (
          <>
            <Link href={ROUTES.MY_PAGE.MAIN} className='group hover:text-primary relative p-2 transition-colors'>
              <span className='body-14 bg-text-main pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-xs px-1.5 py-0.5 whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100'>
                {tSidebar('my_page')}
                <span className='border-t-text-main absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-8 border-x-transparent' />
              </span>
              <User2 className='size-5 md:size-6' />
            </Link>
            <HeaderIconTooltip label={tSidebar('items.cart')}>
              <Link
                href={ROUTES.MY_PAGE.CART}
                aria-label={tSidebar('items.cart')}
                className='hover:text-primary relative p-2 transition-colors'>
                <Shoppingbag className='size-5 md:size-6' />
                {isAuthenticated && cartItemCount > 0 && (
                  <span className='bg-primary absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white'>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            </HeaderIconTooltip>
            <HeaderIconTooltip label={tSidebar('items.order_tracking')}>
              <Link
                href={ROUTES.MY_PAGE.ORDER}
                aria-label={tSidebar('items.order_tracking')}
                className='hover:text-primary h-10 p-1.5 transition-colors'>
                <Truck className='size-5 md:size-7' />
              </Link>
            </HeaderIconTooltip>
            <HeaderIconTooltip label={t('notification')}>
              <NotificationBell iconClassName='size-5 md:size-6' />
            </HeaderIconTooltip>
            <HeaderIconTooltip label={t('logout')}>
              <button
                type='button'
                aria-label={t('logout')}
                onClick={handleLogoutClick}
                className='hover:text-primary cursor-pointer p-2 transition-colors'>
                <Logout className='size-5 md:size-6' />
              </button>
            </HeaderIconTooltip>
          </>
        )}
      </div>

      <Modal
        ref={modalRef}
        title={tCommon('warning')}
        size='sm'
        footer={
          <div className='flex gap-2'>
            <Button variant='outline' disabled={isPending} fullWidth onClick={() => modalRef.current?.close()}>
              {tCommon('cancel')}
            </Button>
            <Button variant='primary' disabled={isPending} fullWidth onClick={onConfirmLogout} loading={isPending}>
              {tCommon('check')}
            </Button>
          </div>
        }>
        <div className='text-center'>
          <p className='body-16'>{tAuth('logout_confirm')}</p>
        </div>
      </Modal>
    </div>
  );
};
