import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';

import type { OutsourcingCreateREQ, OutsourcingListREQ, OutsourcingUpdateREQ } from '../api';
import type { OutsourcingFormValues, OutsourcingListSearch } from '../schemas';

export type NormalizedOutsourcingListParams = OutsourcingListREQ & Required<Pick<OutsourcingListREQ, 'page' | 'per_page'>>;

export function buildOutsourcingListParams(search: OutsourcingListSearch): NormalizedOutsourcingListParams {
  return {
    search_type: search.keyword?.trim() ? search.search_type : undefined,
    keyword: search.keyword?.trim() || undefined,
    is_active: search.is_active === undefined ? undefined : search.is_active ? 1 : 0,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export type OutsourcingSubmitValues = Omit<OutsourcingFormValues, 'registration_certificate'> & {
  registration_certificate: string | null;
};

export function buildOutsourcingPayload(values: OutsourcingSubmitValues): OutsourcingCreateREQ {
  return {
    name: values.name.trim(),
    work_details: values.work_details.trim(),
    representative_name: values.representative_name.trim(),
    email: values.email.trim(),
    contact: values.contact.trim(),
    address: values.address.trim(),
    registration_number: values.registration_number.trim(),
    registration_certificate: values.registration_certificate,
    memo: values.memo.trim() || null,
    is_active: values.is_active,
  };
}

export function buildOutsourcingUpdatePayload(values: OutsourcingSubmitValues): OutsourcingUpdateREQ {
  return buildOutsourcingPayload(values);
}
