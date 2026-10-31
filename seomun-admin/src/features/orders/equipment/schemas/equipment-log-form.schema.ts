import type { TFunction } from 'i18next';
import { z } from 'zod';

import { EquipmentLogCostType } from '../enums';

export const createEquipmentLogFormSchema = (t: TFunction<'page'>) =>
  z.object({
    log_date: z.date({ message: t('orders.equipment.detail.log.form.errors.date_required', 'Log date is required.') }),
    maintenance_details: z
      .string()
      .trim()
      .min(1, t('orders.equipment.detail.log.form.errors.maintenance_required', 'Maintenance details are required.')),
    special_notes: z.string().optional(),
    cost_type: z.enum(EquipmentLogCostType),
    manager: z.string().trim().min(1, t('orders.equipment.detail.log.form.errors.manager_required', 'Person in charge is required.')),
  });

export type EquipmentLogFormValues = z.infer<ReturnType<typeof createEquipmentLogFormSchema>>;
