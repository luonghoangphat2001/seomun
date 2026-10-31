import { WorkerFilterTab } from '@/enums/worker';
import { WorkerCreateREQ, WorkerListREQ, WorkerUpdateREQ } from './worker.request';
import { WorkerUpsertFormValues } from '@/components/ui/my/worker/upsert/schema';
import { WorkerRESP } from './worker.response';
import { splitPhonePattern } from '@/lib/utils';
import { PAGINATION } from '@/constants/common';

export const getInitFilterWorker = (searchParams: URLSearchParams): WorkerListREQ => {
  const page = Number(searchParams.get('page'));
  const perPage = Number(searchParams.get('per_page'));
  const searchType = searchParams.get('search_type');
  const keyword = searchParams.get('keyword');

  return {
    page: page || PAGINATION.DEFAULT_PAGE,
    per_page: perPage || PAGINATION.DEFAULT_PAGE_SIZE,
    search_type: searchType || WorkerFilterTab.ALL,
    keyword: keyword || undefined,
  };
};

export const transformWorkerFormValuesToREQ = (input: WorkerUpsertFormValues, id?: number): WorkerCreateREQ | WorkerUpdateREQ => {
  const request = {
    name: input.workerName,
    mobile: `${input.cellphonePrefix}${input.cellphone1}${input.cellphone2}`,
  };

  return id ? { id, ...request } : request;
};

export const transformWorkerRESPToFormValues = (resp: WorkerRESP): WorkerUpsertFormValues => {
  const phoneResult = splitPhonePattern(resp.mobile);

  return {
    workerName: resp.name,
    cellphonePrefix: phoneResult?.part1 || '',
    cellphone1: phoneResult?.part2 || '',
    cellphone2: phoneResult?.part3 || '',
  };
};
