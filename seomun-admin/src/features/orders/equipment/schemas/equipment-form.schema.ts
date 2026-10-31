import type { TFunction } from 'i18next';
import { z } from 'zod';

import { EquipmentMachineType, EquipmentStatus, EquipmentWorkProcess } from '../enums';

export const createEquipmentFormSchema = (t: TFunction<'page'>) =>
  z.object({
    company_name: z.string().trim().min(1, t('orders.equipment.form.errors.company_required', 'Company name is required.')),
    name: z.string().trim().min(1, t('orders.equipment.form.errors.name_required', 'Equipment name is required.')),
    image: z.custom<File | string | null | undefined>((value) => value == null || typeof value === 'string' || value instanceof File, {
      message: t('orders.equipment.form.errors.invalid_image', 'Invalid image file.'),
    }),
    machine_type: z.enum(EquipmentMachineType).optional(),
    maintenance_company: z.string().optional(),
    manager_name: z.string().optional(),
    manager_phone: z.string().optional(),
    introduced_at: z.date().nullable().optional(),
    work_process: z.enum(EquipmentWorkProcess),
    status: z.enum(EquipmentStatus),
    notes: z.string().optional(),
  });

export type EquipmentFormValues = z.infer<ReturnType<typeof createEquipmentFormSchema>>;

export const EQUIPMENT_FORM_DEFAULT_VALUES: EquipmentFormValues = {
  company_name: '',
  name: '',
  image: null,
  machine_type: undefined,
  maintenance_company: '',
  manager_name: '',
  manager_phone: '',
  introduced_at: null,
  work_process: EquipmentWorkProcess.PRINTING,
  status: EquipmentStatus.ACTIVE,
  notes: '',
};
