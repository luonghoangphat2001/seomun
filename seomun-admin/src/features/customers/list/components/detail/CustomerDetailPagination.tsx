import { useTranslation } from 'react-i18next';

import type { PaginationMeta } from '@/types/api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CustomerDetailPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const DETAIL_PAGE_SIZE_OPTIONS = [3, 5, 10, 20, 30, 50] as const;

export function CustomerDetailPagination({ pagination, onPageChange, onPageSizeChange }: CustomerDetailPaginationProps) {
  const { t } = useTranslation();

  const currentPage = Math.max(pagination.current_page, 1);
  const totalPage = Math.max(pagination.total_page, 1);
  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPage;

  return (
    <div className='bg-card flex flex-col gap-3 rounded-xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-muted-foreground text-sm'>
        {t('table.pagination_summary', { page: currentPage, pageCount: totalPage, rowCount: pagination.total_item })}
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>{t('table.rows_per_page')}</span>
          <Select value={String(pagination.per_page)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size='sm' className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DETAIL_PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className='mx-0 w-auto justify-start sm:justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={(event) => {
                  event.preventDefault();
                  if (canPrevious) onPageChange(currentPage - 1);
                }}
                aria-disabled={!canPrevious}
                className={!canPrevious ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {getPaginationItems(currentPage, totalPage).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href='#'
                  isActive={page === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={(event) => {
                  event.preventDefault();
                  if (canNext) onPageChange(currentPage + 1);
                }}
                aria-disabled={!canNext}
                className={!canNext ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

function getPaginationItems(currentPage: number, totalPage: number) {
  if (totalPage <= 7) {
    return Array.from({ length: totalPage }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPage - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}
