import type { ReactNode } from 'react';

export const INFO_PANEL_CLASS = 'rounded-md border border-gray-200 bg-gray-50 p-4';

const SECTION_CLASS = 'space-y-4 rounded-lg border border-gray-200 bg-white p-4 [contain-intrinsic-size:auto_260px] [content-visibility:auto]';

type CategoryFormSectionProps = {
  title: string;
  children: ReactNode;
};

type CategoryInfoFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function CategoryFormSection({ title, children }: CategoryFormSectionProps) {
  return (
    <section className={SECTION_CLASS}>
      <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
      {children}
    </section>
  );
}

export function CategoryInfoField({ label, value, className }: CategoryInfoFieldProps) {
  return (
    <div className={className}>
      <span className='font-semibold text-gray-700'>{label}:</span> {value}
    </div>
  );
}
