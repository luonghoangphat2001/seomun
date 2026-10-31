import type { TFunction } from 'i18next';

import { EquipmentMachineType, EquipmentStatus, EquipmentWorkProcess } from '../enums';

export const getEquipmentWorkProcessOptions = (t: TFunction<'page'>) => [
  { value: EquipmentWorkProcess.PRINTING, label: t('orders.equipment.work_process.printing', 'Printing') },
  { value: EquipmentWorkProcess.COATING, label: t('orders.equipment.work_process.coating', 'Coating') },
  { value: EquipmentWorkProcess.CUTTING, label: t('orders.equipment.work_process.cutting', 'Cutting') },
  { value: EquipmentWorkProcess.OUTPUT, label: t('orders.equipment.work_process.output', 'Output') },
  { value: EquipmentWorkProcess.POST_PROCESSING, label: t('orders.equipment.work_process.post_processing', 'Post Processing') },
];

export const getEquipmentMachineTypeOptions = () => Object.values(EquipmentMachineType).map((value) => ({ value, label: value }));

export const getEquipmentStatusOptions = (t: TFunction<'page'>) => [
  { value: EquipmentStatus.ACTIVE, label: t('orders.equipment.status.active', 'Active') },
  { value: EquipmentStatus.MAINTENANCE, label: t('orders.equipment.status.maintenance', 'Maintenance') },
  { value: EquipmentStatus.INACTIVE, label: t('orders.equipment.status.inactive', 'Inactive') },
];
