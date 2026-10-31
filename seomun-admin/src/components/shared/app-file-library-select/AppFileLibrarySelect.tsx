import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { Button } from '@/components/ui/button';
import type { FileType } from '@/enums';
import { cn } from '@/utils/cn';

import type { UploadedFile } from '@/lib/api/upload-file';
import { parseAccepted, placeholderFromUrl, toSelectedFile } from '@/utils/helper/fileLibrary.helper';

import { FileLibraryTab } from './FileLibraryTab';
import { FileUploadTab } from './FileUploadTab';
import { DEFAULT_MAX_SIZE, type SelectedFile } from './type';

type TabKey = 'library' | 'upload';

type AppFileLibrarySelectProps = {
  isOpen: boolean;
  onClose: () => void;
  fileType: FileType;
  accepted: string;
  multiple?: boolean;
  maxSize?: number;
  limit?: number;
  /** URLs already selected by the caller — pre-selected when modal opens. */
  selectedUrls?: string[];
  onSelect: (files: SelectedFile[]) => void;
};

export function AppFileLibrarySelect({
  isOpen,
  onClose,
  fileType,
  accepted,
  multiple = false,
  maxSize = DEFAULT_MAX_SIZE,
  limit,
  selectedUrls,
  onSelect,
}: AppFileLibrarySelectProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const queryClient = useQueryClient();

  const acceptedExtensions = useMemo(() => parseAccepted(accepted), [accepted]);

  const [tab, setTab] = useState<TabKey>('library');
  const [selected, setSelected] = useState<Map<string, SelectedFile>>(new Map());

  const selectedUrlsKey = (selectedUrls ?? []).join('|');

  const openKey = isOpen ? selectedUrlsKey : null;
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(null);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (isOpen) {
      const initial = new Map<string, SelectedFile>();
      selectedUrls?.forEach((url) => initial.set(url, placeholderFromUrl(url)));
      setSelected(initial);
      setTab('library');
    }
  }

  const handleToggleSelect = useCallback(
    (file: SelectedFile) => {
      const isSelected = selected.has(file.url);
      if (!isSelected && multiple && limit !== undefined && selected.size >= limit) {
        toast.error(t('file_library.max_files', { count: limit }));
        return;
      }
      setSelected((prev) => {
        const next = new Map(prev);
        if (next.has(file.url)) {
          next.delete(file.url);
        } else {
          if (!multiple) next.clear();
          next.set(file.url, file);
        }
        return next;
      });
    },
    [selected, multiple, limit, t],
  );

  // Upgrade placeholder entries to full metadata once the library data arrives.
  const handleFilesLoaded = useCallback((files: UploadedFile[]) => {
    setSelected((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const file of files) {
        const existing = next.get(file.url);
        if (existing && existing.path === '') {
          next.set(file.url, toSelectedFile(file));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const handleUploaded = useCallback(
    (uploaded: SelectedFile[]) => {
      const next = multiple ? new Map(selected) : new Map<string, SelectedFile>();
      let exceeded = false;
      for (const file of uploaded) {
        if (next.has(file.url)) continue;
        if (multiple && limit !== undefined && next.size >= limit) {
          exceeded = true;
          break;
        }
        next.set(file.url, file);
      }
      if (exceeded) toast.error(t('file_library.max_files', { count: limit }));
      setSelected(next);
      void queryClient.invalidateQueries({ queryKey: ['file-library'] });
      setTab('library');
    },
    [multiple, limit, selected, t, queryClient],
  );

  const handleConfirm = () => {
    onSelect(Array.from(selected.values()));
    onClose();
  };

  const selectedCount = selected.size;

  return (
    <AppDialogModal
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!open) onClose();
      }}
      title={t('file_library.title')}
      width={720}
      contentClassName='sm:max-w-3xl'
      footer={
        <>
          <Button variant='outline' onClick={onClose}>
            {tCommon('action.cancel')}
          </Button>
          <Button onClick={handleConfirm}>
            {selectedCount > 0 ? t('file_library.confirm_with_count', { count: selectedCount }) : t('file_library.confirm')}
          </Button>
        </>
      }
    >
      <div className='space-y-4'>
        <div className='flex items-center gap-2 border-b'>
          {(['library', 'upload'] as const).map((key) => (
            <button
              key={key}
              type='button'
              onClick={() => setTab(key)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                tab === key ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {t(`file_library.tab.${key}`)}
            </button>
          ))}
        </div>

        <FileLibraryTab
          isActive={tab === 'library'}
          acceptedExtensions={acceptedExtensions}
          selected={selected}
          onToggleSelect={handleToggleSelect}
          onFilesLoaded={handleFilesLoaded}
        />

        <FileUploadTab
          isActive={tab === 'upload'}
          fileType={fileType}
          accepted={accepted}
          acceptedExtensions={acceptedExtensions}
          multiple={multiple}
          maxSize={maxSize}
          onUploaded={handleUploaded}
        />
      </div>
    </AppDialogModal>
  );
}
