'use client';

import { Drawer } from '@/components/common';
import MenuSection from '../sidebar/components/MenuSection';
import { useTranslations } from 'next-intl';

type HeaderSidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HeaderSidebarDrawer = ({ isOpen, onClose }: HeaderSidebarDrawerProps) => {
  const t = useTranslations('sidebar');

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position='right' size='md' className='w-40 px-4 pt-6 pb-8 sm:hidden'>
      <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto'>
        <p className='title-20 font-semibold'>{t('my_page')}</p>
        <MenuSection isMobile onCloseDrawer={onClose} />
      </div>
    </Drawer>
  );
};

export default HeaderSidebarDrawer;
