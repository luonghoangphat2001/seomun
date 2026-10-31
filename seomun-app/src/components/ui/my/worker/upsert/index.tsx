'use client';

import { Button, OtpModalHandle } from '@/components/common';
import { FormCellphone, FormInput } from '@/components/form';
import { PHONE_OPTIONS } from '@/constants/common';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import PageTitle from '../../components/PageTitle';
import { workerUpsertDefault, WorkerUpsertFormValues, workerUpsertSchema } from './schema';
import {
  useWorkerCreateMutation,
  useWorkerDetailQuery,
  useWorkerSendCodeMutation,
  useWorkerUpdateMutation,
  useWorkerVerifyCodeMutation,
} from '@/apis/my/worker/worker.query';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import { transformWorkerFormValuesToREQ, transformWorkerRESPToFormValues } from '@/apis/my/worker/worker.service';
import { WorkerUpdateREQ } from '@/apis/my/worker/worker.request';

const MyWorkerUpsert = () => {
  const t = useTranslations();
  const router = useRouter();
  const { workerId } = useParams();
  const otpModalRef = useRef<OtpModalHandle>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  //hook form edit
  const form = useForm<WorkerUpsertFormValues>({
    mode: 'all',
    defaultValues: workerUpsertDefault,
    resolver: zodResolver(workerUpsertSchema(t)),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form;

  const [cellphonePrefix, cellphone1, cellphone2] = useWatch({
    control,
    name: ['cellphonePrefix', 'cellphone1', 'cellphone2'],
  });
  const fullPhone = `${cellphonePrefix}${cellphone1}${cellphone2}`;

  //api create
  const { mutate: mutateCreate, isPending: isPendingCreate } = useWorkerCreateMutation();

  //api update
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useWorkerUpdateMutation();

  //api detail
  const { data: dataDetail } = useWorkerDetailQuery(Number(workerId) || undefined);

  //api send code
  const { mutate: mutateSendCode, isPending: isPendingSendCode } = useWorkerSendCodeMutation();

  //api verify code
  const { mutate: mutateVerifyCode, isPending: isPendingVerifyCode } = useWorkerVerifyCodeMutation();

  const handleSendCode = () => {
    if (!cellphonePrefix || !cellphone1 || !cellphone2) {
      toast.error(t('validation.required', { field: t('auth.cellphone') }));
      return;
    }

    mutateSendCode(
      {
        mobile: fullPhone,
      },
      {
        onSuccess: () => {
          toast.success(t('auth.verification_code_sent'));
        },
        onError: (error) => {
          toast.error(error.response?.data.message || t('auth.send_code_failed'));
        },
      },
    );
  };

  const handleVerifyOtp = (otp: string) => {
    if (isPendingVerifyCode) return;

    mutateVerifyCode(
      {
        mobile: fullPhone,
        code: otp,
      },
      {
        onSuccess: () => {
          setIsPhoneVerified(true);
          toast.success(t('auth.verification_success'));
          otpModalRef.current?.close();
        },
        onError: (error) => {
          toast.error(error.response?.data.message || t('auth.verification_failed'));
        },
      },
    );
  };

  const onCreate = handleSubmit((input: WorkerUpsertFormValues) => {
    if (isPendingCreate) return;
    const body = transformWorkerFormValuesToREQ(input);
    mutateCreate(body, {
      onSuccess: () => {
        toast.success(t('common.success_create'));
        router.push(ROUTES.MY_PAGE.WORKER);
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? t('common.fail_create'));
      },
    });
  });

  const onEdit = handleSubmit((input: WorkerUpsertFormValues) => {
    if (!workerId || isPendingUpdate) return;
    const body = transformWorkerFormValuesToREQ(input, Number(workerId)) as WorkerUpdateREQ;
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
    router.push(ROUTES.MY_PAGE.WORKER);
  };

  useEffect(() => {
    if (workerId && dataDetail) {
      reset(transformWorkerRESPToFormValues(dataDetail));
      return;
    }
    reset(workerUpsertDefault);
  }, [workerId, dataDetail, reset]);

  return (
    <main className='relative space-y-4 md:space-y-8'>
      <PageTitle
        title={`${t('common.worker')} ${workerId ? t('common.edit') : t('common.add')}`}
        returnRoute={ROUTES.MY_PAGE.WORKER}
        extra={
          <div className='mobile-button flex gap-3 md:gap-4'>
            <Button variant='outline' className='body-16 h-12 flex-1 md:h-10 md:w-auto' onClick={backToList}>
              {t('common.cancel')}
            </Button>
            <Button
              className='body-16 h-12 flex-1 md:h-10 md:w-auto'
              onClick={workerId ? onEdit : onCreate}
              loading={isPendingCreate || isPendingUpdate}
              disabled={Boolean(workerId && !isDirty)}>
              {t('inquiry.write')}
            </Button>
          </div>
        }
      />
      <div className='mobile-seperator'></div>
      <FormProvider {...form}>
        <section className='max-w-230 space-y-4'>
          <FormInput
            labelPlacement={'top'}
            label={t('common.worker')}
            control={control}
            name='workerName'
            placeholder={t('common.worker')}
            containerClassName='flex-1'
            required
          />
          {/* <div>
            <label className='body-16 text-text-main'>
              {t('auth.cellphone')} <span className='text-error ml-0.5'>*</span>
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <FormInput control={control} name='cellphonePrefix' />
              <span className='input-15'>-</span>
              <FormInput control={control} name='cellphone1' />
              <span className='input-15'>-</span>
              <FormInput control={control} name='cellphone2' />
            </div>
          </div> */}
          <FormCellphone
            labelPlacement={'top'}
            control={control}
            namePrefix='cellphonePrefix'
            name1='cellphone1'
            name2='cellphone2'
            label={t('auth.cellphone')}
            phoneOptions={PHONE_OPTIONS}
            placeholderSelect={t('auth.select')}
            required
            showVerification={false}
            verificationClassName={'hidden'}
            // verificationLabel={t('auth.send_verification_code')}
            // onSendCode={handleSendCode}
            // onOtpResend={handleSendCode}
            // isSendingCode={isPendingSendCode}
            // onOtpVerify={handleVerifyOtp}
            // isVerifying={isPendingVerifyCode}
            // otpModalRef={otpModalRef}
            // readOnly={isPhoneVerified}
            // isVerified={isPhoneVerified}
          />
        </section>
      </FormProvider>
    </main>
  );
};

export default MyWorkerUpsert;
