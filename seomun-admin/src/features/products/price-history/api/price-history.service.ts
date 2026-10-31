import { getMockPriceHistoryLogDetail, getMockPriceHistoryLogs } from '../mocks';
import type { PriceHistoryListREQ } from './price-history.request';

const USE_PRICE_HISTORY_MOCK = true;

export const getPriceHistoryLogs = async (params: PriceHistoryListREQ) => {
  if (USE_PRICE_HISTORY_MOCK) {
    return getMockPriceHistoryLogs(params);
  }

  return getMockPriceHistoryLogs(params);
};

export const getPriceHistoryLogDetail = async (id: string) => {
  if (USE_PRICE_HISTORY_MOCK) {
    return getMockPriceHistoryLogDetail(id);
  }

  return getMockPriceHistoryLogDetail(id);
};
