import { z } from 'zod';

import { WebEditorStatus, WebEditorType } from '../enums';

// === URL Search Schema ===

export const webEditorListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  search_keyword: z.string().optional().catch(undefined),
  type: z.nativeEnum(WebEditorType).optional().catch(undefined),
  is_active: z.enum(['true', 'false']).optional().catch(undefined),
});

export type WebEditorListSearch = z.infer<typeof webEditorListSearchSchema>;

// === Filter ===

export type WebEditorFilterValues = {
  search_keyword?: string;
  type?: WebEditorType;
  is_active?: 'true' | 'false';
};

// === Form ===

export const createWebEditorSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(WebEditorType),
  width: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
  unit: z.literal('mm'),
  dpi: z.coerce.number().min(1),
  bleed: z.coerce.number().min(0),
  safe_area: z.coerce.number().min(0),
  status: z.nativeEnum(WebEditorStatus),
});

export type CreateWebEditorFormValues = z.infer<typeof createWebEditorSchema>;
export type EditWebEditorFormValues = CreateWebEditorFormValues;

export const editWebEditorInfoSchema = z.object({
  name: z.string().min(1),
  status: z.nativeEnum(WebEditorStatus),
});
export type EditWebEditorInfoFormValues = z.infer<typeof editWebEditorInfoSchema>;
