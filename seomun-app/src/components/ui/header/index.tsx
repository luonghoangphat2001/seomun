import { CategoryApi } from '@/apis/category/category.api';
import { SafeImage } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { HeaderButton } from './HeaderButton';
import { HeaderButtonMobile } from './HeaderButtonMobile';
import { HeaderMenuBar } from './HeaderMenuBar';
import { HeaderSearch } from './HeaderSearch';
import { ScrollAwareHeaderWrapper } from './ScrollAwareHeaderWrapper';

export const Header = async () => {
  const categoryResp = await CategoryApi.getList({ root_only: true, with_children: true }).catch(() => null);
  const categories = categoryResp?.data?.categories || [];

  return (
    <>
      <ScrollAwareHeaderWrapper>
        <div className='flex items-center justify-between px-4 py-3 sm:hidden'>
          <Link href='/'>
            <SafeImage src='/images/logoHeader.svg' alt='logo' width={73} height={24} className='w-[73px]' />
          </Link>
          <HeaderButtonMobile categories={categories} />
        </div>

        <div className={cn('global-padding hidden space-y-4 pt-10 sm:block')}>
          <div className='flex items-center justify-between gap-4'>
            <Link href='/'>
              <SafeImage src='/images/logoHeader.svg' alt='logo' width={109} height={36} className='h-9 w-30 md:w-[109px]' />
            </Link>
            <HeaderSearch />
            <HeaderButton />
          </div>
          <HeaderMenuBar categories={categories} />
        </div>
      </ScrollAwareHeaderWrapper>
      <div className='h-14 sm:h-34'></div>
    </>
  );
};
