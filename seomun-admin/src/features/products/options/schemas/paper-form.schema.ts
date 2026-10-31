import { z } from 'zod';

import type { Paper } from '../api/option.response';
import { PaperCategory, PaperStatusValue } from '../enums';

const requiredNumberField = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => !isNaN(Number(v)), 'Must be a number');

export const paperFormSchema = z.object({
  category: z.nativeEnum(PaperCategory),
  name: z.string().trim().min(1, 'Name is required'),
  is_active: z.nativeEnum(PaperStatusValue),
  thickness_mm: requiredNumberField.refine((v) => Number(v) >= 0, 'Must be 0 or greater'),
  paper_type_option_value_id: z.string().trim().min(1, 'Required'),
  paper_color_option_value_id: z.string().trim().min(1, 'Required'),
  paper_weight_option_value_id: z.string().trim().min(1, 'Required'),
});

export type PaperFormValues = z.infer<typeof paperFormSchema>;

export function getPaperFormDefaults(paper?: Paper): PaperFormValues {
  const thicknessMm = paper?.specification?.thickness_mm;

  return {
    category: paper?.category ?? PaperCategory.GENERAL_PAPER,
    name: paper?.name ?? '',
    is_active: paper ? (paper.is_active ? PaperStatusValue.ACTIVE : PaperStatusValue.HIDDEN) : PaperStatusValue.ACTIVE,
    thickness_mm: typeof thicknessMm === 'number' ? String(thicknessMm) : '',
    paper_type_option_value_id: paper?.paper_type_option_value_id ? String(paper.paper_type_option_value_id) : '',
    paper_color_option_value_id: paper?.paper_color_option_value_id ? String(paper.paper_color_option_value_id) : '',
    paper_weight_option_value_id: paper?.paper_weight_option_value_id ? String(paper.paper_weight_option_value_id) : '',
  };
}
