'use client';

import { Button, Description, Modal, ModalHandle, Popover, Radio } from '@/components/common';
import { FormAddress, FormCellphone, FormCheckbox, FormInput, FormRadioGroup, FormSelect, FormTextarea } from '@/components/form';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { DELIVERY_MESSAGE_OPTIONS, isDeliveryMessagePreset, PHONE_OPTIONS } from '@/constants/common';
import { useMediaQuery } from '@/hooks';
import { HelpCircle } from '@/icons';
import { useRef } from 'react';
import { OrderCheckOutFormValues } from './schema';
import { OrderShippingMethod } from '@/enums/order';
import DirectShippingAddressModal from './DirectShippingAddressModal';
import ShippingAddressModal from './ShippingAddressModal';

const DIRECT_DELIVERY_NOTES = [
  '직배송은 자사의 운행 코스 및 배송 일정에 따라 진행되므로 제작 완료 후 즉시 배송되지 않을 수 있습니다.',
  '배송 일정은 도로 및 교통 상황에 따라 변동될 수 있으며 정확한 배송 시간 안내는 어려울 수 있습니다.',
  '백화점, 대형 쇼핑몰, 시장, 학교, 관공서 등 주·정차가 제한되는 지역은 1층 입구, 경비실 또는 물품 보관소가 있는 경우에 한해 배송이 가능합니다.',
  '아파트 배송은 경비실 수령만 가능하며 세대 문 앞 배송은 어렵습니다.',
  '배송 기사와 담당자 간 직접 전달(핸드투핸드)은 현장 상황에 따라 제한될 수 있습니다. 이 경우 1층 내 안전하게 보관 가능한 장소를 사전에 지정해 주셔야 합니다.',
  '엘리베이터가 없거나 배송 장소가 2층 이상인 경우 부득이하게 1층 입구, 경비실 또는 지정된 장소에 물품을 배치 후 안내 문자를 보내드릴 수 있습니다.',
  '직배송은 배송기사 1인 배송으로 진행되기 때문에 상차 및 하차 지원이 어려울 수 있습니다.',
  '배송 위치 확인을 위해 배송 위치 이미지는 처음 방문하는 사람이 확인해도 쉽게 찾을 수 있도록 제공해 주셔야 합니다.',
  '사전 안내 없이 배송 정보가 변경되어 발생한 오배송 또는 분실에 대해서는 자사에서 책임지지 않습니다.',
];

const DELIVERY_INCIDENT_NOTES = [
  '배송 장소의 접근 제한, 보관 장소 미비 등으로 인해 발생한 분실 또는 사고에 대해서는 재작업 및 손해배상이 어렵습니다.',
  '지정된 장소에 물품 보관 완료 후 발생한 분실 또는 훼손에 대해서는 자사가 책임지지 않습니다.',
  '배송 진행 중 사고가 발생한 경우 경위 및 과실 여부를 확인한 후 재작업 여부를 판단합니다.',
  '일부 상품이 누락된 경우 확인 후 직배송을 우선으로 추가 발송하며 상황에 따라 배송 방식이 변경될 수 있습니다.',
  '누락된 인쇄물은 확인 후 다음 날 직배송을 원칙으로 하며 퀵서비스 또는 택배 발송은 진행되지 않습니다.',
];

