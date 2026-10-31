export type AppExportDialogTranslations = {
  title: string;
  description: string;
  typeLabel: string;
  allItems: string;
  allItemsDescription: string;
  currentPage: string;
  currentPageDescription: string;
  selectedItems: string;
  selectedItemsDescription: string;
  items: string;
  privacyNotice: string;
  privacyNoticeDescription: string;
  cancel: string;
  confirm: string;
};

export type AppExportDialogTypes<TExportType extends string> = {
  all: TExportType;
  current: TExportType;
  selected: TExportType;
};

export type AppExportDialogProps<TExportType extends string> = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: TExportType) => void;
  exportTypes: AppExportDialogTypes<TExportType>;
  translations: AppExportDialogTranslations;
  totalCount?: number;
  currentPageCount?: number;
  selectedCount?: number;
  isExporting?: boolean;
  defaultExportType?: TExportType;
};
