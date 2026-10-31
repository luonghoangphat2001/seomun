import { TFunction } from '@/types';
import { z } from 'zod';

export const workerUpsertSchema = (t: TFunction) =>
  z.object({
    workerName: z.string().min(1, t('validation.required', { field: t('common.worker') })),
    cellphonePrefix: z.string().min(1, t('validation.select_required', { field: t('auth.cellphone') })),
    cellphone1: z
      .string()
      .min(3, t('validation.min_length', { field: t('auth.cellphone'), length: 3 }))
      .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
    cellphone2: z
      .string()
      .min(4, t('validation.min_length', { field: t('auth.cellphone'), length: 4 }))
      .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
  });

export type WorkerUpsertFormValues = z.infer<ReturnType<typeof workerUpsertSchema>>;

export const workerUpsertDefault: WorkerUpsertFormValues = {
  workerName: '',
  cellphonePrefix: '010',
  cellphone1: '',
  cellphone2: '',
};