const ShippingSection = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { control, setValue, watch } = useFormContext<OrderCheckOutFormValues>();
  const t = useTranslations('');
  const changeShippingAddressModalRef = useRef<ModalHandle>(null);
  const directShippingAddressModalRef = useRef<ModalHandle>(null);
  const directShippingNoticeModalRef = useRef<ModalHandle>(null);
  const shippingMethod = watch('shippingInfo.shippingMethod');
  const isPickup = shippingMethod === OrderShippingMethod.PICKUP;
  const isDirect = shippingMethod === OrderShippingMethod.DIRECT;
  const deliveryMessage = watch('shippingInfo.message');

  const openChangeShippingAddressModal = () => {
    changeShippingAddressModalRef.current?.open();
  };

  const openDirectShippingAddressModal = () => {
    directShippingAddressModalRef.current?.open();
  };

  const openDirectShippingNoticeModal = () => {
    directShippingNoticeModalRef.current?.open();
  };

  return (
    <div>
      <Description
        mode='form'
        isCollapse={false}
        title={
          <div className='flex items-center gap-4'>
            <p>{t('order.shipping_address_info')}</p>
            {/* <FormCheckbox
              control={control}
              name='shippingInfo.saveForShippingAddress'
              label={t('order.same_orderer_info')}
              labelClassName='body-16'
              className='hidden md:inline-flex'
            /> */}
          </div>
        }
        extra={
          <div className='flex gap-2 md:gap-4'>
            <Button
              type='button'
              variant='outline'
              className='md:body-16 h-7 px-3 md:h-10 md:px-6'
              disabled={isPickup || isDirect}
              onClick={openChangeShippingAddressModal}>
              {t('order.shipping_address_list')}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='md:body-16 h-7 px-3 md:h-10 md:px-6'
              disabled={!isDirect}
              onClick={openDirectShippingAddressModal}>
              {t('order.direct_delivery_list')}
            </Button>
          </div>
        }>
        <div className='mt-3 space-y-4 md:max-w-125 md:space-y-6'>
          <FormRadioGroup
            control={control}
            name='shippingInfo.shippingMethod'
            label={t('common.shipping_method')}
            className='grid w-full grid-cols-2 items-center gap-y-3 md:flex md:gap-y-0'
            labelPlacement={isDesktop ? 'left' : 'top'}
            labelClassName='w-[126px] gap-1'>
            <Radio label={t('order.parcel_delivery')} value={OrderShippingMethod.COURIER} labelClassName='body-16' />
            <Radio label={t('order.quick_delivery')} value={OrderShippingMethod.QUICK} labelClassName='body-16' />
            <Radio label={t('order.pickup')} value={OrderShippingMethod.PICKUP} labelClassName='body-16' />
            <div className='relative flex items-center'>
              <Radio
                label={t('order.direct_delivery')}
                value={OrderShippingMethod.DIRECT}
                labelClassName='body-16'
                checked={isDirect}
                onChange={() =>
                  setValue('shippingInfo.shippingMethod', OrderShippingMethod.DIRECT, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
              <Popover
                className='-right-2 md:absolute md:-right-7'
                contentClassName='w-[180px]'
                trigger={<HelpCircle className='size-5 text-[#917965]' />}
                align={isDesktop ? 'left' : 'right'}>
                <p className='caption-12'>{t('order.direct_delivery_note')}</p>
              </Popover>
            </div>
          </FormRadioGroup>
          <FormInput
            control={control}
            name='shippingInfo.ordererName'
            placeholder={t('footer.preface_printing')}
            label={t('common.orderer')}
            labelPlacement={isDesktop ? 'left' : 'top'}
            labelClassName='w-[126px] gap-1'
            inputClassName='w-full md:w-[358px]'
            required
          />
          <FormCellphone
            labelPlacement={isDesktop ? 'left' : 'top'}
            control={control}
            namePrefix='shippingInfo.phoneHead'
            name1='shippingInfo.phoneBody'
            name2='shippingInfo.phoneTail'
            label={t('auth.cellphone')}
            phoneOptions={PHONE_OPTIONS}
            // placeholderSelect={t('auth.select')}
            isPrefixInput
            labelClassName='w-[126px] mb-0'
            inputClassName='w-full md:w-[358px]'
            verificationClassName='hidden'
            required
          />
          <FormAddress
            required={!isPickup}
            disabled={isPickup}
            control={control}
            nameZipCode='shippingInfo.postCode'
            nameAddress='shippingInfo.address'
            nameDetailedAddress='shippingInfo.addressDetail'
            label={t('auth.address')}
            zipCodePlaceholder={t('auth.zip_code_search')}
            addressPlaceholder={t('auth.address')}
            detailedAddressPlaceholder={t('auth.detailed_address')}
            searchLabel={t('auth.zip_code_search')}
            labelClassName='w-[126px] mb-0'
            inputClassName='w-full md:w-[358px]'
            labelPlacement={isDesktop ? 'left' : 'top'}
            helperText={t('order.address_note')}
            labelIcon={
              isDirect ? (
                <button
                  type='button'
                  aria-label='직배송 이용 시 유의사항'
                  className='inline-flex'
                  onClick={openDirectShippingNoticeModal}>
                  <HelpCircle className='size-5 text-[#917965]' />
                </button>
              ) : undefined
            }
          />
          <div className='space-y-1 md:space-y-3'>
            <div className='flex flex-col gap-1 md:flex-row md:items-center md:gap-12'>
              <label className='body-16 w-23.5'>{t('common.delivery_message')}</label>
              <FormSelect
                control={control}
                name='shippingInfo.message'
                placeholder='-'
                options={DELIVERY_MESSAGE_OPTIONS}
                className='flex-1'
                onChange={(value) => {
                  if (isDeliveryMessagePreset(value)) setValue('shippingInfo.detailNote', '', { shouldDirty: true });
                }}
              />
            </div>
            <div className='flex items-center gap-12'>
              <label className='body-16 hidden w-23.5 md:inline'></label>
              <FormTextarea
                control={control}
                name='shippingInfo.detailNote'
                placeholder={t('placeholder.direct_message')}
                containerClassName='flex-1'
                disabled={isDeliveryMessagePreset(deliveryMessage)}
              />
            </div>
          </div>

          <FormCheckbox
            control={control}
            name='shippingInfo.saveForShippingAddress'
            label={t('order.same_orderer_info')}
            labelClassName='body-16'
            className='md:hidden'
          />
        </div>
      </Description>
      <ShippingAddressModal ref={changeShippingAddressModalRef} />
      <DirectShippingAddressModal ref={directShippingAddressModalRef} />
      <Modal
        ref={directShippingNoticeModalRef}
        position={isDesktop ? 'center' : 'bottom'}
        size='md'
        title='직배송 이용 시 유의사항'
        titleClassName='title-18 md:title-20'
        bodyClassName='scrollbar-thin max-h-[60dvh] overflow-y-auto'
        footer={
          <div className='flex justify-center'>
            <Button type='button' variant='outline' onClick={() => directShippingNoticeModalRef.current?.close()}>
              {t('common.close')}
            </Button>
          </div>
        }>
        <div className='body-14 space-y-6 px-5 py-6 md:px-8'>
          <section className='space-y-2'>
            <h3 className='title-16'>직배송 이용 시 유의사항</h3>
            <div className='space-y-2'>
              {DIRECT_DELIVERY_NOTES.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </section>
          <section className='space-y-2'>
            <h3 className='title-16'>보관 및 배송 사고 안내</h3>
            <div className='space-y-2'>
              {DELIVERY_INCIDENT_NOTES.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
};

export default ShippingSection;
