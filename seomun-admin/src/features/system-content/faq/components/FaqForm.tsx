import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { FormMode } from '@/enums/form.enum';

import type { FaqRESP } from '../api/faq.response';
import { getFaqCategoryOptions, getFaqExposureStatusOptions } from '../constants';
import { createFaqFormSchema, getFaqFormDefaultValues, type FaqFormValues } from '../schemas';

// === Variables ===

function blockSpecialNumericKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
}

// === Types ===

type FaqFormProps = {
  mode: FormMode;
  faq?: FaqRESP;
  isPending: boolean;
  isDeleting?: boolean;
  onCancel: () => void;
  onSubmit: (values: FaqFormValues) => void;
  onDelete?: () => void;
};

// === Component ===

export function FaqForm({ mode, faq, isPending, isDeleting, onCancel, onSubmit, onDelete }: FaqFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tValidate } = useTranslation('validation');

  const isEditMode = mode === 'edit';

  const schema = useMemo(() => createFaqFormSchema(tValidate), [tValidate]);

  const { control, handleSubmit } = useForm<FaqFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getFaqFormDefaultValues(faq),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
      {/* Basic Information */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('faqs.form.section.basic_info')}</h2>
        </div>
        <Separator />
        <div className='grid gap-4 p-6 md:grid-cols-3'>
          <AppSelectFormField
            name='category'
            control={control}
            label={t('faqs.form.field.category')}
            placeholder={t('faqs.form.field.category_placeholder')}
            options={getFaqCategoryOptions(t)}
            clearable={false}
            required
          />
          <AppInputFormField
            name='sort_order'
            control={control}
            type='number'
            label={t('faqs.form.field.sort_order')}
            placeholder='0'
            onKeyDown={blockSpecialNumericKeys}
          />
          <AppSelectFormField
            name='posting_status'
            control={control}
            label={t('faqs.form.field.posting_status')}
            placeholder={t('faqs.form.field.posting_status_placeholder')}
            options={getFaqExposureStatusOptions(t)}
            clearable={false}
            required
          />
        </div>
      </section>

      {/* Detail section */}
      <section className='bg-card rounded-xl border'>
        <div className='px-6 py-4'>
          <h2 className='text-sm font-semibold'>{t('faqs.form.section.detail')}</h2>
        </div>
        <Separator />
        <div className='space-y-4 p-6'>
          <AppInputFormField
            name='question'
            control={control}
            label={t('faqs.form.field.question')}
            placeholder={t('faqs.form.field.question_placeholder')}
            required
          />
          <AppTextareaFormField
            name='answer'
            control={control}
            label={t('faqs.form.field.answer')}
            placeholder={t('faqs.form.field.answer_placeholder')}
            rows={8}
            required
          />
        </div>
      </section>

      <div className='flex items-center justify-between gap-2'>
        <div>
          {isEditMode && onDelete && (
            <AppButton variant='destructive' onClick={onDelete} disabled={isPending} isLoading={isDeleting}>
              {tCommon('action.delete')}
            </AppButton>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isDeleting}>
            {tCommon('action.cancel')}
          </Button>
          <Button type='submit' disabled={isPending || isDeleting}>
            {isPending ? tCommon('message.saving') : isEditMode ? tCommon('action.edit') : tCommon('action.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
