import { useTranslation } from 'react-i18next';

import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';

import { OrderShippingMethod, OrderStatus, OrderStatusGroup } from '../enums';
import type { OrderSearchFilterValues } from '../schemas';

export type OrderStatusFilter = Pick<OrderSearchFilterValues, 'status_group' | 'status' | 'shipping_method'>;

const STATUS_FILTER_GROUPS = [
  {
    group: OrderStatusGroup.PRODUCTION,
    items: [
      { key: 'awaiting_payment', status: OrderStatus.AWAITING_PAYMENT },
      { key: 'pending_reception', status: OrderStatus.PENDING_RECEPTION },
      { key: 'file_error', status: OrderStatus.FILE_ERROR },
      { key: 'proofing', status: OrderStatus.PENDING_CORRECTION },
      { key: 'typesetting', status: OrderStatus.TYPESETTING },
      { key: 'output', status: OrderStatus.OUTPUT_OF_POWER },
      { key: 'printing', status: OrderStatus.PRINT },
      { key: 'finishing', status: OrderStatus.POST_PROCESSING },
      { key: 'production_done', status: OrderStatus.PRODUCTION_DONE },
    ],
  },
  {
    group: OrderStatusGroup.DESIGN,
    items: [
      { key: 'awaiting_payment', status: OrderStatus.AWAITING_PAYMENT },
      { key: 'pending_reception', status: OrderStatus.PENDING_RECEPTION },
      { key: 'design_in_progress', status: OrderStatus.DESIGN_IN_PROGRESS },
      { key: 'draft_delivery', status: OrderStatus.DESIGN_CONFIRMATION_REQUESTED },
      { key: 'design_done', status: OrderStatus.DESIGN_CONFIRMED },
    ],
  },
  {
    group: OrderStatusGroup.DELIVERY,
    items: [
      { key: 'awaiting_dispatch', status: OrderStatus.READY_TO_SHIP },
      { key: 'courier', status: OrderStatus.SHIPPING, shipping_method: OrderShippingMethod.COURIER },
      { key: 'quick', status: OrderStatus.SHIPPING, shipping_method: OrderShippingMethod.QUICK },
      { key: 'pickup', status: OrderStatus.SHIPPING, shipping_method: OrderShippingMethod.PICKUP },
      { key: 'direct', status: OrderStatus.SHIPPING, shipping_method: OrderShippingMethod.DIRECT },
      { key: 'delivered', status: OrderStatus.DELIVERY_COMPLETED },
    ],
  },
] as const satisfies readonly {
  group: OrderStatusGroup;
  items: readonly { key: string; status: OrderStatus; shipping_method?: OrderShippingMethod }[];
}[];

type StatusFilterItem = (typeof STATUS_FILTER_GROUPS)[number]['items'][number];

const EMPTY_STATUS_FILTER: OrderStatusFilter = { status_group: undefined, status: undefined, shipping_method: undefined };

const findItem = (group: OrderStatusGroup | undefined, match: (item: StatusFilterItem) => boolean): StatusFilterItem | undefined =>
  STATUS_FILTER_GROUPS.find((entry) => entry.group === group)?.items.find(match);

// Select values are "<group>:<item key>"
function toSelectValue(filter: OrderStatusFilter) {
  if (!filter.status_group || !filter.status) return undefined;
  const item = findItem(
    filter.status_group,
    (candidate) =>
      candidate.status === filter.status && ('shipping_method' in candidate ? candidate.shipping_method : undefined) === filter.shipping_method,
  );
  return item ? `${filter.status_group}:${item.key}` : undefined;
}

function fromSelectValue(value?: string): OrderStatusFilter {
  const [group, key] = (value?.split(':') ?? []) as [OrderStatusGroup | undefined, string | undefined];
  const item = findItem(group, (candidate) => candidate.key === key);
  if (!item) return EMPTY_STATUS_FILTER;
  return {
    status_group: group,
    status: item.status,
    shipping_method: 'shipping_method' in item ? item.shipping_method : undefined,
  };
}

type OrderStatusFilterSelectProps = {
  value: OrderStatusFilter;
  onChange: (value: OrderStatusFilter) => void;
  id?: string;
  placeholder?: string;
  'aria-label'?: string;
};

/** Status select listed under production / design / delivery headings */
export function OrderStatusFilterSelect({ value, onChange, id, placeholder, 'aria-label': ariaLabel }: OrderStatusFilterSelectProps) {
  const { t } = useTranslation('page');

  const options: AppSelectOption[] = STATUS_FILTER_GROUPS.flatMap(({ group, items }) => {
    const groupLabel = t(`orders.list.filters.status_filter.groups.${group}`);
    return items.map((item) => {
      const itemLabel = t(`orders.list.filters.status_filter.options.${item.key}`);
      return { value: `${group}:${item.key}`, label: itemLabel, group: groupLabel };
    });
  });

  return (
    <AppSelect
      id={id}
      value={toSelectValue(value)}
      onValueChange={(next) => onChange(fromSelectValue(next))}
      options={options}
      placeholder={placeholder}
      aria-label={ariaLabel}
      contentClassName='w-auto min-w-56'
      clearable
    />
  );
}
