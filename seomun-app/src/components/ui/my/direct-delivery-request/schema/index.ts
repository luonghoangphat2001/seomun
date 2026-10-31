import { TFunction } from '@/types';
import { z } from 'zod';

export const directDeliveryRequestSchema = (t: TFunction) =>
  z.object({
    type: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('inquiry.delivery_address') })),
    name: z.string().min(1, t('validation.required', { field: t('inquiry.name') })),
    phonePrefix: z.string().min(1, t('validation.required', { field: t('inquiry.phone_number') })),
    phone1: z
      .string()
      .min(4, t('validation.min_length', { field: t('inquiry.phone_number'), length: 4 }))
      .max(4, t('validation.max_length', { field: t('inquiry.phone_number'), length: 4 })),
    phone2: z
      .string()
      .min(4, t('validation.min_length', { field: t('inquiry.phone_number'), length: 4 }))
      .max(4, t('validation.max_length', { field: t('inquiry.phone_number'), length: 4 })),
    zipCode: z.string().min(1, t('validation.required', { field: t('inquiry.address') })),
    address: z.string().min(1, t('validation.required', { field: t('inquiry.address') })),
    detailedAddress: z.string().optional(),
    storage: z.string().optional(),
    detail: z.string().min(1, t('validation.required', { field: t('inquiry.detailed_request') })),
    files: z.array(z.any()).optional(),
  });

export type DirectDeliveryRequestFormValues = z.infer<ReturnType<typeof directDeliveryRequestSchema>>;

export const directDeliveryRequestDefault: DirectDeliveryRequestFormValues = {
  type: '',
  name: '',
  phonePrefix: '',
  phone1: '',
  phone2: '',
  zipCode: '',
  address: '',
  detailedAddress: '',
  storage: '',
  detail: '',
  files: [],
};
