import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';

import type { AppExportDialogProps } from './types';

export function AppExportDialog<TExportType extends string>({
  isOpen,
  onClose,
  onExport,
  exportTypes,
  translations,
  totalCount = 0,
  currentPageCount = 0,
  selectedCount = 0,
  isExporting = false,
  defaultExportType = exportTypes.current,
}: AppExportDialogProps<TExportType>) {
  const [exportType, setExportType] = useState<TExportType>(defaultExportType);
  const isSelectedExportDisabled = exportType === exportTypes.selected && selectedCount === 0;

  const options = [
    {
      type: exportTypes.all,
      label: translations?.allItems,
      description: translations?.allItemsDescription,
      count: totalCount,
    },
    {
      type: exportTypes.current,
      label: translations?.currentPage,
      description: translations?.currentPageDescription,
      count: currentPageCount,
    },
    {
      type: exportTypes.selected,
      label: translations?.selectedItems,
      description: translations?.selectedItemsDescription,
      count: selectedCount,
      disabled: selectedCount === 0,
    },
  ];

  return (
    <AppDialogModal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title={translations?.title}
      width={600}
      footer={
        <div className='flex justify-end gap-2'>
          <AppButton variant='outline' onClick={onClose} disabled={isExporting}>
            {translations?.cancel}
          </AppButton>
          <AppButton onClick={() => onExport(exportType)} disabled={isExporting || isSelectedExportDisabled} isLoading={isExporting}>
            {translations?.confirm}
          </AppButton>
        </div>
      }
    >
      <div className='space-y-4'>
        <p className='text-sm text-gray-600'>{translations?.description}</p>

        <div className='space-y-3'>
          <p className='text-sm font-semibold text-gray-700'>{translations?.typeLabel}</p>

          {options.map(({ type, label, description, count, disabled = false }) => (
            <label
              key={type}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                exportType === type ? 'border-foundation-green-normal bg-foundation-green-normal/5' : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <input
                type='radio'
                name='exportType'
                value={type}
                checked={exportType === type}
                onChange={() => setExportType(type)}
                disabled={disabled}
                className='mt-1'
              />
              <div className='flex-1'>
                <div className='font-medium text-gray-900'>
                  {label} ({count} {translations?.items})
                </div>
                <div className='text-sm text-gray-500'>{description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
          <div className='flex gap-2'>
            <AlertCircle className='h-5 w-5 shrink-0 text-blue-600' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-blue-900'>{translations?.privacyNotice}</p>
              <p className='text-sm text-blue-700'>{translations?.privacyNoticeDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </AppDialogModal>
  );
}
