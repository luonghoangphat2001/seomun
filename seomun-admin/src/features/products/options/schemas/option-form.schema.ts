import { z } from 'zod';

import type { ErpOptionRESP } from '../api/option.response';

export const optionFormSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  label: z.string().trim().min(1, 'Label is required'),
  // only used by the paper weight group (gram); other groups leave it empty
  value: z
    .string()
    .trim()
    .refine((v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be 0 or greater'),
  image: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export type OptionFormValues = z.infer<typeof optionFormSchema>;

export function getOptionFormDefaults(editOption?: ErpOptionRESP): OptionFormValues {
  return {
    code: editOption?.code ?? '',
    label: editOption?.label ?? '',
    value: editOption?.value ?? '',
    image: editOption?.attributes?.image ?? '',
    description: editOption?.attributes?.description ?? '',
  };
}
