'use client';

import { useGetAllPaperQuery } from '@/apis/product/product.query';
import { ModalHandle } from '@/components/common';
import { CalculateSpineModal } from '@/components/ui/product/CalculateSpineModal';
import { KAKAO_LINK } from '@/constants/common';
import { useAuthStore } from '@/hooks';
import { Link, usePathname } from '@/i18n/navigation';
import { Calculator2, DeliveryTruck, FirstTime, KakaoTalk, Membership, QuoteConsultation, Top } from '@/icons';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { ComponentType, SVGProps, useRef } from 'react';

type FloatingToolbarItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
  itemClassName?: string;
  label: string;
} & (
  | {
      href: string;
      external?: boolean;
      isSpineCalculator?: never;
    }
  | {
      isSpineCalculator: true;
      href?: never;
      external?: never;
    }
);

const FloatingToolbar = () => {
  const pathname = usePathname();
  const t = useTranslations('home');
  const calculateSpineModalRef = useRef<ModalHandle>(null);
  const { isAuthenticated } = useAuthStore();

  const isHome = pathname === '/';
  const isProduct = pathname.startsWith(ROUTES.PRODUCT.INDEX);
  const isVisible = isHome || isProduct;
  const { data: allPapers } = useGetAllPaperQuery(isVisible);

  if (!isVisible) return null;

  const items: FloatingToolbarItem[] = [
    {
      icon: FirstTime,
      iconClassName: 'size-16',
      itemClassName: 'bg-[#0D2B33] text-white hover:bg-[#163A45]',
      label: t('first_time'),
      href: ROUTES.LOGIN,
    },
    {
      icon: Membership,
      iconClassName: 'size-10',
      label: t('membership'),
      href: isAuthenticated ? ROUTES.MY_PAGE.MAIN : ROUTES.REGISTER,
    },
    {
      icon: DeliveryTruck,
      iconClassName: 'size-10',
      label: t('shipping'),
      href: ROUTES.MY_PAGE.ORDER,
    },
    {
      icon: QuoteConsultation,
      iconClassName: 'size-10',
      label: t('quote'),
      href: ROUTES.MY_PAGE.QUOTE_INQUIRY,
    },
    {
      icon: Calculator2,
      iconClassName: 'size-10',
      label: t('book_spine'),
      isSpineCalculator: true,
    },
    {
      icon: KakaoTalk,
      iconClassName: 'size-11',
      itemClassName: 'bg-[#FFDE00] hover:bg-[#F5D600]',
      label: t('kakaotalk'),
      href: KAKAO_LINK,
      external: true,
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='border-border-soft fixed top-1/2 right-0 z-50 hidden w-28.5 -translate-y-1/2 flex-col items-center border bg-white transition-transform duration-300 hover:translate-x-0 max-[1800px]:translate-x-[80%] md:flex'>
      {items.map((item, index) => {
        const Icon = item.icon;
        const className = cn(
          'border-border-soft flex w-full flex-col items-center justify-center gap-2 border-b px-1 py-3 last:border-b-0 hover:bg-gray-50',
          item.itemClassName,
        );

        return item.isSpineCalculator ? (
          <button key={index} type='button' onClick={() => calculateSpineModalRef.current?.open()} className={className}>
            <Icon className={item.iconClassName} />
            <span className='caption-12 font-medium whitespace-pre-wrap'>{item.label}</span>
          </button>
        ) : (
          <Link key={index} href={item.href} target={item.external ? '_blank' : undefined} className={className}>
            <Icon className={item.iconClassName} />
            <span className='caption-12 font-medium whitespace-pre-wrap'>{item.label}</span>
          </Link>
        );
      })}

      <div className='border-border-soft bg-primary-50 flex w-full items-center justify-center border-b py-4'>
        <span className='title-18'>1600-5499</span>
      </div>

      <button
        onClick={scrollToTop}
        className='flex w-full cursor-pointer flex-col items-center justify-center gap-2 bg-[#0D2B33] p-4 text-white transition-colors hover:bg-[#163A45]'>
        <Top className='text-primary size-6' />
        <span className='caption-12'>TOP</span>
      </button>

      <CalculateSpineModal
        ref={calculateSpineModalRef}
        papers={allPapers?.map((paper) => ({ id: paper.id, name: paper.name })) || []}
      />
    </div>
  );
};

export default FloatingToolbar;
