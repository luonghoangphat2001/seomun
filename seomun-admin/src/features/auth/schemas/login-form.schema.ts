import { type TFunction } from 'i18next';
import { z } from 'zod';

export const loginSchema = (tForm: TFunction<'form'>, tValidation: TFunction<'validation'>) =>
  z.object({
    username: z.string().min(1, tValidation('required', { field: tForm('auth.fields.username.label') })),
    password: z.string().min(4, tValidation('min_length', { min: 4 })),
  });

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;
