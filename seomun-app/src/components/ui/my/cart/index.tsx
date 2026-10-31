'use client';

import { Button, Input } from '@/components/common';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import CartNotice from './CartNotice';
import CartItemList from './CartItemList';
import { useMemo, useState } from 'react';
import { RowSelectionState } from '@tanstack/react-table';
import CartItemTable from './CartItemTable';
import { cn } from '@/lib/utils';
import PageTitle from '../components/PageTitle';
import { useCartListQuery } from '@/apis/cart/cart.query';
import { useDebounce } from '@/hooks';

const MyCartComponent = () => {
  const tSidebar = useTranslations('sidebar.items');
  const t = useTranslations();
  const [showSearch, setShowSearch] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const cartSearchParams = useMemo(() => ({ search: debouncedSearchValue.trim() || undefined }), [debouncedSearchValue]);

  //api cart list
  const { data: dataCart, isLoading } = useCartListQuery(cartSearchParams);
  const cartItems = useMemo(() => {
    return dataCart?.items || [];
  }, [dataCart]);

  const allIds = useMemo(() => cartItems.map((item) => String(item.id)), [cartItems]);

  const isAllSelected = allIds.length > 0 && allIds.every((id) => rowSelection[id]);

  const isSomeSelected = allIds.some((id) => rowSelection[id]) && !isAllSelected;

  const selectedItems = cartItems.filter((item) => rowSelection[String(item.id)]);

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = Object.fromEntries(allIds.map((id) => [id, true]));
      setRowSelection(newSelection);
    } else {
      setRowSelection({});
    }
  };

  const toggleShowSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <main className='relative flex w-full flex-col md:gap-6'>
      <PageTitle
        title={tSidebar('cart')}
        containerClassName='mb-3 md:mb-0'
        extra={
          <Button
            size='sm'
            variant='outline'
            className='rounded-full px-3 md:hidden'
            rightIcon={<Search className='size-5' />}
            onClick={toggleShowSearch}>
            {t('common.search')}
          </Button>
        }
      />
      <div className={cn(showSearch ? 'mb-4 block md:block' : 'hidden md:block')}>
        <Input
          placeholder={t('placeholder.search_order_name')}
          suffix={<Search className='text-text-secondary h-5 w-5' />}
          containerClassName='md:w-[320px]'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClear={() => setSearchValue('')}
        />
      </div>
      <CartItemTable
        data={cartItems}
        isLoading={isLoading}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        totalAmount={totalAmount}
      />
      <div className='mobile-seperator'></div>
      {/**Notice Collapse */}
      <CartNotice />
      <div className='mobile-seperator'></div>
      {/**Mobile List */}
      <CartItemList
        data={cartItems}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        totalAmount={totalAmount}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
      />
    </main>
  );
};

export default MyCartComponent;
