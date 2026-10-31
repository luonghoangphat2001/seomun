import type { ComponentType, ReactNode, SVGProps } from 'react';

export type AppRichTextEditorProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  isInvalid?: boolean;
  minHeight?: number;
  maxLength?: number;
  imageUploadMode?: 'url' | 'deferred';
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadingChange?: (isUploading: boolean) => void;
  className?: string;
};

export type EditorButtonProps = {
  label: string;
  disabledLabel?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
};

export type TextColorPickerProps = {
  label?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

export type ImageCaptionPosition = 'above' | 'below';

export type CellBorderAction = 'all' | 'none' | 'outside' | 'inside' | 'top' | 'bottom' | 'left' | 'right';

export type ToolbarMenuProps = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  groups: readonly (readonly { value: string; label: string; icon: ReactNode }[])[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
};

export type ToolbarSelectProps = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
};

export type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isParagraph: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
  textColor: string;
  textBackgroundColor: string;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  isHorizontalRule: boolean;
  horizontalRuleThickness: number;
  isAlignLeft: boolean;
  isAlignCenter: boolean;
  isAlignRight: boolean;
  isAlignJustify: boolean;
  isLink: boolean;
  isTable: boolean;
  isTableBorderless: boolean;
  cellBackgroundColor: string;
  characterCount: number;
  wordCount: number;
};
