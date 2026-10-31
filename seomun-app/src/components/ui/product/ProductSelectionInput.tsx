'use client';

import type { Product } from '@/apis/product/product.response';
import { Button, Checkbox, Popover, Select } from '@/components/common';
import { FormInput } from '@/components/form';
import { Download, Eyes, HelpCircle, SelectionPlus, XIcon } from '@/icons';
import { cn, formatDate } from '@/lib/utils';
import { ProductOrderConfig, ProductSelectOption } from '@/types';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { SizeInputGroup } from './SizeInputGroup';
import { PostProcessingCode } from '@/enums/product';
import { PostProcessingDetailItem } from './PostProcessingDetailItem';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useSearchParams } from 'next/navigation';
import { useDesignDetailQuery } from '@/apis/design/design.query';
import { handleFileDownload } from '@/lib/utils';
import { DATE_FORMAT } from '@/constants/common';

export type BookPaperSection = {
  code: string;
  isOptional: boolean;
  paperTypeOptions: ProductSelectOption[];
  paperColorOptions: ProductSelectOption[];
  paperWeightOptions: ProductSelectOption[];
};

type BookPaperCountInputProps = {
  code: string;
  required?: boolean;
};

export type InnerPrintOptions = {
  sideOptions: ProductSelectOption[];
  frontOptions: ProductSelectOption[];
  backOptions: ProductSelectOption[];
};

type ProductSelectionInputProps = {
  sizeOptions: ProductSelectOption[];
  hasSubjectMatter: boolean;
  subjectMatterOptions: ProductSelectOption[];
  paperTypeOptions: ProductSelectOption[];
  paperColorOptions: ProductSelectOption[];
  paperWeightOptions: ProductSelectOption[];
  openViewPaperModal: () => void;
  isBookProduct: boolean;
  bookPaperSections: BookPaperSection[];
  innerPrintOptions?: InnerPrintOptions;
  printSideOptions: ProductSelectOption[];
  frontSideOptions: ProductSelectOption[];
  backSideOptions: ProductSelectOption[];
  quantityOptions: ProductSelectOption[];
  caseOptions: ProductSelectOption[];
  availablePostProcessingOptions: {
    label: string;
    value: PostProcessingCode;
  }[];
  postProcessingOptionMap: Record<PostProcessingCode, ProductSelectOption[]>;
  postProcessingPriceMap: Map<string, number>;
  productSlug?: string;
  allowDirectInput: boolean;
  allowWebEditor: boolean;
  infoIcon: Product['info_icon'];
  productName?: string;
};

type SelectionLabelProps = {
  label: string;
  infoContent: string | null;
  className: string;
};

const SelectionLabel = ({ label, infoContent, className }: SelectionLabelProps) => {
  const hasInfoContent = Boolean(infoContent?.trim());

  return (
    <label className={cn(className, 'flex items-center gap-2')}>
      {label}
      {hasInfoContent && (
        <Popover
          align='left'
          contentClassName='w-[220px] caption-12 whitespace-pre-line'
          trigger={<HelpCircle className='text-text-third size-5' />}>
          <p className='whitespace-pre-line'>{infoContent}</p>
        </Popover>
      )}
    </label>
  );
};

const BookPaperCountInput = ({ code, required = false }: BookPaperCountInputProps) => {
  const t = useTranslations('product');
  const { control } = useFormContext<ProductOrderConfig>();

  return (
    <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
      <SelectionLabel label={t('page_count')} infoContent={null} className='body-16 w-full md:mt-2 md:w-23.5' />
      <div>
        <FormInput
          name={`bookPaperCounts.${code}`}
          control={control}
          type='text'
          inputMode='numeric'
          min={required ? 1 : 0}
          required={required}
          showClear={false}
          numericOnly
          numericAsNumber
          className='h-11 md:w-28.5'
        />
      </div>
    </div>
  );
};

