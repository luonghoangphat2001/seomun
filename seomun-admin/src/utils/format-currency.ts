import i18n from 'i18next';

/**
 * Amounts are shown with a spelled-out currency ("37,348원" / "37,348 won") rather than the
 * ₩ symbol, which the client found hard to read in dense tables.
 */
export function formatKrw(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '-';
  }

  const formatted = new Intl.NumberFormat('ko-KR').format(amount);

  return i18n.language?.startsWith('en') ? `${formatted} won` : `${formatted}원`;
}
