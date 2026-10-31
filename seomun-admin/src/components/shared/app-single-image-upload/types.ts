export type AppSingleImageUploadValue = string | File | null | undefined;

export type AppSingleImageUploadProps = {
  value?: AppSingleImageUploadValue;
  onChange?: (value: string | File) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSizeMB?: number;
  isUploading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  label?: string;
  uploadText?: string;
  uploadingText?: string;
  previewLabel?: string;
  removeLabel?: string;
  fileTooLargeMessage?: string;
  uploadErrorMessage?: string;
  description?: string;
  className?: string;
  previewClassName?: string;
  imageClassName?: string;
  emptyText?: string;
};
