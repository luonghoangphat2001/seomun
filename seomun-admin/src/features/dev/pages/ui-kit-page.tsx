import { ArrowRight, AtSign, DollarSign, Mail, Plus, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { AppButton } from '@/components/shared/app-button';
import { AppCheckbox } from '@/components/shared/app-checkbox';
import { AppDatePicker } from '@/components/shared/app-date-picker';
import { AppInput } from '@/components/shared/app-input';
import { AppRadioGroup } from '@/components/shared/app-radio-group';
import { AppSelect } from '@/components/shared/app-select';
import { AppSwitch } from '@/components/shared/app-switch';
import { AppTextarea } from '@/components/shared/app-textarea';
import {
  AppCheckboxFormField,
  AppDatePickerFormField,
  AppFieldLabel,
  AppFieldMessage,
  AppFormField,
  AppInputFormField,
  AppRadioGroupFormField,
  AppSelectFormField,
  AppSwitchFormField,
  AppTextareaFormField,
} from '@/components/shared/form-fields';
import { PageContainer } from '@/components/shared/PageContainer';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const APP_SELECT_OPTIONS = [
  { value: 'business-card', label: 'Business card', description: 'Premium matte paper' },
  { value: 'catalog', label: 'Catalog', description: 'Saddle stitched booklet' },
  { value: 'poster', label: 'Poster', description: 'Large format print' },
  { value: 'sticker', label: 'Sticker', description: 'Die cut label' },
  { value: 'package', label: 'Package', description: 'Custom packaging' },
  { value: 'archived', label: 'Archived item', description: 'Disabled option', disabled: true },
];

const APP_RADIO_GROUP_OPTIONS = [
  { value: 'exposed', label: 'Exposed' },
  { value: 'hidden', label: 'Hidden', description: 'Only visible to administrators.' },
  { value: 'scheduled', label: 'Scheduled', description: 'Visible during the configured period.' },
];

const APP_RADIO_GROUP_OPTIONS_WITH_DISABLED = [
  ...APP_RADIO_GROUP_OPTIONS,
  { value: 'archived', label: 'Archived', description: 'Disabled option.', disabled: true },
];

type FormFieldDemoValues = {
  customerName: string;
  productCode: string;
  searchKeyword: string;
  unitPrice: number;
  requiredName: string;
  disabledValue: string;
  loadingValue: string;
  memo: string;
  requiredMemo: string;
  longDescription: string;
  disabledMemo: string;
  readOnlyMemo: string;
  productType: string;
  requiredProductType: string;
  searchableProductType: string;
  productTags: string[];
  disabledProductType: string;
  releaseDate: Date | null;
  requiredReleaseDate: Date | null;
  disabledReleaseDate: Date | null;
  limitedReleaseDate: Date | null;
  acceptTerms: boolean;
  requiredTerms: boolean;
  sendNotification: boolean;
  disabledCheckbox: boolean;
  enableSales: boolean;
  showPublicly: boolean;
  disabledSwitch: boolean;
  requiredSwitch: boolean;
  exposureStatus: string;
  requiredExposureStatus: string;
  horizontalExposureStatus: string;
  disabledExposureStatus: string;
};

function UiKitSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className='bg-card rounded-xl border shadow-sm'>
      <div className='space-y-1 px-6 py-4'>
        <h2 className='text-base font-semibold'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>

      <Separator />

      <div className='space-y-6 p-6'>{children}</div>
    </section>
  );
}

function UiKitExampleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-medium'>{title}</h3>
      <div className='flex flex-wrap items-center gap-3'>{children}</div>
    </div>
  );
}

