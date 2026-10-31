import { TFunction } from '@/types';
import { z } from 'zod';

export const shippingAddressSchema = (t: TFunction) =>
  z.object({
    ordererName: z.string().min(1, t('validation.required', { field: t('common.orderer') })),
    postCode: z.string().min(1, t('validation.required', { field: t('auth.address') })),
    address: z.string().min(1, t('validation.required', { field: t('auth.address') })),
    addressDetail: z.string().optional(),
    phoneHead: z.string().min(1, t('validation.select_required', { field: t('auth.cellphone') })),
    phoneBody: z
      .string()
      .min(4, t('validation.min_length', { field: t('auth.cellphone'), length: 4 }))
      .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
    phoneTail: z
      .string()
      .min(4, t('validation.min_length', { field: t('auth.cellphone'), length: 4 }))
      .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
    messageOption: z.string().optional(),
    messageNote: z.string().optional(),
    isDefault: z.boolean().optional(),
  });

export type ShippingAddressFormValues = z.infer<ReturnType<typeof shippingAddressSchema>>;

export const shippingAddressDefaultValues: ShippingAddressFormValues = {
  ordererName: '',
  postCode: '',
  address: '',
  addressDetail: '',
  phoneHead: '',
  phoneBody: '',
  phoneTail: '',
  messageOption: '',
  messageNote: '',
  isDefault: false,
};
