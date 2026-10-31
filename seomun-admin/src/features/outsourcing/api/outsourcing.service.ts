import { getOutsourcingAPI, getOutsourcingDetailAPI } from './outsourcing.api';
import type { OutsourcingListREQ } from './outsourcing.request';
import type { OutsourcingDetailRESP, OutsourcingListRESP } from './outsourcing.response';

export function getOutsourcingListService(params: OutsourcingListREQ): Promise<OutsourcingListRESP> {
  return getOutsourcingAPI(params);
}

export function getOutsourcingDetailService(outsourcingId: number): Promise<OutsourcingDetailRESP> {
  return getOutsourcingDetailAPI(outsourcingId);
}
