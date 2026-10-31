'use client';

import { PaperClip, Upload as UploadIcon, XClose } from '@/icons';
import { cn } from '@/lib/utils';
import React, { useRef } from 'react';

export interface FileItem {
  id: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  file?: File;
}

export interface UploadProps {
  label?: string;
  labelButton?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  labelPlacement?: 'top' | 'left';
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  multiple?: boolean;
  accept?: string;
  files?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  onRemove?: (id: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export const Upload: React.FC<UploadProps> = ({
  label,
  labelButton,
  error,
  helperText,
  required = false,
  labelPlacement = 'top',
  className,
  labelClassName,
  containerClassName,
  multiple = true,
  accept,
  files = [],
  onChange,
  onRemove,
  maxFiles,
  disabled = false,
  readOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (disabled || readOnly) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      const limitedFiles = maxFiles ? updatedFiles.slice(0, maxFiles) : updatedFiles;
      onChange?.(limitedFiles);
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    if (disabled || readOnly) return;
    onRemove?.(id);
    onChange?.(files.filter((f) => f.id !== id));
  };

  const renderLabel = () =>
    label && (
      <label
        className={cn(
          'body-16 text-text-main block',
          labelPlacement === 'top' ? 'mb-2' : 'mr-4 min-w-[90px]',
          (helperText || error) && labelPlacement == 'left' && 'mb-[22px]',
          labelClassName,
        )}>
        {label}
        {required && <span className='text-error ml-0.5'>*</span>}
      </label>
    );

  return (
    <div
      className={cn(
        'w-full',
        labelPlacement === 'left' ? 'flex items-center justify-between' : 'flex flex-col',
        containerClassName,
      )}>
      {renderLabel()}

      <div className='flex w-full flex-col'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={handleButtonClick}
              className={cn(
                'border-border-soft inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border bg-white px-6 py-2 transition-all hover:bg-gray-50 active:bg-gray-100',
                error && 'border-error',
                readOnly && 'cursor-not-allowed',
                disabled && 'bg-fill-disabled hover:bg-fill-disabled cursor-not-allowed opacity-60',
                className,
              )}>
              <span className={cn('body-14 text-text-main', readOnly && 'text-text-disabled')}>
                {labelButton ?? '파일 업로드'}
              </span>
              {!readOnly && !disabled && <UploadIcon className={cn('text-text-main h-5 w-5')} />}
            </button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple={multiple}
              accept={accept}
              className='hidden'
            />
            {(helperText || error) && (
              <p className={cn('caption-12 mt-1', error ? 'text-error' : 'text-text-secondary')}>{error || helperText}</p>
            )}
          </div>

          {files.length > 0 && (
            <div className='flex flex-wrap gap-3'>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    'border-border-soft flex items-center gap-3 rounded-[8px] border bg-white px-3 py-2 transition-all',
                    !readOnly && !disabled && 'hover:border-border-brand',
                  )}>
                  <PaperClip className={cn('h-4 w-4', !readOnly && !disabled ? 'text-text-secondary' : 'text-text-disabled')} />
                  <span
                    className={cn(
                      'body-14 max-w-[200px] truncate',
                      !readOnly && !disabled ? 'text-text-secondary' : 'text-text-disabled',
                    )}>
                    {file.name}
                  </span>
                  {!readOnly && !disabled && (
                    <button
                      type='button'
                      disabled={disabled}
                      onClick={() => handleRemove(file.id)}
                      className={cn('hover:text-error text-gray-400 transition-colors', disabled && 'cursor-not-allowed')}>
                      <XClose className='h-4 w-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Upload.displayName = 'Upload';
