import { cn } from '@/lib/utils';
import { PAGINATION } from '@/constants/common';
import { useMemo } from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from './index';
import { Select } from '../select';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from '@/icons';

type MyPaginationProps = {
  currentPage?: number;
  totalPage?: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  justify?: 'start' | 'end';
  className?: string;
};

const MyPagination = (props: MyPaginationProps) => {
  const t = useTranslations('common');

  const {
    currentPage = PAGINATION.DEFAULT_PAGE_INDEX,
    totalPage = 1,
    totalRecords,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    onPageChange,
    onPageSizeChange,
    justify = 'end',
    className,
  } = props;

  const pageSizeOptions = useMemo(
    () =>
      PAGINATION.PAGE_SIZE_OPTIONS.map((size) => ({
        label: t('page_size', { size }),
        value: String(size),
      })),
    [t],
  );

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPage;

  const { previousPages, nextPages } = useMemo(() => {
    const totalToShow = Math.min(PAGINATION.MAX_VISIBLE, totalPage);
    const half = Math.floor(totalToShow / 2);

    const maxStart = Math.max(1, totalPage - totalToShow + 1);
    const start = Math.max(1, Math.min(currentPage - half, maxStart));

    const pages = Array.from({ length: totalToShow }, (_, i) => start + i).filter((p) => p <= totalPage);

    return {
      previousPages: pages.filter((p) => p < currentPage),
      nextPages: pages.filter((p) => p > currentPage),
    };
  }, [currentPage, totalPage]);

  return (
    <div className={cn('caption-12 flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {totalRecords !== undefined && totalRecords !== null && (
        <p className='text-muted-foreground'>
          {t('total_size', {
            total: `${Math.min(currentPage * pageSize, totalRecords).toLocaleString()} / ${totalRecords.toLocaleString()}`,
          })}
        </p>
      )}
      {onPageSizeChange && (
        <div className='w-21'>
          <Select
            selectClassname='h-8 w-21'
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange?.(Number(value))}
            options={pageSizeOptions}
            labelClassname='caption-12!'
            optionsClassname='caption-12! font-medium!'
          />
        </div>
      )}
      <Pagination
        className={cn('title-14 flex-1 sm:justify-end [&_a]:cursor-pointer', justify === 'start' && 'sm:justify-start')}>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              className={cn('w-fit space-x-1 px-2 sm:px-3', isFirstPage && 'pointer-events-none opacity-50')}
              onClick={() => {
                if (isFirstPage) return;
                onPageChange?.(currentPage - 1);
              }}>
              <ChevronLeft className='h-4 w-4' />
              <span className='hidden sm:inline'>{t('previous')}</span>
            </PaginationLink>
          </PaginationItem>

          {previousPages.length > 0 && previousPages[0] > 1 && (
            <PaginationItem className='hidden sm:list-item'>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {!isFirstPage &&
            previousPages.map((page) => (
              <PaginationItem key={page} className='hidden sm:list-item'>
                <PaginationLink onClick={() => onPageChange?.(page)}>{page}</PaginationLink>
              </PaginationItem>
            ))}

          <PaginationItem>
            <PaginationLink isActive onClick={() => onPageChange?.(currentPage)}>
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          {!isLastPage &&
            nextPages.map((page) => (
              <PaginationItem key={page} className='hidden sm:list-item'>
                <PaginationLink onClick={() => onPageChange?.(page)}>{page}</PaginationLink>
              </PaginationItem>
            ))}

          {nextPages.length > 0 && nextPages[nextPages.length - 1] < totalPage && (
            <PaginationItem className='hidden sm:list-item'>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink
              className={cn('w-fit space-x-1 px-2 sm:px-3', isLastPage && 'pointer-events-none opacity-50')}
              onClick={() => {
                if (isLastPage) return;
                onPageChange?.(currentPage + 1);
              }}>
              <span className='hidden sm:inline'>{t('next')}</span>
              <ChevronRight className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default MyPagination;
