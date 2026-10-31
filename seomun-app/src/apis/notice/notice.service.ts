import { PAGINATION } from '@/constants/common';
import { NoticeListREQ } from './notice.request';
import { NoticeCategory } from '@/enums/notice';

export const getInitFilterNotice = (searchParams: URLSearchParams): NoticeListREQ => {
  return {
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || NoticeCategory.ALL,
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    per_page: Number(searchParams.get('per_page')) || PAGINATION.DEFAULT_PAGE_SIZE,
  };
};
