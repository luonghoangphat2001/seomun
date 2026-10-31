import type { PermissionFormValues } from '../schemas';
import type { PermissionCreateREQ, PermissionUpdateREQ } from './permission.request';

export function mapPermissionFormToCreateREQ(values: PermissionFormValues): PermissionCreateREQ {
  return {
    name: values.name,
    description: values.description,
    usage_status: values.usage_status,
  };
}

export function mapPermissionFormToUpdateREQ(values: PermissionFormValues): PermissionUpdateREQ {
  return {
    name: values.name,
    description: values.description,
    usage_status: values.usage_status,
  };
}
