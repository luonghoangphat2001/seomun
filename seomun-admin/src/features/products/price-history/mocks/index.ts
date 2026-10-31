import type { PriceHistoryActionType, PriceHistoryListREQ, PriceHistoryTargetSection } from '../api/price-history.request';
import type { PriceHistoryListRESP, PriceHistoryLog } from '../api/price-history.response';

type LogPayload = Record<string, string>;

type RecordPriceHistoryLogInput = {
  action_type: PriceHistoryActionType;
  target_section: PriceHistoryTargetSection;
  target_id: string;
  target_name: string;
  changed_field: string;
  before_payload?: LogPayload;
  after_payload?: LogPayload;
  changed_by?: string;
};

let logSequence = 0;
let mockPriceHistoryLogs: PriceHistoryLog[] = [
  {
    id: 'price-history-seed-1',
    action_type: 'UPDATE',
    target_section: 'printing',
    target_id: 'printing-1',
    target_name: 'Digital Color Print',
    changed_field: 'unit_price_item',
    before_value: 'A4 color single side',
    after_value: 'A4 color double side',
    changed_at: '2026-05-26T02:00:00.000Z',
    changed_by: 'UserA',
    summary_text: 'A4 color single side -> A4 color double side',
    before_payload: { unit_price_item: 'A4 color single side' },
    after_payload: { unit_price_item: 'A4 color double side' },
  },
  {
    id: 'price-history-seed-2',
    action_type: 'CREATE',
    target_section: 'papers',
    target_id: 'paper-13',
    target_name: 'Arctic White',
    changed_field: 'paper_name',
    before_value: '',
    after_value: 'Arctic White',
    changed_at: '2026-05-26T02:02:00.000Z',
    changed_by: 'UserA',
    summary_text: 'Created value: Arctic White',
    before_payload: {},
    after_payload: { paper_name: 'Arctic White' },
  },
  {
    id: 'price-history-seed-3',
    action_type: 'DELETE',
    target_section: 'options',
    target_id: 'option-3',
    target_name: 'Print side',
    changed_field: 'option_value',
    before_value: 'Double side',
    after_value: '',
    changed_at: '2026-05-26T02:04:00.000Z',
    changed_by: 'UserA',
    summary_text: 'Deleted value: Double side',
    before_payload: { option_value: 'Double side' },
    after_payload: {},
  },
  {
    id: 'price-history-seed-4',
    action_type: 'UPDATE',
    target_section: 'printing',
    target_id: 'printing-7',
    target_name: 'Business Card Offset',
    changed_field: 'unit_price_item',
    before_value: 'Single side glossy',
    after_value: 'Double side glossy',
    changed_at: '2026-05-26T02:06:00.000Z',
    changed_by: 'UserA',
    summary_text: 'Updated 2 fields: unit_price_item, unit_price_key',
    before_payload: {
      unit_price_item: 'Single side glossy',
      unit_price_key: 'BC_GLOSSY_SINGLE',
    },
    after_payload: {
      unit_price_item: 'Double side glossy',
      unit_price_key: 'BC_GLOSSY_DOUBLE',
    },
  },
  {
    id: 'price-history-seed-5',
    action_type: 'UPDATE',
    target_section: 'options',
    target_id: 'option-9',
    target_name: 'Packaging Option',
    changed_field: 'option_value',
    before_value: 'Standard Box',
    after_value: 'Premium Box',
    changed_at: '2026-05-26T02:08:00.000Z',
    changed_by: 'UserA',
    summary_text: 'Updated 3 fields: option_name, option_code, option_value',
    before_payload: {
      option_name: 'Packaging',
      option_code: 'PKG_STD',
      option_value: 'Standard Box',
    },
    after_payload: {
      option_name: 'Packaging Plus',
      option_code: 'PKG_PREMIUM',
      option_value: 'Premium Box',
    },
  },
];

function getSummaryText(actionType: PriceHistoryActionType, beforeValue: string, afterValue: string) {
  if (actionType === 'CREATE') {
    return `Created value: ${afterValue || '-'}`;
  }

  if (actionType === 'DELETE') {
    return `Deleted value: ${beforeValue || '-'}`;
  }

  return `${beforeValue || '-'} -> ${afterValue || '-'}`;
}

function pickChangedValue(payload: LogPayload | undefined, changedField: string) {
  if (!payload) {
    return '';
  }

  return payload[changedField] ?? '';
}

function matchesFilters(log: PriceHistoryLog, params: PriceHistoryListREQ) {
  const query = params.query?.trim().toLowerCase();
  const matchesQuery = query
    ? [log.target_name, log.target_id, log.changed_by, log.summary_text, log.before_value, log.after_value].some((value) =>
        value.toLowerCase().includes(query),
      )
    : true;

  const matchesAction = params.action_type ? log.action_type === params.action_type : true;
  const matchesSection = params.target_section ? log.target_section === params.target_section : true;

  return matchesQuery && matchesAction && matchesSection;
}

export function recordPriceHistoryLog(input: RecordPriceHistoryLogInput): PriceHistoryLog {
  logSequence += 1;
  const beforePayload = input.before_payload ?? {};
  const afterPayload = input.after_payload ?? {};
  const beforeValue = pickChangedValue(input.before_payload, input.changed_field);
  const afterValue = pickChangedValue(input.after_payload, input.changed_field);

  const log: PriceHistoryLog = {
    id: `price-history-${logSequence}`,
    action_type: input.action_type,
    target_section: input.target_section,
    target_id: input.target_id,
    target_name: input.target_name,
    changed_field: input.changed_field,
    before_value: beforeValue,
    after_value: afterValue,
    changed_at: new Date().toISOString(),
    changed_by: input.changed_by ?? 'admin.mock',
    summary_text: getSummaryText(input.action_type, beforeValue, afterValue),
    before_payload: beforePayload,
    after_payload: afterPayload,
  };

  mockPriceHistoryLogs = [log, ...mockPriceHistoryLogs];

  return log;
}

export function getMockPriceHistoryLogs(params: PriceHistoryListREQ): PriceHistoryListRESP {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 20;

  const filtered = mockPriceHistoryLogs
    .filter((item) => matchesFilters(item, params))
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  const startIndex = (page - 1) * perPage;
  const data = filtered.slice(startIndex, startIndex + perPage);

  return {
    success: true,
    message: 'Mock price history logs fetched successfully.',
    data,
    pagination: {
      current_page: page,
      per_page: perPage,
      total_page: Math.max(Math.ceil(filtered.length / perPage), 1),
      total_item: filtered.length,
    },
  };
}

export function getMockPriceHistoryLogDetail(id: string): PriceHistoryLog {
  const log = mockPriceHistoryLogs.find((item) => item.id === id);

  if (!log) {
    throw new Error('Price history log not found.');
  }

  return log;
}
