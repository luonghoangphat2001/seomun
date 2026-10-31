import { PaginationREQ } from '@/types';

export type WorkerListREQ = PaginationREQ & {
  search_type?: string;
  keyword?: string;
};

export type WorkerCreateREQ = {
  name: string;
  mobile: string;
};

export type WorkerUpdateREQ = WorkerCreateREQ & {
  id: number;
};

export type WorkerSendCodeREQ = {
  mobile: string;
};

export type WorkerVerifyCode = {
  mobile: string;
  code: string;
};
