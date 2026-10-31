'use client';

import type { Template } from '@/apis/product/product.response';
import { useProductBySlugQuery } from '@/apis/product/product.query';
import { Button, Input, Modal, ModalHandle, Select } from '@/components/common';
import { useWebEditorStore } from '@/hooks';
import { Search } from '@/icons';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { DesignTemplateType } from '@/enums/design';

interface TemplateTabProps {
  templates: Template[];
}

export const TemplateTab = ({ templates }: TemplateTabProps) => {
  const t = useTranslations('editor');
  const [searchValue, setSearchValue] = useState('');
  const [templateType, setTemplateType] = useState<DesignTemplateType | ''>('');
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const confirmModalRef = useRef<ModalHandle>(null);
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');
  const { data: productDetail } = useProductBySlugQuery(productSlug ?? undefined);

  const { setTemplate, selectObject, setIsGridView, selectedTemplateId } = useWebEditorStore();

  const translatedTemplateOptions = [
    { label: t('all'), value: '' },
    ...Object.values(DesignTemplateType).map((type) => ({
      label: t(
        {
          [DesignTemplateType.NO_FOLD]: 'no_fold',
          [DesignTemplateType.TWO_FOLD]: '2_fold',
          [DesignTemplateType.THREE_FOLD]: '3_fold',
          [DesignTemplateType.FOUR_FOLD]: '4_fold',
        }[type],
      ),
      value: type,
    })),
  ];

  const filteredTemplates = useMemo(() => {
    const searchTerm = searchValue.trim().toLowerCase();

    return templates.filter(
      (template) =>
        (!templateType || template.type === templateType) && (!searchTerm || template.name.toLowerCase().includes(searchTerm)),
    );
  }, [searchValue, templateType, templates]);

  const applyTemplate = (template: Template) => {
    setTemplate(template, undefined, { webEditor: productDetail?.web_editor ?? template.web_editor });
    selectObject(null);
    setIsGridView(false);
  };

  const handleSelectTemplate = (template: Template) => {
    if (selectedTemplateId) {
      setPendingTemplate(template);
      confirmModalRef.current?.open();
      return;
    }

    applyTemplate(template);
  };

  const handleConfirmTemplateChange = () => {
    if (pendingTemplate) applyTemplate(pendingTemplate);
    confirmModalRef.current?.close();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-3'>
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t('enter_search_term')}
          suffix={<Search className='size-4' />}
          showClear={false}
          className='h-10 w-full'
        />
        <Select
          options={translatedTemplateOptions}
          value={templateType}
          onChange={(value) => setTemplateType(value as DesignTemplateType | '')}
        />
      </div>
      <div className='space-y-3'>
        <h3 className='title-16'>{t('general_banner')}</h3>
        <div className='grid grid-cols-2 gap-2 md:max-lg:grid-cols-1'>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className='border-border-soft hover:border-border-brand flex aspect-square cursor-pointer flex-col items-center justify-center gap-2.5 border bg-gray-50 text-center transition-colors'>
              {template.front_preview_url && (
                <img src={template.front_preview_url} alt={template.name} className='h-20 w-full object-cover' />
              )}
              <span className='title-16'>{template.name}</span>
              <span className='body-16 text-text-secondary'>
                {template.size_option.cutting_width} x {template.size_option.cutting_height} mm
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        ref={confirmModalRef}
        size='sm'
        title={t('change_template_title')}
        description={t('change_template_description')}
        onClose={() => setPendingTemplate(null)}
        footer={
          <div className='flex gap-3'>
            <Button variant='outline' fullWidth onClick={() => confirmModalRef.current?.close()}>
              {t('cancel')}
            </Button>
            <Button variant='primary' fullWidth onClick={handleConfirmTemplateChange}>
              {t('change_template_confirm')}
            </Button>
          </div>
        }
      />
    </div>
  );
};