function FormFieldExamples() {
  const { control, trigger, watch } = useForm<FormFieldDemoValues>({
    mode: 'onChange',
    defaultValues: {
      customerName: 'Seomun Printing',
      productCode: '',
      searchKeyword: 'catalog',
      unitPrice: 400,
      requiredName: '',
      disabledValue: 'Locked value',
      loadingValue: '',
      memo: 'Initial memo content',
      requiredMemo: '',
      longDescription: `Long controlled textarea content.
This field demonstrates maxRows.
Additional lines should scroll instead of stretching too far.
Line 4
Line 5
Line 6
Line 7`,
      disabledMemo: 'Disabled textarea value',
      readOnlyMemo: 'Read-only textarea value',
      productType: 'catalog',
      requiredProductType: '',
      searchableProductType: '',
      productTags: ['business-card', 'poster'],
      disabledProductType: 'sticker',
      releaseDate: new Date(2026, 4, 4),
      requiredReleaseDate: null,
      disabledReleaseDate: new Date(2026, 4, 12),
      limitedReleaseDate: null,
      acceptTerms: true,
      requiredTerms: false,
      sendNotification: true,
      disabledCheckbox: true,
      enableSales: true,
      showPublicly: false,
      disabledSwitch: true,
      requiredSwitch: false,
      exposureStatus: 'exposed',
      requiredExposureStatus: '',
      horizontalExposureStatus: 'scheduled',
      disabledExposureStatus: 'hidden',
    },
  });
  const unitPriceValue = watch('unitPrice');

  useEffect(() => {
    void trigger('requiredName');
    void trigger('requiredMemo');
    void trigger('requiredProductType');
    void trigger('requiredReleaseDate');
    void trigger('requiredTerms');
    void trigger('requiredSwitch');
    void trigger('requiredExposureStatus');
  }, [trigger]);

  return (
    <div className='space-y-6'>
      <UiKitExampleGroup title='Standalone AppFormField'>
        <div className='grid w-full gap-3 md:grid-cols-2'>
          <AppFormField label='Customer name' required description='This example does not use react-hook-form.'>
            {({ id, describedBy, isInvalid }) => (
              <AppInput id={id} aria-describedby={describedBy} isInvalid={isInvalid} placeholder='Enter customer name' clearable />
            )}
          </AppFormField>

          <AppFormField label='External error' labelClassName='uppercase' required error='Customer name is required.'>
            {({ id, describedBy, isInvalid }) => (
              <AppInput id={id} aria-describedby={describedBy} isInvalid={isInvalid} placeholder='Enter customer name' />
            )}
          </AppFormField>
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='Field Label and Message'>
        <div className='grid w-full gap-4 md:grid-cols-3'>
          <div className='space-y-1.5'>
            <AppFieldLabel label='Props label' required />
            <AppFieldMessage message='Message can be passed as a prop.' />
          </div>

          <div className='space-y-1.5'>
            <AppFieldLabel required>Children label</AppFieldLabel>
            <AppFieldMessage>
              Supports <span className='font-medium'>ReactNode</span> content.
            </AppFieldMessage>
            <AppFieldMessage variant='error' message='Error message also supports props.' />
          </div>

          <div className='flex items-start gap-2.5'>
            <AppCheckbox id='ui-kit-field-label-checkbox' aria-describedby='ui-kit-field-label-checkbox-description' />
            <div className='min-w-0 space-y-1'>
              <AppFieldLabel htmlFor='ui-kit-field-label-checkbox' label='Inline field label' required />
              <AppFieldMessage id='ui-kit-field-label-checkbox-description' message='Useful for checkbox, switch, upload, and custom controls.' />
            </div>
          </div>
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form'>
        <div className='grid w-full gap-3 md:grid-cols-2'>
          <AppInputFormField
            control={control}
            name='customerName'
            label='Customer name'
            required
            description='Bound with useController and editable through AppInput.'
            clearable
          />

          <AppInputFormField
            control={control}
            name='productCode'
            label='Product code'
            placeholder='SP-CATALOG-001'
            prefix={<AtSign />}
            suffix={<span className='text-xs'>SKU</span>}
          />

          <AppInputFormField control={control} name='searchKeyword' label='Search keyword' prefix={<Search />} clearable />

          <AppInputFormField
            control={control}
            name='unitPrice'
            type='number'
            label='Numeric field'
            prefix={<DollarSign />}
            suffix={<span className='text-xs'>KRW</span>}
          />

          <AppInputFormField
            control={control}
            name='requiredName'
            label='Required field'
            required
            placeholder='Type to clear the error'
            rules={{ required: 'Required field is required.' }}
          />

          <AppInputFormField control={control} name='disabledValue' label='Disabled field' disabled />

          <AppInputFormField control={control} name='loadingValue' label='Loading field' placeholder='Checking availability' isLoading />
        </div>

        <div className='text-muted-foreground bg-muted/30 rounded-lg border px-3 py-2 text-xs'>
          Numeric field value: {String(unitPriceValue)} ({typeof unitPriceValue})
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form Textarea'>
        <div className='grid w-full gap-3 md:grid-cols-2'>
          <AppTextareaFormField
            control={control}
            name='memo'
            label='Memo'
            description='Basic textarea field bound through useController.'
            placeholder='Enter internal memo'
            minRows={4}
          />

          <AppTextareaFormField
            control={control}
            name='requiredMemo'
            label='Required memo'
            required
            placeholder='Type to clear the error'
            minRows={4}
            rules={{ required: 'Required memo is required.' }}
          />

          <AppTextareaFormField
            control={control}
            name='longDescription'
            label='Description with maxRows'
            description='Keeps a predictable height and scrolls when content exceeds maxRows.'
            minRows={4}
            maxRows={5}
          />

          <div className='grid gap-3'>
            <AppTextareaFormField control={control} name='disabledMemo' label='Disabled textarea' disabled minRows={3} />
            <AppTextareaFormField control={control} name='readOnlyMemo' label='Read-only textarea' readOnly minRows={3} />
          </div>
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form Select'>
        <div className='grid w-full gap-3 md:grid-cols-2'>
          <AppSelectFormField
            control={control}
            name='productType'
            label='Product type'
            description='Single select bound through useController.'
            options={APP_SELECT_OPTIONS}
            clearable
          />

          <AppSelectFormField
            control={control}
            name='requiredProductType'
            label='Required product type'
            required
            options={APP_SELECT_OPTIONS}
            placeholder='Select product type'
            rules={{ required: 'Product type is required.' }}
          />

          <AppSelectFormField
            control={control}
            name='searchableProductType'
            label='Searchable product type'
            description='Searchable and clearable select keeps the same form-field shell.'
            options={APP_SELECT_OPTIONS}
            placeholder='Search product type'
            searchable
            clearable
          />

          <AppSelectFormField
            control={control}
            name='productTags'
            mode='multiple'
            label='Product tags'
            description='Multiple select stores a string array.'
            options={APP_SELECT_OPTIONS}
            searchable
            clearable
            rules={{
              validate: (value) => (Array.isArray(value) && value.length > 0) || 'Select at least one product tag.',
            }}
          />

          <AppSelectFormField control={control} name='disabledProductType' label='Disabled select' options={APP_SELECT_OPTIONS} disabled />
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form Date Picker'>
        <div className='grid w-full gap-3 md:grid-cols-2'>
          <AppDatePickerFormField
            control={control}
            name='releaseDate'
            label='Release date'
            description='Date picker field bound through useController.'
            clearable
          />

          <AppDatePickerFormField
            control={control}
            name='requiredReleaseDate'
            label='Required release date'
            required
            placeholder='Select release date'
            rules={{ required: 'Release date is required.' }}
          />

          <AppDatePickerFormField control={control} name='disabledReleaseDate' label='Disabled release date' disabled />

          <AppDatePickerFormField
            control={control}
            name='limitedReleaseDate'
            label='Limited release date'
            description='Only dates in May 2026 are enabled.'
            clearable
            minDate={new Date(2026, 4, 1)}
            maxDate={new Date(2026, 4, 31)}
          />
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form Checkbox and Switch'>
        <div className='grid w-full gap-4 md:grid-cols-2'>
          <AppCheckboxFormField
            control={control}
            name='acceptTerms'
            label='Accept terms'
            description='Checkbox field uses inline label and message layout.'
          />

          <AppCheckboxFormField
            control={control}
            name='requiredTerms'
            label='Required consent'
            required
            description='Toggle this checkbox to clear the validation error.'
            rules={{
              validate: (value) => value === true || 'Required consent is required.',
            }}
          />

          <AppCheckboxFormField
            control={control}
            name='sendNotification'
            label='Send notification'
            description='Boolean values are normalized with field.value === true.'
          />

          <AppCheckboxFormField
            control={control}
            name='disabledCheckbox'
            label='Disabled checkbox'
            description='Disabled field keeps the same inline layout.'
            disabled
          />

          <AppSwitchFormField
            control={control}
            name='enableSales'
            label='Enable sales'
            description='Switch field mirrors checkbox form-field behavior.'
          />

          <AppSwitchFormField
            control={control}
            name='showPublicly'
            label='Show publicly'
            description='Use for binary settings where a switch fits the interaction.'
          />

          <AppSwitchFormField
            control={control}
            name='disabledSwitch'
            label='Disabled switch'
            description='Disabled state is passed into the raw switch.'
            disabled
          />

          <AppSwitchFormField
            control={control}
            name='requiredSwitch'
            label='Required switch'
            required
            description='Validation can enforce an enabled state when needed.'
            rules={{
              validate: (value) => value === true || 'Required switch must be enabled.',
            }}
          />
        </div>
      </UiKitExampleGroup>

      <UiKitExampleGroup title='React Hook Form Radio Group'>
        <div className='grid w-full gap-4 md:grid-cols-2'>
          <AppRadioGroupFormField
            control={control}
            name='exposureStatus'
            label='Exposure status'
            description='Radio group field owns group label and messages; options own their labels.'
            options={APP_RADIO_GROUP_OPTIONS}
          />

          <AppRadioGroupFormField
            control={control}
            name='requiredExposureStatus'
            label='Required exposure status'
            required
            options={APP_RADIO_GROUP_OPTIONS}
            rules={{ required: 'Exposure status is required.' }}
          />

          <AppRadioGroupFormField
            control={control}
            name='horizontalExposureStatus'
            label='Horizontal exposure status'
            description='Horizontal layout passes through to the raw radio group.'
            orientation='horizontal'
            options={APP_RADIO_GROUP_OPTIONS}
          />

          <AppRadioGroupFormField
            control={control}
            name='disabledExposureStatus'
            label='Disabled exposure status'
            description='Disabled state disables every option.'
            options={APP_RADIO_GROUP_OPTIONS_WITH_DISABLED}
            disabled
          />
        </div>
      </UiKitExampleGroup>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppInputFormField
  control={control}
  name='customerName'
  label='Customer name'
  required
  rules={{ required: 'Customer name is required.' }}
  clearable
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppSelectFormField
  control={control}
  name='productType'
  label='Product type'
  options={productTypeOptions}
  searchable
  clearable
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppDatePickerFormField
  control={control}
  name='releaseDate'
  label='Release date'
  description='Visible to customers from this date.'
  clearable
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppCheckboxFormField
  control={control}
  name='acceptTerms'
  label='Accept terms'
  description='Required before submitting.'
  rules={{ validate: (value) => value === true || 'Accept terms is required.' }}
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppSwitchFormField
  control={control}
  name='showPublicly'
  label='Show publicly'
  description='Expose this item to customers.'
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppRadioGroupFormField
  control={control}
  name='exposureStatus'
  label='Exposure status'
  options={exposureStatusOptions}
  rules={{ required: 'Exposure status is required.' }}
/>`}
        </pre>
      </div>

      <div className='bg-muted/40 rounded-lg border p-4'>
        <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
          {`<AppTextareaFormField
  control={control}
  name='memo'
  label='Memo'
  description='Internal note for administrators.'
  minRows={4}
  maxRows={8}
/>`}
        </pre>
      </div>
    </div>
  );
}

export const UiKitPage = () => {
  return (
    <PageContainer>
      <div className='space-y-1'>
        <h1 className='text-xl font-semibold'>UI Kit</h1>
        <p className='text-muted-foreground text-sm'>Reusable admin components from the shared app foundation layer.</p>
      </div>

      <Separator />

      <UiKitSection title='AppButton' description='Standard action button with variants, sizes, icons, disabled state, and loading state.'>
        <UiKitExampleGroup title='Variants'>
          <AppButton>Default</AppButton>
          <AppButton variant='secondary'>Secondary</AppButton>
          <AppButton variant='outline'>Outline</AppButton>
          <AppButton variant='ghost'>Ghost</AppButton>
          <AppButton variant='destructive'>Delete</AppButton>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <AppButton size='xs'>Extra Small</AppButton>
          <AppButton size='sm'>Small</AppButton>
          <AppButton>Default</AppButton>
          <AppButton size='lg'>Large</AppButton>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='With Icons'>
          <AppButton leftIcon={<Plus />}>Create</AppButton>
          <AppButton variant='outline' leftIcon={<Save />}>
            Save Draft
          </AppButton>
          <AppButton variant='secondary' rightIcon={<ArrowRight />}>
            Continue
          </AppButton>
          <AppButton variant='destructive' leftIcon={<Trash2 />}>
            Delete
          </AppButton>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Icon Only'>
          <AppButton size='icon' aria-label='Create'>
            <Plus />
          </AppButton>
          <AppButton size='icon' variant='outline' aria-label='Refresh'>
            <RefreshCw />
          </AppButton>
          <AppButton size='icon' variant='destructive' aria-label='Delete'>
            <Trash2 />
          </AppButton>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <AppButton disabled>Disabled</AppButton>
          <AppButton isLoading>Loading</AppButton>
          <AppButton isLoading loadingText='Saving...'>
            Save
          </AppButton>
          <AppButton isLoading variant='outline' loadingText='Refreshing...'>
            Refresh
          </AppButton>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppButton leftIcon={<Plus />} isLoading={isPending} loadingText='Saving...'>
  Create
</AppButton>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppInput'
        description='Standard text input with sizes, prefix/suffix content, loading indicator, clear action, and validation state.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppInput placeholder='Default input' />
            <AppInput defaultValue='Read only value' readOnly />
            <AppInput placeholder='Disabled input' disabled />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppInput size='sm' placeholder='Small input' />
            <AppInput size='md' placeholder='Medium input' />
            <AppInput size='lg' placeholder='Large input' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Prefix and Suffix'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppInput placeholder='Search keyword' prefix={<Search />} clearable />
            <AppInput placeholder='Email address' prefix={<Mail />} suffix={<span className='text-xs'>optional</span>} />
            <AppInput placeholder='Unit price' prefix={<DollarSign />} suffix={<span className='text-xs'>USD</span>} />
            <AppInput type='number' defaultValue='400' prefix={<DollarSign />} suffix={<span className='text-xs'>KRW</span>} />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppInput defaultValue='Clearable value' clearable />
            <AppInput placeholder='Loading input' prefix={<Search />} isLoading />
            <AppInput placeholder='Invalid input' prefix={<AtSign />} isInvalid defaultValue='invalid-email' />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppInput
  placeholder='Search keyword'
  prefix={<Search />}
  clearable
  onEnter={(event) => submitSearch(event.currentTarget.value)}
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection title='Form Fields' description='Composable field wrapper and React Hook Form bindings built on top of raw app controls.'>
        <FormFieldExamples />
      </UiKitSection>

      <UiKitSection
        title='AppTextarea'
        description='Standard multiline text control with sizes, resize behavior, validation state, and controlled value convenience.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-2'>
            <AppTextarea placeholder='Enter description' />
            <AppTextarea defaultValue='Read only multiline value' readOnly />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppTextarea size='sm' placeholder='Small textarea' />
            <AppTextarea size='md' placeholder='Medium textarea' />
            <AppTextarea size='lg' placeholder='Large textarea' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppTextarea placeholder='Disabled textarea' disabled />
            <AppTextarea placeholder='Invalid textarea' isInvalid defaultValue='Missing required content' />
            <AppTextarea placeholder='Fixed textarea' resize='none' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Rows and Scroll'>
          <div className='grid w-full gap-3 md:grid-cols-2'>
            <AppTextarea minRows={6} placeholder='Minimum 6 rows' />
            <AppTextarea
              minRows={4}
              maxRows={6}
              defaultValue={`Long content with maxRows enabled.
This textarea keeps a predictable maximum height.
Additional content scrolls vertically instead of stretching the form section.
Line 4
Line 5
Line 6
Line 7
Line 8`}
            />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppTextarea
  minRows={6}
  maxRows={12}
  placeholder='Enter notice content'
  onValueChange={(value) => setContent(value)}
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppSelect'
        description='Standard combobox select with single and multiple selection, search, clear action, sizes, disabled state, and validation state.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppSelect options={APP_SELECT_OPTIONS} placeholder='Select product type' />
            <AppSelect options={APP_SELECT_OPTIONS} defaultValue='catalog' clearable />
            <AppSelect options={APP_SELECT_OPTIONS} defaultValue='poster' disabled />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Search and Multiple'>
          <div className='grid w-full gap-3 md:grid-cols-2'>
            <AppSelect options={APP_SELECT_OPTIONS} placeholder='Search product type' searchable clearable />
            <AppSelect mode='multiple' options={APP_SELECT_OPTIONS} defaultValue={['business-card', 'poster', 'sticker']} searchable clearable />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppSelect size='sm' options={APP_SELECT_OPTIONS} placeholder='Small select' />
            <AppSelect size='md' options={APP_SELECT_OPTIONS} placeholder='Medium select' />
            <AppSelect size='lg' options={APP_SELECT_OPTIONS} placeholder='Large select' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppSelect options={APP_SELECT_OPTIONS} placeholder='Invalid select' isInvalid />
            <AppSelect mode='multiple' options={APP_SELECT_OPTIONS} placeholder='Disabled multiple' disabled />
            <AppSelect options={[]} placeholder='Empty options' searchable emptyText='No product types found.' />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppSelect
  options={productTypeOptions}
  placeholder='Select product type'
  searchable
  clearable
  onValueChange={(value) => setProductType(value)}
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppDatePicker'
        description='Standard date picker with calendar popover, clear action, sizes, disabled/loading state, and validation state.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppDatePicker placeholder='Select release date' />
            <AppDatePicker defaultValue={new Date(2026, 4, 4)} clearable />
            <AppDatePicker defaultValue={new Date(2026, 4, 12)} disabled />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppDatePicker size='sm' placeholder='Small date picker' />
            <AppDatePicker size='md' placeholder='Medium date picker' />
            <AppDatePicker size='lg' placeholder='Large date picker' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppDatePicker placeholder='Invalid date picker' isInvalid />
            <AppDatePicker placeholder='Loading date picker' loading />
            <AppDatePicker placeholder='Limited to May 2026' minDate={new Date(2026, 4, 1)} maxDate={new Date(2026, 4, 31)} />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppDatePicker
  value={releaseDate}
  onValueChange={setReleaseDate}
  minDate={new Date(2026, 4, 1)}
  maxDate={new Date(2026, 4, 31)}
  clearable
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppCheckbox'
        description='Standard raw checkbox control with sizes, disabled state, validation state, and boolean value callback.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppCheckbox aria-label='Unchecked checkbox' />
            <AppCheckbox aria-label='Checked checkbox' defaultChecked />
            <AppCheckbox aria-label='Invalid checkbox' isInvalid />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Labeled'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-accept-terms' />
              <Label htmlFor='ui-kit-accept-terms'>Accept terms</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-pinned-notice' defaultChecked />
              <Label htmlFor='ui-kit-pinned-notice'>Pinned notice</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-invalid-checkbox' isInvalid />
              <Label htmlFor='ui-kit-invalid-checkbox'>Invalid checkbox</Label>
            </div>
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='With Description'>
          <div className='grid w-full gap-4 md:grid-cols-2'>
            <div className='flex items-start gap-2.5'>
              <AppCheckbox id='ui-kit-expose-main' aria-describedby='ui-kit-expose-main-description' />
              <div className='min-w-0 space-y-1'>
                <Label htmlFor='ui-kit-expose-main'>Expose on main page</Label>
                <p id='ui-kit-expose-main-description' className='text-muted-foreground text-xs leading-5'>
                  Show this content on the customer-facing main page.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2.5'>
              <AppCheckbox id='ui-kit-send-notification' aria-describedby='ui-kit-send-notification-description' defaultChecked />
              <div className='min-w-0 space-y-1'>
                <Label htmlFor='ui-kit-send-notification'>Send notification</Label>
                <p id='ui-kit-send-notification-description' className='text-muted-foreground text-xs leading-5'>
                  Notify administrators when this setting changes.
                </p>
              </div>
            </div>
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-checkbox-sm' size='sm' />
              <Label htmlFor='ui-kit-checkbox-sm' className='text-[0.8rem]'>
                Small checkbox
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-checkbox-md' size='md' />
              <Label htmlFor='ui-kit-checkbox-md'>Medium checkbox</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppCheckbox id='ui-kit-checkbox-lg' size='lg' />
              <Label htmlFor='ui-kit-checkbox-lg'>Large checkbox</Label>
            </div>
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppCheckbox aria-label='Disabled checkbox' disabled />
            <AppCheckbox aria-label='Disabled checked checkbox' disabled defaultChecked />
            <AppCheckbox aria-label='Invalid checked checkbox' isInvalid defaultChecked />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppCheckbox
  id='expose-on-main'
  checked={isExposed}
  onValueChange={setIsExposed}
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppSwitch'
        description='Standard raw switch control with sizes, disabled state, validation state, and boolean value callback.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppSwitch aria-label='Unchecked switch' />
            <AppSwitch aria-label='Checked switch' defaultChecked />
            <AppSwitch aria-label='Invalid switch' isInvalid />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Labeled'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-enable-sales' />
              <Label htmlFor='ui-kit-enable-sales'>Enable sales</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-show-public' defaultChecked />
              <Label htmlFor='ui-kit-show-public'>Show publicly</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-switch-invalid' isInvalid />
              <Label htmlFor='ui-kit-switch-invalid'>Invalid switch</Label>
            </div>
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-switch-sm' size='sm' />
              <Label htmlFor='ui-kit-switch-sm' className='text-[0.8rem]'>
                Small switch
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-switch-md' size='md' />
              <Label htmlFor='ui-kit-switch-md'>Medium switch</Label>
            </div>

            <div className='flex items-center gap-2'>
              <AppSwitch id='ui-kit-switch-lg' size='lg' />
              <Label htmlFor='ui-kit-switch-lg'>Large switch</Label>
            </div>
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-3 md:grid-cols-3'>
            <AppSwitch aria-label='Disabled switch' disabled />
            <AppSwitch aria-label='Disabled checked switch' disabled defaultChecked />
            <AppSwitch aria-label='Invalid checked switch' isInvalid defaultChecked />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppSwitch
  id='show-publicly'
  checked={isPublic}
  onValueChange={setIsPublic}
/>`}
          </pre>
        </div>
      </UiKitSection>

      <UiKitSection
        title='AppRadioGroup'
        description='Standard radio option group with vertical and horizontal layouts, descriptions, sizes, and invalid state.'
      >
        <UiKitExampleGroup title='Basic'>
          <div className='grid w-full gap-4 md:grid-cols-2'>
            <AppRadioGroup options={APP_RADIO_GROUP_OPTIONS} defaultValue='exposed' />
            <AppRadioGroup options={APP_RADIO_GROUP_OPTIONS_WITH_DISABLED} defaultValue='hidden' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Horizontal'>
          <AppRadioGroup orientation='horizontal' options={APP_RADIO_GROUP_OPTIONS} defaultValue='scheduled' />
        </UiKitExampleGroup>

        <UiKitExampleGroup title='Sizes'>
          <div className='grid w-full gap-4 md:grid-cols-3'>
            <AppRadioGroup size='sm' options={APP_RADIO_GROUP_OPTIONS} defaultValue='exposed' />
            <AppRadioGroup size='md' options={APP_RADIO_GROUP_OPTIONS} defaultValue='hidden' />
            <AppRadioGroup size='lg' options={APP_RADIO_GROUP_OPTIONS} defaultValue='scheduled' />
          </div>
        </UiKitExampleGroup>

        <UiKitExampleGroup title='States'>
          <div className='grid w-full gap-4 md:grid-cols-3'>
            <AppRadioGroup options={APP_RADIO_GROUP_OPTIONS} defaultValue='exposed' disabled />
            <AppRadioGroup options={APP_RADIO_GROUP_OPTIONS} defaultValue='hidden' isInvalid />
            <AppRadioGroup options={[]} />
          </div>
        </UiKitExampleGroup>

        <div className='bg-muted/40 rounded-lg border p-4'>
          <pre className='text-muted-foreground overflow-x-auto text-xs leading-5'>
            {`<AppRadioGroup
  options={exposureStatusOptions}
  value={exposureStatus}
  onValueChange={setExposureStatus}
/>`}
          </pre>
        </div>
      </UiKitSection>
    </PageContainer>
  );
};