const BookPaperSectionInput = ({
  section,
  innerPrintOptions,
}: {
  section: BookPaperSection;
  innerPrintOptions?: InnerPrintOptions;
}) => {
  const t = useTranslations('product');
  const { control, setValue, unregister } = useFormContext<ProductOrderConfig>();
  const selectedOptionalPaperGroups = useWatch({ control, name: 'bookOptionalPaperGroups' }) || [];
  const fieldName = (field: 'type' | 'color' | 'weight') => `bookPaperSelections.${section.code}.${field}` as const;
  const isSelected = !section.isOptional || selectedOptionalPaperGroups.includes(section.code);
  const hasPaperOptions = section.paperTypeOptions.length > 0;
  const hasInnerPrintOptions = Boolean(
    innerPrintOptions &&
    (innerPrintOptions.sideOptions.length || innerPrintOptions.frontOptions.length || innerPrintOptions.backOptions.length),
  );

  return (
    <section className='space-y-4 border-t border-dashed border-gray-200 pt-5'>
      {section.isOptional ? (
        <Checkbox
          label={t(section.code)}
          checked={isSelected}
          onChange={(checked) => {
            setValue(
              'bookOptionalPaperGroups',
              checked
                ? [...selectedOptionalPaperGroups, section.code]
                : selectedOptionalPaperGroups.filter((code) => code !== section.code),
            );

            if (!checked) {
              unregister(`bookPaperSelections.${section.code}`);
            }
          }}
        />
      ) : (
        <h3 className='title-18'>{t(section.code)}</h3>
      )}

      {isSelected && hasPaperOptions && (
        <>
          <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
            <SelectionLabel label={t('paper')} infoContent={null} className='body-16 w-full md:mt-2 md:w-23.5' />
            <div className='grid w-full flex-1 grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-3'>
              <Controller
                name={fieldName('type')}
                control={control}
                render={({ field }) => (
                  <Select
                    options={section.paperTypeOptions}
                    value={field.value || ''}
                    onChange={field.onChange}
                    className='md:w-37'
                    selectClassname='h-11'
                  />
                )}
              />
              {section.paperColorOptions.length > 0 && (
                <Controller
                  name={fieldName('color')}
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={section.paperColorOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      className='md:w-37'
                      selectClassname='h-11'
                    />
                  )}
                />
              )}
              {section.paperWeightOptions.length > 0 && (
                <Controller
                  name={fieldName('weight')}
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={section.paperWeightOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      className='md:w-28.5'
                      selectClassname='h-11'
                    />
                  )}
                />
              )}
            </div>
          </div>

          {hasInnerPrintOptions && innerPrintOptions && (
            <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
              <SelectionLabel label={t('printed_color')} infoContent={null} className='body-16 w-full md:mt-2 md:w-23.5' />
              <div className='grid w-full flex-1 grid-cols-3 gap-2 md:block md:w-auto md:gap-3 md:space-y-2'>
                {innerPrintOptions.sideOptions.length > 0 && (
                  <div className='col-span-1 gap-3 md:flex md:flex-1'>
                    <Controller
                      name='bookPrintSelections.inner.side'
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={innerPrintOptions.sideOptions}
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='md:w-37'
                          selectClassname='h-11'
                        />
                      )}
                    />
                  </div>
                )}
                <div className='col-span-2 grid grid-cols-2 items-center gap-2 md:flex md:flex-1 md:gap-3'>
                  {innerPrintOptions.frontOptions.length > 0 && (
                    <Controller
                      name='bookPrintSelections.inner.front'
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={innerPrintOptions.frontOptions}
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='md:max-w-37'
                          selectClassname='h-11'
                        />
                      )}
                    />
                  )}
                  {innerPrintOptions.backOptions.length > 0 && (
                    <Controller
                      name='bookPrintSelections.inner.back'
                      control={control}
                      render={({ field }) => (
                        <Select
                          options={innerPrintOptions.backOptions}
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='md:max-w-37'
                          selectClassname='h-11'
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          <BookPaperCountInput code={section.code} required={section.code === 'inner_paper'} />
        </>
      )}
    </section>
  );
};

