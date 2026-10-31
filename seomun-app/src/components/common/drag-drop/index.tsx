'use client';

import { FolderUpload, PaperClip, XClose } from '@/icons';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';

export interface DragDropProps {
  onChange?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  error?: string;
  className?: string;
  label?: string;
  description?: string;
  files?: File[];
}

export const DragDrop: React.FC<DragDropProps> = ({
  onChange,
  multiple = true,
  accept,
  error,
  className,
  label = 'Drag and drop files here',
  description = 'Choose a file or drag it here',
  files = [],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = multiple ? [...files, ...selectedFiles] : selectedFiles;
      onChange?.(updatedFiles);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      const updatedFiles = multiple ? [...files, ...selectedFiles] : selectedFiles;
      onChange?.(updatedFiles);
    }
  };

  const handleRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange?.(updatedFiles);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-border-soft w-full rounded-[8px] border border-dashed transition-colors hover:bg-gray-50',
          error && 'border-error',
        )}>
        <label className='flex w-full cursor-pointer flex-col items-center justify-center gap-3 py-8'>
          <input type='file' ref={inputRef} className='hidden' onChange={handleFileChange} multiple={multiple} accept={accept} />
          <FolderUpload className='size-12' />
          <div className='flex flex-col items-center gap-0.5 text-center'>
            <p className='caption-12'>{label}</p>
            <p className='caption-12 text-text-third'>{description}</p>
          </div>
        </label>

        {files.length > 0 && (
          <div className='flex flex-wrap gap-2 px-3 pb-3'>
            {files.map((file, index) => (
              <div key={index} className='bg-fill-soft text-text-main flex items-center gap-2 rounded px-2 py-1'>
                <PaperClip className='text-text-soft size-3' />
                <span className='body-14 max-w-[150px] truncate'>{file.name}</span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(index);
                  }}
                  className='hover:text-error transition-colors'>
                  <XClose className='size-4 cursor-pointer' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className='text-error caption-12'>{error}</p>}
    </div>
  );
};

DragDrop.displayName = 'DragDrop';
