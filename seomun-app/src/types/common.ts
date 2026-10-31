import { useTranslations } from 'next-intl';

export type TFunction = ReturnType<typeof useTranslations>;
export type FileType = {
  key: string;
  url: string;
  name: string;
  size: number; //in Byte
};

export type ProductSelectOption = {
  value: string;
  label: string;
};