const ProductSelectionInput = ({
  sizeOptions,
  hasSubjectMatter,
  subjectMatterOptions,
  paperTypeOptions,
  paperColorOptions,
  paperWeightOptions,
  openViewPaperModal,
  isBookProduct,
  bookPaperSections,
  innerPrintOptions,
  printSideOptions,
  frontSideOptions,
  backSideOptions,
  quantityOptions,
  caseOptions,
  availablePostProcessingOptions,
  postProcessingOptionMap,
  postProcessingPriceMap,
  productSlug,
  allowDirectInput,
  allowWebEditor,
  infoIcon,
  productName,
}: ProductSelectionInputProps) => {
  const t = useTranslations('product');
  const router = useRouter();
  const searchParams = useSearchParams();
  const designGroupId = Number(searchParams.get('design_group_id'));
  const hasDesign = Number.isInteger(designGroupId) && designGroupId > 0;
  const { data: designDetail } = useDesignDetailQuery(hasDesign ? designGroupId : undefined);
  const { control, setValue } = useFormContext<ProductOrderConfig>();
  const [isDirectInputWatch, postProcessingWatch] = useWatch({
    control,
    name: ['isDirectInput', 'postProcessing'],
  });

  const onClickDirectInput = () => {
    if (!allowDirectInput) return;

    setValue('isDirectInput', !isDirectInputWatch);
  };

  const toDesignEditor = () => {
    if (!allowWebEditor) return;
    const designGroupId = searchParams.get('design_group_id');
    const editorUrl = ROUTES.WEB_EDITOR.DETAIL(productSlug);
    router.push(designGroupId ? `${editorUrl}&design_group_id=${encodeURIComponent(designGroupId)}` : editorUrl);
  };

  const handleDownloadCustom = () => {
    if (designDetail?.preview_pdf_url) {
      void handleFileDownload(
        designDetail.preview_pdf_url,
        `칼선_${productName || 'design'}_${formatDate(Date.now(), DATE_FORMAT.DATE_WITH_DOT)}.pdf`,
      );
    }
  };

  const canDownloadCustom = Boolean(designDetail?.preview_pdf_url);
  const hasPaperOptions = paperTypeOptions.length > 0;
  const hasPrintColorOptions = Boolean(printSideOptions.length || frontSideOptions.length || backSideOptions.length);
  const hasPostProcessingOptions = availablePostProcessingOptions.length > 0;

  return (
    <div className={cn('space-y-4', !hasPaperOptions && 'md:min-w-[640px]')}>
      {/*------- Standard Size Section */}
      <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
        <div className='flex w-full items-center justify-between md:w-auto'>
          <SelectionLabel label={t('standard')} infoContent={infoIcon.size} className='body-16 w-full md:mt-2 md:w-23.5' />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              type='button'
              className={cn(
                'body-14 h-7 shrink-0 px-3 py-1 md:hidden md:h-11 md:px-4 md:py-2',
                isDirectInputWatch && 'bg-primary',
              )}
              disabled={!allowDirectInput}
              onClick={onClickDirectInput}>
              {t('direct_input')}
            </Button>
            <Button
              variant='outline'
              type='button'
              leftIcon={<SelectionPlus className='size-4' />}
              className='body-14 h-7 px-2 md:hidden'
              disabled={!canDownloadCustom}
              onClick={handleDownloadCustom}>
              {t('download_custom')}
            </Button>
          </div>
        </div>
        <div className='flex w-full flex-1 flex-col gap-3'>
          <div className='flex gap-3 lg:max-xl:flex-col'>
            <Controller
              name='size'
              control={control}
              render={({ field }) => (
                <Select
                  options={sizeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  className='flex-1'
                  selectClassname='h-11'
                  disabled={isDirectInputWatch}
                />
              )}
            />
            <Button
              variant='outline'
              type='button'
              className={cn('body-14 hidden h-11 shrink-0 px-4 py-2 md:block', isDirectInputWatch && 'bg-primary')}
              disabled={!allowDirectInput}
              onClick={onClickDirectInput}>
              {t('direct_input')}
            </Button>
            <Button
              variant='outline'
              size='lg'
              leftIcon={<SelectionPlus className='size-5 md:size-6' />}
              className='body-16 hidden h-11 px-2 md:inline-flex md:w-43.25'
              disabled={!canDownloadCustom}
              onClick={handleDownloadCustom}>
              {t('download_custom')}
            </Button>
          </div>

          {/* Sizes Grid */}
          <div className='space-y-1.5'>
            <SizeInputGroup
              label={t('cutting_size')}
              control={control}
              nameWidth='cuttingSize.width'
              nameHeight='cuttingSize.height'
              editable={isDirectInputWatch}
            />
            <SizeInputGroup
              label={t('edit_size')}
              control={control}
              nameWidth='editingSize.width'
              nameHeight='editingSize.height'
            />
            <SizeInputGroup label={t('safe_size')} control={control} nameWidth='safeSize.width' nameHeight='safeSize.height' />
          </div>
        </div>
      </div>
      {hasSubjectMatter && subjectMatterOptions.length > 0 && (
        <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
          <SelectionLabel label={t('subject_matter')} infoContent={null} className='body-16 w-full md:mt-2 md:w-23.5' />
          <Controller
            name='subjectMatter'
            control={control}
            render={({ field }) => (
              <Select
                options={subjectMatterOptions}
                value={field.value}
                onChange={field.onChange}
                className='w-full md:w-37'
                selectClassname='h-11'
              />
            )}
          />
        </div>
      )}

      <div className='border-border-soft my-6 border-t border-dashed md:hidden'></div>
      {/*Standard Size Section ---------------------*/}

      {isBookProduct && hasPaperOptions && <h3 className='title-18 border-t border-dashed border-gray-200 pt-5'>{t('cover')}</h3>}

      {/*-------Paper Section */}
      {hasPaperOptions && (
        <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
          <div className='flex w-full items-center justify-between md:w-auto'>
            <SelectionLabel label={t('paper')} infoContent={infoIcon.paper} className='body-16 w-full md:mt-2 md:w-23.5' />
            <Button
              variant='outline'
              type='button'
              className='body-14 h-7 shrink-0 rounded-full px-3 py-1 md:hidden md:h-11 md:px-3 md:py-2'
              rightIcon={<Eyes className='size-5' />}
              onClick={openViewPaperModal}>
              {t('view_paper')}
            </Button>
          </div>
          <div className='grid w-full flex-1 grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-3'>
            <Controller
              name='paperType'
              control={control}
              render={({ field }) => (
                <Select
                  options={paperTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  className='md:w-37'
                  selectClassname='h-11'
                />
              )}
            />
            <Controller
              name='paperColor'
              control={control}
              render={({ field }) => (
                <Select
                  options={paperColorOptions}
                  value={field.value}
                  onChange={field.onChange}
                  className='md:w-37'
                  selectClassname='h-11'
                />
              )}
            />
            <Controller
              name='paperWeight'
              control={control}
              render={({ field }) => (
                <Select
                  options={paperWeightOptions}
                  value={field.value}
                  onChange={field.onChange}
                  className='md:w-28.5'
                  selectClassname='h-11'
                />
              )}
            />
            <Button
              variant='outline'
              type='button'
              className='body-14 hidden h-11 shrink-0 rounded-full px-3 py-2 md:flex'
              rightIcon={<Eyes className='size-5' />}
              onClick={openViewPaperModal}>
              {t('view_paper')}
            </Button>
          </div>
        </div>
      )}
      {/*Paper Section--------------- */}

      {/*-------Printed Color Section */}
      {hasPrintColorOptions && (
        <div className='flex flex-col items-start gap-1.5 md:flex-row md:gap-3'>
          <div className='flex w-full items-center justify-between md:w-auto'>
            <SelectionLabel
              label={t('printed_color')}
              infoContent={infoIcon.printed_color}
              className='body-16 w-full md:mt-2 md:w-23.5'
            />
            {/* <Button
              variant='outline'
              type='button'
              className='body-14 h-7 shrink-0 rounded-full px-3 py-1 md:hidden md:h-11 md:px-3 md:py-2'
              rightIcon={<Download className='size-5' />}>
              {t('download_special')}
            </Button> */}
          </div>
          <div className='grid w-full flex-1 grid-cols-3 gap-2 md:block md:w-auto md:gap-3 md:space-y-2'>
            {printSideOptions.length > 0 && (
              <div className='col-span-1 gap-3 md:flex md:flex-1'>
                <Controller
                  name='printColorTotal'
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={printSideOptions}
                      value={field.value}
                      onChange={field.onChange}
                      className='md:w-37'
                      selectClassname='h-11'
                    />
                  )}
                />
              </div>
            )}
            <div className='col-span-2 grid grid-cols-2 items-center gap-2 md:flex md:flex-1 md:gap-3'>
              {frontSideOptions.length > 0 && (
                <Controller
                  name='printColorFront'
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={frontSideOptions}
                      value={field.value}
                      onChange={field.onChange}
                      className='md:max-w-37'
                      selectClassname='h-11'
                    />
                  )}
                />
              )}
              {backSideOptions.length > 0 && (
                <Controller
                  name='printColorRear'
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={backSideOptions}
                      value={field.value}
                      onChange={field.onChange}
                      className='md:max-w-37'
                      selectClassname='h-11'
                    />
                  )}
                />
              )}
              {/* <Button
                variant='outline'
                type='button'
                onClick={openSpineCalculatorModal}
                className='body-14 text-text-brand border-text-brand hidden h-9 shrink-0 rounded-full px-4 py-2 md:flex'
                rightIcon={<Download className='size-5' />}>
                {t('download_special')}
              </Button> */}
            </div>
          </div>
        </div>
      )}
      {/*Printed Color Section----------------*/}

      {isBookProduct && hasPaperOptions && <BookPaperCountInput code='cover_paper' required />}

      {isBookProduct &&
        bookPaperSections.map((section) => (
          <BookPaperSectionInput
            key={section.code}
            section={section}
            innerPrintOptions={section.code === 'inner_paper' ? innerPrintOptions : undefined}
          />
        ))}

      {isBookProduct && <div className='border-border-soft border-t border-dashed' />}

      {/*-------Quantity/Count Section */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center'>
        <SelectionLabel label={t('quantity_count')} infoContent={infoIcon.quantity} className='body-16 w-full md:w-23.5' />
        <div className='flex flex-1 items-center gap-3'>
          <Controller
            name='quantity'
            control={control}
            render={({ field }) => (
              <Select
                options={quantityOptions}
                value={field.value.toString()}
                onChange={(val) => field.onChange(parseInt(val as string))}
                className='flex-1 md:max-w-33.25'
                selectClassname='h-11'
              />
            )}
          />
          <XIcon className='text-text-third size-5' />
          <Controller
            name='count'
            control={control}
            render={({ field }) => (
              <Select
                options={caseOptions}
                value={field.value.toString()}
                onChange={(val) => field.onChange(parseInt(val as string))}
                className='flex-1 md:max-w-33.25'
                selectClassname='h-11'
              />
            )}
          />
        </div>
      </div>
      {/*Quantity/Count Section-------------*/}

      {/*------Post-processing Section */}
      {hasPostProcessingOptions && (
        <div className='flex flex-col items-start gap-3 md:flex-row'>
          <SelectionLabel
            label={t('post_processing')}
            infoContent={infoIcon.post_processing}
            className='body-16 w-full md:w-23.5'
          />
          <div className='flex w-full flex-1 flex-col gap-4'>
            <div className='grid grid-cols-3 gap-y-4 xl:grid-cols-4'>
              {availablePostProcessingOptions.map((opt) => (
                <Controller
                  key={opt.value}
                  name='postProcessing'
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label={t(opt.label)}
                      checked={field.value.includes(opt.value as string)}
                      onChange={(checked) => {
                        if (checked) {
                          const defaultPostProcessingOption = postProcessingOptionMap[opt.value]?.[0]?.value;

                          field.onChange([...field.value, opt.value]);
                          if (defaultPostProcessingOption) {
                            setValue(`postProcessingConfigs.${opt.value}`, defaultPostProcessingOption);
                          }
                        } else {
                          field.onChange(field.value.filter((v) => v !== opt.value));
                          setValue(`postProcessingConfigs.${opt.value}`, '');
                        }
                      }}
                    />
                  )}
                />
              ))}
            </div>

            <div className='space-y-4'>
              {postProcessingWatch.map((type) => {
                const opt = availablePostProcessingOptions.find((o) => o.value === type);
                if (!opt) return null;
                const postProcessingDetailOptions = postProcessingOptionMap[type as keyof typeof postProcessingOptionMap] || [];
                return (
                  <Controller
                    key={type}
                    name={`postProcessingConfigs.${type}`}
                    control={control}
                    render={({ field }) => (
                      <PostProcessingDetailItem
                        type={type}
                        label={t(opt.label)}
                        value={field.value}
                        onChange={field.onChange}
                        options={postProcessingDetailOptions}
                        price={postProcessingPriceMap.get(type)}
                      />
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/*Post-processing Section---------------*/}

      <div className='h-px w-full border-t border-dashed border-gray-200' />

      {/*-----Design Section */}
      <div className='flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3'>
        <SelectionLabel label={t('design')} infoContent={infoIcon.design} className='body-16 w-24.5' />
        <div className='flex flex-1 gap-3'>
          <Button
            variant={hasDesign ? 'primary' : 'outline'}
            type='button'
            className={cn('body-14 h-10 px-4')}
            disabled={!allowWebEditor}
            onClick={toDesignEditor}>
            {t('web_editor')}
          </Button>
        </div>
      </div>
      {/* Design Section---------------*/}
    </div>
  );
};

export default ProductSelectionInput;
