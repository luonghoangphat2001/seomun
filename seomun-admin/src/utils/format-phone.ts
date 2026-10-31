export function blockNonDigitKey(event: { key: string; preventDefault: () => void }): void {
  if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
}

export function formatPhoneNumber(value?: string | null): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  if (digits.length === 10) {
    return digits.startsWith('02') ? digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3') : digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  if (digits.length === 9 && digits.startsWith('02')) return digits.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  if (digits.length === 8) return digits.replace(/(\d{4})(\d{4})/, '$1-$2');

  return value;
}
