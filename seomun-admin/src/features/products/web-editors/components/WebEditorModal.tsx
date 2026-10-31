import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, type KeyboardEvent } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import { DEFAULT_DPI, WEB_EDITOR_TYPE_TRANSLATION_KEYS, WEB_EDITOR_TYPE_VALUES } from '../constants';
import { WebEditorStatus, WebEditorType } from '../enums';
import { createWebEditorSchema, type CreateWebEditorFormValues } from '../schemas';
import type { WebEditorRES } from '../api';

// === Type definitions ===
type CreateMode = {
  mode: 'create';
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: CreateWebEditorFormValues) => void;
  initialData?: undefined;
};

type EditMode = {
  mode: 'edit';
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: CreateWebEditorFormValues) => void;
  initialData: WebEditorRES;
};

type WebEditorModalProps = CreateMode | EditMode;

// === Variables ===
const CREATE_DEFAULTS: CreateWebEditorFormValues = {
  name: '',
  type: WebEditorType.SINGLE_SIDED,
  width: 1,
  height: 1,
  unit: 'mm',
  dpi: DEFAULT_DPI,
  bleed: 0,
  safe_area: 0,
  status: WebEditorStatus.ACTIVE,
};

function blockSpecialNumericKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
}

// === Component ===
function WebEditorForm({
  title,
  defaultValues,
  mode,
  isPending,
  onSubmit,
  onClose,
}: {
  title: string;
  defaultValues: CreateWebEditorFormValues;
  mode: 'create' | 'edit';
  isPending: boolean;
  onSubmit: (v: CreateWebEditorFormValues) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const typeOptions = useMemo(() => WEB_EDITOR_TYPE_VALUES.map((type) => ({ value: type, label: t(WEB_EDITOR_TYPE_TRANSLATION_KEYS[type]) })), [t]);

  const statusOptions = useMemo(
    () => [
      { value: WebEditorStatus.ACTIVE, label: t('products.web_editors.enum.status.active') },
      { value: WebEditorStatus.HIDDEN, label: t('products.web_editors.enum.status.hidden') },
    ],
    [t],
  );

  const form = useForm<CreateWebEditorFormValues>({
    resolver: zodResolver(createWebEditorSchema) as Resolver<CreateWebEditorFormValues>,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, defaultValues.name]);

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <AppDialogModal
      isOpen
      setIsOpen={(open) => {
        if (!open && !isPending) onClose();
      }}
      title={title}
      footer={
        <>
          <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
            {tCommon('action.cancel')}
          </Button>
          <AppButton type='button' onClick={handleSubmit} isLoading={isPending}>
            {tCommon('action.save')}
          </AppButton>
        </>
      }
    >
      <form className='space-y-4 py-2' onSubmit={handleSubmit}>
        <AppInputFormField name='name' control={form.control} label={t('products.web_editors.fields.name')} disabled={isPending} required />
        {mode === 'create' && (
          <>
            <AppSelectFormField
              name='type'
              control={form.control}
              label={t('products.web_editors.fields.type')}
              options={typeOptions}
              disabled={isPending}
              required
            />
            <div className='grid grid-cols-3 gap-3'>
              <AppInputFormField
                name='dpi'
                control={form.control}
                type='number'
                label={t('products.web_editors.fields.dpi')}
                inputClassName='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                disabled={isPending}
                required
                onKeyDown={blockSpecialNumericKeys}
              />
              <AppInputFormField
                name='bleed'
                control={form.control}
                type='number'
                label={t('products.web_editors.fields.bleed')}
                suffix={<span className='text-xs'>mm</span>}
                inputClassName='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                disabled={isPending}
                onKeyDown={blockSpecialNumericKeys}
              />
              <AppInputFormField
                name='safe_area'
                control={form.control}
                type='number'
                label={t('products.web_editors.fields.safe_area')}
                suffix={<span className='text-xs'>mm</span>}
                inputClassName='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                disabled={isPending}
                onKeyDown={blockSpecialNumericKeys}
              />
            </div>
          </>
        )}
        <AppSelectFormField
          name='status'
          control={form.control}
          label={t('products.web_editors.fields.status')}
          options={statusOptions}
          disabled={isPending}
          required
        />
      </form>
    </AppDialogModal>
  );
}

export function WebEditorModal(props: WebEditorModalProps) {
  const { t } = useTranslation('page');

  if (!props.isOpen) return null;

  if (props.mode === 'edit') {
    const { initialData } = props;
    const defaultValues: CreateWebEditorFormValues = {
      name: initialData.name,
      type: initialData.type as WebEditorType,
      width: initialData.width,
      height: initialData.height,
      unit: 'mm',
      dpi: initialData.dpi,
      bleed: initialData.bleed,
      safe_area: initialData.safe_area,
      status: initialData.status.value,
    };

    return (
      <WebEditorForm
        title={t('products.web_editors.edit.title')}
        defaultValues={defaultValues}
        mode='edit'
        isPending={props.isPending}
        onSubmit={props.onSubmit}
        onClose={props.onClose}
      />
    );
  }

  return (
    <WebEditorForm
      title={t('products.web_editors.create.title')}
      defaultValues={CREATE_DEFAULTS}
      mode='create'
      isPending={props.isPending}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
    />
  );
}
