import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { EquipmentListREQ } from '../api/equipment.request';
import { EquipmentStatus } from '../enums';
import { EQUIPMENT_STATUS_ALL, type EquipmentListSearch } from '../schemas/equipment-list-search.schema';

export type NormalizedEquipmentListParams = EquipmentListREQ & Required<Pick<EquipmentListREQ, 'page' | 'per_page'>>;

function normalizeQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildEquipmentListParams(search: EquipmentListSearch): NormalizedEquipmentListParams {
  return {
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
    search_type: search.keyword?.trim() ? search.search_type : undefined,
    keyword: normalizeQuery(search.keyword),
    work_process: search.work_process,
    machine_type: search.machine_type,
    status: search.status === EQUIPMENT_STATUS_ALL ? undefined : (search.status ?? EquipmentStatus.ACTIVE),
  };
}
