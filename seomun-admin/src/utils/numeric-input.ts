import type { KeyboardEvent } from 'react';

/** Hides the native `<input type="number">` spinner buttons. */
export const NO_SPIN_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

/** Blocks the characters a number input accepts but positive-amount fields never want. */
export function blockNonPositiveNumericKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['+', '-', 'e', 'E'].includes(e.key)) e.preventDefault();
}

export function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=\d)/, '');
}
