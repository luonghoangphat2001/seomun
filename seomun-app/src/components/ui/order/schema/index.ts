import { OrderShippingMethod } from '@/enums/order';
import { TFunction } from '@/types';
import { z } from 'zod';

const ordererInfoSchema = (t: TFunction) =>
  z.object({
    isSaveOrderInfo: z.boolean().optional(),
    ordererName: z.string().min(1, t('validation.required', { field: t('common.orderer') })),
    phoneHead: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
    phoneBody: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
    phoneTail: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
  });

const shippingInfoSchema = (t: TFunction) =>
  z.object({
    shippingMethod: z.enum(OrderShippingMethod, {
      message: t('validation.select_required', { field: t('common.shipping_method') }),
    }),
    saveForShippingAddress: z.boolean().optional(),
    ordererName: z.string().min(1, t('validation.required', { field: t('common.orderer') })),
    phoneHead: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
    phoneBody: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
    phoneTail: z.string().min(1, t('validation.required', { field: t('auth.cellphone') })),
    postCode: z.string().optional(),
    address: z.string().optional(),
    addressDetail: z.string().optional(),
    message: z.string().optional(),
    detailNote: z.string().optional(),
  });

const senderInfoSchema = (_t: TFunction) =>
  z.object({
    businessName: z.string().optional(),
    phoneHead: z.string().optional(),
    phoneBody: z.string().optional(),
    phoneTail: z.string().optional(),
    postCode: z.string().optional(),
    address: z.string().optional(),
    addressDetail: z.string().optional(),
  });

export const orderCheckOutSchema = (t: TFunction) =>
  z
    .object({
      ordererInfo: ordererInfoSchema(t),
      shippingInfo: shippingInfoSchema(t),
      senderInfo: senderInfoSchema(t),
      saveForWorker: z.boolean().optional(),
      isChangeSenderInfo: z.boolean().optional(),
      isVirtualAccount: z.boolean().optional(),
      isOtherPayment: z.boolean().optional(),
      isBankTransfer: z.boolean().optional(),
      bankAccountKey: z.string().optional(),
      bankAccountHolder: z.string().optional(),
      appliedPoint: z.string().optional(),
      point: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const addRequiredIssue = (path: (string | number)[], field: string) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: t('validation.required', { field }),
        });
      };

      if (values.shippingInfo.shippingMethod !== OrderShippingMethod.PICKUP) {
        if (!values.shippingInfo.postCode) {
          addRequiredIssue(['shippingInfo', 'postCode'], t('auth.address'));
        }
        if (!values.shippingInfo.address) {
          addRequiredIssue(['shippingInfo', 'address'], t('auth.address'));
        }
        // if (!values.shippingInfo.addressDetail) {
        //   addRequiredIssue(['shippingInfo', 'addressDetail'], t('auth.address'));
        // }
      }

      if (!values.isChangeSenderInfo) return;

      if (!values.senderInfo.businessName) {
        addRequiredIssue(['senderInfo', 'businessName'], t('common.name_business'));
      }
      if (!values.senderInfo.phoneHead) {
        addRequiredIssue(['senderInfo', 'phoneHead'], t('common.contact_info'));
      }
      if (!values.senderInfo.phoneBody) {
        addRequiredIssue(['senderInfo', 'phoneBody'], t('common.contact_info'));
      }
      if (!values.senderInfo.phoneTail) {
        addRequiredIssue(['senderInfo', 'phoneTail'], t('common.contact_info'));
      }
      if (!values.senderInfo.postCode) {
        addRequiredIssue(['senderInfo', 'postCode'], t('auth.address'));
      }
      if (!values.senderInfo.address) {
        addRequiredIssue(['senderInfo', 'address'], t('auth.address'));
      }
      // if (!values.senderInfo.addressDetail) {
      //   addRequiredIssue(['senderInfo', 'addressDetail'], t('auth.address'));
      // }
    });

export type OrderCheckOutFormValues = z.infer<ReturnType<typeof orderCheckOutSchema>>;

export const orderCheckOutDefaultValues: OrderCheckOutFormValues = {
  ordererInfo: {
    isSaveOrderInfo: false,
    ordererName: '',
    phoneHead: '',
    phoneBody: '',
    phoneTail: '',
  },
  shippingInfo: {
    shippingMethod: OrderShippingMethod.COURIER,
    saveForShippingAddress: false,
    ordererName: '',
    phoneHead: '',
    phoneBody: '',
    phoneTail: '',
    postCode: '',
    address: '',
    addressDetail: '',
    message: '',
    detailNote: '',
  },
  senderInfo: {
    businessName: '',
    phoneHead: '',
    phoneBody: '',
    phoneTail: '',
    postCode: '',
    address: '',
    addressDetail: '',
  },
  saveForWorker: false,
  isChangeSenderInfo: false,
  isVirtualAccount: true,
  isOtherPayment: false,
  isBankTransfer: false,
  bankAccountKey: '',
  bankAccountHolder: '',
  appliedPoint: '',
  point: '',
};
