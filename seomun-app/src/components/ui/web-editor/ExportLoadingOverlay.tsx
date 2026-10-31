'use client';

import { useWebEditorStore } from '@/hooks';
import { Spinner } from '@/icons';

export const ExportLoadingOverlay = () => {
  const { isExportLoading } = useWebEditorStore();

  if (!isExportLoading) return null;

  return (
    <div className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-3xl'>
      <Spinner color='#fff' size='xl' className='title-24 animate-spin' />
    </div>
  );
};
