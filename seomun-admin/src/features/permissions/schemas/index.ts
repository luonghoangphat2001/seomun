import { z } from 'zod';

import type { PermissionRESP } from '../api/permission.response';
import { PermissionUsageStatus } from '../enums';

export const permissionFormSchema = z.object({
  name: z.string().trim().min(1, 'Permission name is required.'),
  description: z.string().trim().optional(),
  usage_status: z.enum(PermissionUsageStatus),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export function getPermissionFormDefaultValues(permission?: PermissionRESP | null): PermissionFormValues {
  return {
    name: permission?.name ?? '',
    description: permission?.description ?? '',
    usage_status: permission?.usage_status.value ?? PermissionUsageStatus.ACTIVE,
  };
}

export const permissionListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  search: z.coerce.string().optional().catch(undefined),
  usage_status: z.enum(PermissionUsageStatus).optional().catch(undefined),
});

export type PermissionListSearch = z.infer<typeof permissionListSearchSchema>;
