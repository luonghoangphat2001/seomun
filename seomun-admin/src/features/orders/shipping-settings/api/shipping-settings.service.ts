import dayjs from 'dayjs';

import type { ShippingSettingsFormValues } from '../schemas';
import type { UpdateShippingSettingsREQ } from './shipping-settings.request';

const API_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function mapShippingSettingsFormToREQ(values: ShippingSettingsFormValues): UpdateShippingSettingsREQ {
  if (!values.free_shipping_start_at || !values.free_shipping_end_at) {
    return { free_shipping_start_at: null, free_shipping_end_at: null };
  }

  return {
    free_shipping_start_at: dayjs(values.free_shipping_start_at).startOf('day').format(API_DATE_TIME_FORMAT),
    free_shipping_end_at: dayjs(values.free_shipping_end_at).endOf('day').format(API_DATE_TIME_FORMAT),
  };
}
