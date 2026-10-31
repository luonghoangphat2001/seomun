import { z } from 'zod';

import { EquipmentMachineType, EquipmentSearchType, EquipmentStatus, EquipmentWorkProcess } from '../enums';

export const EQUIPMENT_STATUS_ALL = 'all' as const;

export type EquipmentStatusFilter = EquipmentStatus | typeof EQUIPMENT_STATUS_ALL;

export const equipmentListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  search_type: z.enum(EquipmentSearchType).optional().catch(undefined),
  keyword: z.coerce.string().optional().catch(undefined),
  work_process: z.enum(EquipmentWorkProcess).optional().catch(undefined),
  machine_type: z.enum(EquipmentMachineType).optional().catch(undefined),
  status: z
    .union([z.enum(EquipmentStatus), z.literal(EQUIPMENT_STATUS_ALL)])
    .optional()
    .catch(undefined),
});

export type EquipmentListSearch = z.infer<typeof equipmentListSearchSchema>;

export type EquipmentSearchFilterValues = {
  search_type: EquipmentListSearch['search_type'];
  keyword: string;
  work_process?: EquipmentWorkProcess;
  machine_type?: EquipmentMachineType;
  status?: EquipmentStatusFilter;
};

export const EMPTY_EQUIPMENT_SEARCH_FILTERS: EquipmentSearchFilterValues = {
  search_type: undefined,
  keyword: '',
  work_process: undefined,
  machine_type: undefined,
  status: EquipmentStatus.ACTIVE,
};
