import type { TFunction } from 'i18next';

// The backend sends a full sentence (e.g. "Member has been updated"), so match by substring rather than exact value.
function getCustomerAuditActionKind(action: string): 'created' | 'updated' | 'deleted' {
  const normalized = action.toLowerCase();
  if (normalized.includes('creat')) return 'created';
  if (normalized.includes('delet')) return 'deleted';
  return 'updated';
}

export function getCustomerAuditActionLabel(t: TFunction, action: string) {
  return t(`page.customers.detail.audit_log.action.${getCustomerAuditActionKind(action)}` as never) as string;
}

export function getCustomerAuditActionBadgeClass(action: string) {
  const kind = getCustomerAuditActionKind(action);
  if (kind === 'created') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (kind === 'deleted') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-orange-200 bg-orange-50 text-orange-700';
}
