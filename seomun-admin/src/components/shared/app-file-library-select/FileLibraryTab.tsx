import { useInfiniteQuery } from '@tanstack/react-query';
import { Check, File, FileText, Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { DEFAULT_PAGE } from '@/constants/pagination';
import type { FileType } from '@/enums';
import { listFiles, type UploadedFile } from '@/lib/api/upload-file';
import { cn } from '@/utils/cn';

import { matchesAccepted, toSelectedFile } from '@/utils/helper/fileLibrary.helper';

import { getImageFileTypeOptions } from '@/features/system-content/images/constants';
import { DEFAULT_PER_PAGE, type SelectedFile } from './type';

type FileLibraryTabProps = {
  isActive: boolean;
  acceptedExtensions: string[];
  selected: Map<string, SelectedFile>;
  onToggleSelect: (file: SelectedFile) => void;
  onFilesLoaded: (files: UploadedFile[]) => void;
};

function FileThumbnail({ file, isSelected, onClick }: { file: UploadedFile; isSelected: boolean; onClick: () => void }) {
  const isImage = file.mime_type.startsWith('image/');
  const isPdf = file.mime_type === 'application/pdf';
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border text-left transition-all',
        '[contain-intrinsic-size:0_140px] [content-visibility:auto]',
        isSelected ? 'border-primary ring-primary/30 ring-2' : 'border-input hover:border-primary/50',
      )}
    >
      <div className='bg-muted/30 relative flex h-24 items-center justify-center'>
        {isImage ? (
          <>
            {!imgLoaded && (
              <div className='bg-muted/40 absolute inset-0 flex animate-pulse items-center justify-center'>
                <Loader2 className='text-muted-foreground size-4 animate-spin' />
              </div>
            )}
            <img
              src={file.url}
              alt={file.name}
              loading='lazy'
              decoding='async'
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className={cn('h-full w-full object-cover transition-opacity duration-200', imgLoaded ? 'opacity-100' : 'opacity-0')}
            />
          </>
        ) : isPdf ? (
          <FileText className='size-10 text-red-400' />
        ) : (
          <File className='size-10 text-blue-400' />
        )}
      </div>
      <div className='space-y-0.5 px-2 py-1.5'>
        <p className='truncate text-xs font-medium' title={file.name}>
          {file.name}
        </p>
      </div>
      {isSelected && (
        <div className='bg-primary text-primary-foreground absolute top-1.5 right-1.5 rounded-full p-0.5'>
          <Check className='size-3' />
        </div>
      )}
    </button>
  );
}

export function FileLibraryTab({ isActive, acceptedExtensions, selected, onToggleSelect, onFilesLoaded }: FileLibraryTabProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FileType | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // const [kindFilter, setKindFilter] = useState<FileKind>('all');
  //
  // const fileKindOptions = useMemo(() => {
  //   const kinds = new Set<FileKind>();
  //   acceptedExtensions.forEach((ext) => {
  //     const k = kindOfExt(ext);
  //     if (k !== 'all') kinds.add(k);
  //   });
  //   const options: { value: FileKind; label: string }[] = [{ value: 'all', label: t('file_library.kind.all') }];
  //   if (kinds.has('image')) options.push({ value: 'image', label: t('file_library.kind.image') });
  //   if (kinds.has('pdf')) options.push({ value: 'pdf', label: t('file_library.kind.pdf') });
  //   if (kinds.has('document')) options.push({ value: 'document', label: t('file_library.kind.document') });
  //   return options;
  // }, [acceptedExtensions, t]);

  const categoryOptions = useMemo(() => getImageFileTypeOptions(t), [t]);

  const handleSubmitSearch = () => setSearchTerm(searchInput);

  const trimmedSearch = searchTerm.trim() || undefined;
  const queryParams = { per_page: DEFAULT_PER_PAGE, type: categoryFilter, name: trimmedSearch };
  const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['file-library', 'list', queryParams],
    queryFn: ({ pageParam }) => listFiles({ ...queryParams, page: pageParam }),
    enabled: isActive,
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => {
      const { current_page, total_page } = lastPage.pagination;
      return current_page < total_page ? current_page + 1 : undefined;
    },
    staleTime: 30_000,
  });

  const isRefetching = isFetching && !isLoading && !isFetchingNextPage;

  const files = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.data?.files ?? []) ?? [];
    // 'designs' files are order artwork uploads, not selectable library assets.
    return list.filter((f) => f.type !== 'designs' && matchesAccepted(f.name, acceptedExtensions));
    // && matchesKind(f.name, kindFilter) — disabled, see kindFilter TODO above
  }, [data, acceptedExtensions]);

  useEffect(() => {
    if (files.length > 0) onFilesLoaded(files);
  }, [files, onFilesLoaded]);

  useEffect(() => {
    if (!isActive) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isActive, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={cn('space-y-3', !isActive && 'hidden')}>
      <div className='grid gap-3 sm:grid-cols-[1fr_200px_auto]'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <AppInput
            value={searchInput}
            onValueChange={(v) => {
              setSearchInput(v);
              if (v === '') setSearchTerm('');
            }}
            onEnter={handleSubmitSearch}
            placeholder={t('file_library.search_placeholder')}
            size='md'
            className='pl-9'
            clearable
          />
        </div>
        {/* <AppSelect
          value={kindFilter}
          onValueChange={(v) => setKindFilter((v as FileKind) ?? 'all')}
          options={fileKindOptions}
          placeholder={t('file_library.kind.all')}
          size='md'
          clearable={false}
        /> */}
        <AppSelect
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as FileType | undefined)}
          options={categoryOptions}
          placeholder={t('file_library.category_placeholder')}
          size='md'
          clearable
        />
        <AppButton onClick={handleSubmitSearch}>{tCommon('action.search')}</AppButton>
      </div>

      <div className='relative h-90 overflow-y-auto'>
        {isLoading ? (
          <div className='text-muted-foreground flex h-full items-center justify-center gap-2 text-sm'>
            <Loader2 className='size-4 animate-spin' />
            {tCommon('message.loading')}
          </div>
        ) : files.length === 0 ? (
          <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>{t('file_library.empty')}</div>
        ) : (
          <>
            <div className={cn('grid grid-cols-3 gap-3 sm:grid-cols-4', isRefetching && 'pointer-events-none')}>
              {files.map((file) => (
                <FileThumbnail key={file.id} file={file} isSelected={selected.has(file.url)} onClick={() => onToggleSelect(toSelectedFile(file))} />
              ))}
            </div>
            <div ref={sentinelRef} className='h-px w-full' />
            {isFetchingNextPage && (
              <div className='text-muted-foreground flex items-center justify-center gap-2 py-3 text-xs'>
                <Loader2 className='size-4 animate-spin' />
                {tCommon('message.loading')}
              </div>
            )}
            {isRefetching && (
              <div className='bg-background/40 sticky inset-0 flex items-center justify-center backdrop-blur-[1px]'>
                <Loader2 className='text-muted-foreground size-6 animate-spin' />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
