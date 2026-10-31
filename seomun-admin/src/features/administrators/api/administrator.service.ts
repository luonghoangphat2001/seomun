import dayjs from 'dayjs';

import type { AdministratorFormValues } from '../schemas';
import type { AdministratorCreateREQ, AdministratorUpdateREQ } from './administrator.request';

const formatOptionalDate = (value?: Date | null) => (value ? dayjs(value).format('YYYY-MM-DD') : undefined);

export function mapAdministratorFormToCreateREQ(values: AdministratorFormValues): AdministratorCreateREQ {
  return {
    username: values.username,
    name: values.name,
    password: values.password,
    password_confirmation: values.password_confirmation,
    email: values.email,
    mobile: values.mobile.replace(/\D/g, ''),
    admin_permission_ids: values.admin_permission_id ? [Number(values.admin_permission_id)] : [],
    hire_date: formatOptionalDate(values.hire_date),
    resignation_date: formatOptionalDate(values.resignation_date),
    department: values.department || undefined,
    position: values.position || undefined,
    phone: values.phone?.replace(/\D/g, '') || undefined,
    bank_name: values.bank_name || undefined,
    account_number: values.account_number || undefined,
    note: values.note || undefined,
  };
}

export function mapAdministratorFormToUpdateREQ(values: AdministratorFormValues): AdministratorUpdateREQ {
  return {
    status: values.status,
    role: values.role,
    name: values.name,
    mobile: values.mobile.replace(/\D/g, ''),
    admin_permission_ids: values.admin_permission_id ? [Number(values.admin_permission_id)] : [],
    hire_date: formatOptionalDate(values.hire_date),
    resignation_date: formatOptionalDate(values.resignation_date),
    department: values.department || undefined,
    position: values.position || undefined,
    phone: values.phone?.replace(/\D/g, '') || undefined,
    bank_name: values.bank_name || undefined,
    account_number: values.account_number || undefined,
    note: values.note || undefined,
  };
}
