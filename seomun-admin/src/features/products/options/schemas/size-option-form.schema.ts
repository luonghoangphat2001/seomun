import { z } from 'zod';

import type { SizeOption } from '../api/option.response';

const numberField = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => !isNaN(Number(v)), 'Must be a number')
  .refine((v) => Number(v) >= 0, 'Must be 0 or greater');

export const sizeOptionFormSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  cutting_width: numberField,
  cutting_height: numberField,
});

export type SizeOptionFormValues = z.infer<typeof sizeOptionFormSchema>;

export const WORKING_SIZE_MARGIN_MM = 2;

export function buildSizeOptionName(cuttingWidth: string, cuttingHeight: string): string {
  return `${cuttingWidth}x${cuttingHeight}`;
}

export function getSizeOptionFormDefaults(option?: SizeOption): SizeOptionFormValues {
  return {
    name: option ? option.name : '',
    cutting_width: option ? String(option.cutting_width) : '',
    cutting_height: option ? String(option.cutting_height) : '',
  };
}
