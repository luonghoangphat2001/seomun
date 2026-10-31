'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const useEnumOptions = (enums: Record<string, Record<string, string>>, prefix: string) => {
  const t = useTranslations();

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(enums).map(([key, enumObj]) => [
          key,
          Object.values(enumObj).map((item) => ({
            label: t(`${prefix}.${item}`),
            value: item,
          })),
        ]),
      ),
    [t, enums, prefix],
  );
};
