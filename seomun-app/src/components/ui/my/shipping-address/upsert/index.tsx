'use client';

import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import PageTitle from '../../components/PageTitle';
import { ROUTES } from '@/routes';
import { Button } from '@/components/common';
import { FormProvider, useForm } from 'react-hook-form';
import { shippingAddressDefaultValues, ShippingAddressFormValues, shippingAddressSchema } from '../../order/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMediaQuery } from '@/hooks';
import { FormAddress, FormCellphone, FormCheckbox, FormDeliveryMessage, FormInput } from '@/components/form';
import { DELIVERY_MESSAGE_OPTIONS, PHONE_OPTIONS } from '@/constants/common';
import {
  useShippingAddressCreateMutation,
  useShippingAddressDetailQuery,
  useShippingAddressUpdateMutation,
} from '@/apis/my/shipping-address/shipping-address.query';
import {
  transformShippingAddressFormValuesToCreateREQ,
  transformShippingAddressFormValuesToUpdateREQ,
  transformShippingAddressRESPToFormValues,
} from '@/apis/my/shipping-address/shipping-address.service';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const MyShippingAddressUpsert = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shippingAddressId } = useParams();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const labelPlacement = isDesktop ? 'left' : 'top';

  //hook form
  const form = useForm<ShippingAddressFormValues>({
    mode: 'all',
    defaultValues: shippingAddressDefaultValues,
    resolver: zodResolver(shippingAddressSchema(t)),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  //api create
  const { mutate: mutateCreate, isPending: isPendingCreate } = useShippingAddressCreateMutation();

  //api update
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useShippingAddressUpdateMutation();

  //api detail
  const { data: dataDetail } = useShippingAddressDetailQuery(Number(shippingAddressId) || undefined);

  const onCreate = handleSubmit((input: ShippingAddressFormValues) => {
    if (isPendingCreate) return;
    const body = transformShippingAddressFormValuesToCreateREQ(input);
    mutateCreate(body, {
      onSuccess: () => {
        toast.success(t('common.success_create'));
        router.push(ROUTES.MY_PAGE.SHIPPING_ADDRESS);
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_create'));
      },
    });
  });

  const onEdit = handleSubmit((input: ShippingAddressFormValues) => {
    if (!shippingAddressId || isPendingUpdate) return;
    const body = transformShippingAddressFormValuesToUpdateREQ(input, Number(shippingAddressId));
    mutateUpdate(body, {
      onSuccess: () => {
        toast.success(t('common.success_update'));
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_update'));
      },
    });
  });

  const backToList = () => {
    router.push(ROUTES.MY_PAGE.SHIPPING_ADDRESS);
  };

  useEffect(() => {
    if (shippingAddressId && dataDetail) {
      reset(transformShippingAddressRESPToFormValues(dataDetail.data.address));
      return;
    }
    reset(shippingAddressDefaultValues);
  }, [shippingAddressId, dataDetail, reset]);

  return (
    <main className='product-order-form-mobile relative space-y-3 md:space-y-6'>
      <PageTitle
        title={`${t('my.delivery_address')} ${shippingAddressId ? t('common.edit') : t('common.add')}`}
        extra={
          <div className='mobile-button flex gap-3 md:gap-4'>
            <Button variant='outline' className='body-16 h-12 flex-1 md:h-10 md:w-auto' onClick={backToList}>
              {t('common.cancel')}
            </Button>
            <Button
              className='body-16 h-12 flex-1 md:h-10 md:w-auto'
              onClick={shippingAddressId ? onEdit : onCreate}
              loading={isPendingCreate || isPendingUpdate}
              disabled={Boolean(shippingAddressId && !isDirty)}>
              {t('my.edit_my_info')}
            </Button>
          </div>
        }
      />
      <FormProvider {...form}>
        <div className='flex flex-col-reverse gap-3 md:flex-col md:gap-6'>
          <section className='w-full space-y-4 md:max-w-125 md:space-y-6'>
            <FormInput
              control={control}
              name='ordererName'
              placeholder={t('footer.preface_printing')}
              label={t('common.orderer')}
              labelPlacement={labelPlacement}
              containerClassName='flex-1'
              labelClassName='w-[126px] gap-1'
              inputClassName='w-full md:max-w-[358px]'
              required
            />
            <FormAddress
              required
              control={control}
              nameZipCode='postCode'
              nameAddress='address'
              nameDetailedAddress='addressDetail'
              label={t('auth.address')}
              zipCodePlaceholder={t('auth.zip_code_search')}
              addressPlaceholder={t('auth.address')}
              detailedAddressPlaceholder={t('auth.detailed_address')}
              searchLabel={t('auth.zip_code_search')}
              labelClassName='w-full md:w-[126px] shrink'
              inputClassName='w-full md:max-w-[358px]'
              buttonClassName='w-[174px]! px-0!'
              labelPlacement={labelPlacement}
            />
            <FormCellphone
              required
              labelPlacement={labelPlacement}
              control={control}
              namePrefix='phoneHead'
              name1='phoneBody'
              name2='phoneTail'
              label={t('auth.phone_number')}
              phoneOptions={PHONE_OPTIONS}
              // placeholderSelect={t('auth.select')}
              isPrefixInput
              labelClassName='w-full md:w-[126px] shrink'
              inputClassName='w-full md:max-w-[358px]'
              verificationClassName='hidden'
            />
            <FormDeliveryMessage
              labelPlacement={labelPlacement}
              control={control}
              messageOptions={DELIVERY_MESSAGE_OPTIONS}
              nameMessageOption='messageOption'
              nameMessageNote='messageNote'
              label={t('common.delivery_message')}
              messageOptionPlaceholder={t('common.select')}
              messageNotePlaceholder={t('placeholder.direct_message')}
              labelClassName='w-full md:w-[126px] shrink'
              inputClassName='w-full md:max-w-[358px]'
            />
          </section>
          <div className='py-3'>
            {/* <Controller
              control={control}
              name='isDefault'
              render={({ field }) => (
                <Radio
                  label={t('common.set_default_address')}
                  value={true}
                  checked={field.value === true}
                  onChange={field.onChange}
                  allowUncheck
                  labelClassName='body-18 ml-1'
                />
              )}
            /> */}
            <FormCheckbox
              control={control}
              name='isDefault'
              label={t('common.set_default_address')}
              labelClassName='body-18 ml-2'
            />
          </div>
        </div>
      </FormProvider>
    </main>
  );
};

export default MyShippingAddressUpsert;
