import { PrintOption, ProductSpineSide } from '@/enums/product';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

type TFunction = ReturnType<typeof useTranslations>;

export const getFileUploadSchema = (tProduct: TFunction, tValidation: TFunction) =>
  z.object({
    title: z.string().min(1, tValidation('required', { field: tProduct('title') })),
    printOption: z.enum(PrintOption),
    files: z.array(z.any()).min(1, tValidation('file_required')),
  });

export const calculateSpineSchema = () =>
  z.object({
    paper_id: z.number().min(1),
    print_side: z.enum(ProductSpineSide),
    pages: z.number().min(1),
  });

export const createSaveOptionsSchema = (t: TFunction) =>
  z.object({
    optionName: z.string().min(1, t('validation.required', { field: t('product.option_name') })),
    memo: z.string().optional(),
  });

export type FileUploadFormValues = z.infer<ReturnType<typeof getFileUploadSchema>>;
export type CalculateSpineFormValues = z.output<ReturnType<typeof calculateSpineSchema>>;
export type SaveOptionsFormValues = z.infer<ReturnType<typeof createSaveOptionsSchema>>;
