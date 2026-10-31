'use client';

import { useMyProfileQuery } from '@/apis/my/profile/profile.query';
import {
  transformEditMemberInfoFormValuesToUpdatePasswordREQ,
  transformEditMemberInfoFormValuesToUpdateProfileREQ,
  transformProfileToEditMemberInfoFormValues,
} from '@/apis/my/profile/profile.service';
import { Button, ModalHandle } from '@/components/common';
import Loading from '@/components/common/loading';
import PageTitle from '../components/PageTitle';
import { Pencil, UserSwitch } from '@/icons';
import LoginInfo from './LoginInfo';
import BasicInfo from './BasicInfo';
import CompanyInfo from './CompanyInfo';
import CommonInfo from './CommonInfo';
// import CautionSection from './CautionSection';
import { useEffect, useRef } from 'react';
import { ConfirmPasswordToEditModal } from './ConfirmPasswordToEditModal';
import { SwitchToBusinessModal } from './SwitchToBusinessModal';
import { useTranslations } from 'next-intl';
import { useMemberInfoStore } from './store';
import MemberInfoEditForm from './MemberInfoEditForm';
import { cn } from '@/lib/utils';
import { FormProvider, useForm } from 'react-hook-form';
import { editMemberInfoDefault, EditMemberInfoFormValues, editMemberInfoSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/hooks';
import { refreshAuthProfile } from '@/lib/utils/auth';
import { UserMemberType } from '@/enums/user';
import {
  useProfilePasswordUpdateMutation,
  useProfileUpdateMutation,
  useUploadBusinessRegistrationFileMutation,
} from '@/apis/my/profile/profile.query';
import toast from 'react-hot-toast';
import type { ErrorRESP } from '@/types';

const MyMemberInfoComponent = () => {
  const t = useTranslations();
  const confirmPasswordModalRef = useRef<ModalHandle>(null);
  const switchToBusinessModalRef = useRef<ModalHandle>(null);
  const { passwordConfirmed, currentPassword, setPasswordConfirmed, setCurrentPassword } = useMemberInfoStore();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const { data: profile, isLoading } = useMyProfileQuery({
    enabled: isHydrated && isAuthenticated,
  });

  const { mutateAsync: updateProfile, isPending: isPendingUpdateProfile } = useProfileUpdateMutation();
  const { mutateAsync: updatePassword, isPending: isPendingUpdatePassword } = useProfilePasswordUpdateMutation();
  const { mutateAsync: uploadBusinessRegistrationFile, isPending: isPendingUploadBusinessRegistrationFile } =
    useUploadBusinessRegistrationFileMutation();

  //hook form edit
  const form = useForm<EditMemberInfoFormValues>({
    mode: 'all',
    defaultValues: editMemberInfoDefault,
    resolver: zodResolver(editMemberInfoSchema(t)),
  });

  const { handleSubmit, reset, watch } = form;
  const memberTypeWatch = watch('memberType');

  useEffect(() => {
    if (!profile?.profile) return;

    reset(transformProfileToEditMemberInfoFormValues(profile.profile));
  }, [profile, reset]);

  const openConfirmPasswordModal = () => {
    confirmPasswordModalRef.current?.open();
  };

  const closeConfirmPasswordModal = () => {
    confirmPasswordModalRef.current?.close();
  };

  const openSwitchToBusinessModal = () => {
    switchToBusinessModalRef.current?.open();
  };

  const onSaveEdit = async (input: EditMemberInfoFormValues) => {
    try {
      const passwordRequested = Boolean(input.password?.trim());
      if (passwordRequested && !currentPassword) {
        toast.error(t('common.error'));
        return;
      }

      const selectedBizCertificate = input.bizCertificate?.find((file) => file.file);
      const existingBizCertificatePath = profile?.profile?.customer?.business_registration_file ?? undefined;

      let businessRegistrationFilePath = existingBizCertificatePath;
      if (selectedBizCertificate?.file) {
        const uploadResponse = await uploadBusinessRegistrationFile({ file: selectedBizCertificate.file });
        businessRegistrationFilePath = uploadResponse.data.file_path;
      } else if ((input.bizCertificate?.length ?? 0) === 0) {
        businessRegistrationFilePath = undefined;
      }

      await updateProfile(transformEditMemberInfoFormValuesToUpdateProfileREQ(input, businessRegistrationFilePath));

      const passwordBody = transformEditMemberInfoFormValuesToUpdatePasswordREQ(input, currentPassword);
      if (passwordBody) {
        await updatePassword(passwordBody);
      }

      await refreshAuthProfile();

      toast.success(t('common.success_update'));
      setPasswordConfirmed(false);
      setCurrentPassword('');
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: ErrorRESP } }).response?.data?.message
          : undefined;

      toast.error(message ?? t('common.fail_update'));
    }
  };

  if (!isHydrated || !isAuthenticated) return null;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className='relative'>
      <PageTitle
        title={t('my.edit_my_info')}
        extra={
          <div className={cn('mobile-button flex gap-3 md:gap-4', !passwordConfirmed ? 'flex-col md:flex-row' : '')}>
            {!passwordConfirmed ? (
              <>
                {profile?.profile?.member_type !== UserMemberType.BUSINESS && (
                  <Button
                    variant='outline'
                    className='body-16 w-full md:w-auto'
                    rightIcon={<UserSwitch className='size-6' />}
                    onClick={openSwitchToBusinessModal}>
                    {t('my.convert_corporate_member')}
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='body-16 w-full md:w-auto'
                  rightIcon={<Pencil className='size-6' />}
                  onClick={openConfirmPasswordModal}>
                  {t('my.edit')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  className='body-16 w-full md:w-auto'
                  onClick={() => {
                    setPasswordConfirmed(false);
                    setCurrentPassword('');
                  }}>
                  {t('common.cancel')}
                </Button>
                <Button
                  className='body-16 w-full md:w-auto'
                  onClick={handleSubmit(onSaveEdit)}
                  loading={isPendingUploadBusinessRegistrationFile || isPendingUpdateProfile || isPendingUpdatePassword}>
                  {t('editor.save')}
                </Button>
              </>
            )}
          </div>
        }
      />
      {!passwordConfirmed ? (
        <section className='mt-4 space-y-4 md:mt-6 md:space-y-12'>
          <LoginInfo user={profile?.profile} />
          <BasicInfo user={profile?.profile} />
          <CompanyInfo memberType={memberTypeWatch} customer={profile?.profile?.customer ?? null} />
          <CommonInfo agreeSms={profile?.profile?.agree_sms} agreeEmail={profile?.profile?.agree_email} />
          {/* <CautionSection memberType={memberTypeWatch} /> */}
        </section>
      ) : (
        <FormProvider {...form}>
          <MemberInfoEditForm username={profile?.profile?.username ?? ''} />
        </FormProvider>
      )}

      <ConfirmPasswordToEditModal
        ref={confirmPasswordModalRef}
        username={profile?.profile?.username ?? ''}
        onClose={closeConfirmPasswordModal}
      />
      <SwitchToBusinessModal ref={switchToBusinessModalRef} />
    </main>
  );
};

export default MyMemberInfoComponent;
