'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '../button';
import { Modal, ModalHandle } from '../modal';
import { OtpInput } from '../otp-input';
import { useMediaQuery } from '@/hooks';
import { cn, formatTime } from '@/lib/utils';

export interface OtpModalHandle {
  open: () => void;
  close: () => void;
}

export interface OtpModalProps {
  phone?: string;
  onVerify?: (otp: string) => void;
  onResend?: () => void;
  isVerifying?: boolean;
}

export const OtpModal = forwardRef<OtpModalHandle, OtpModalProps>(({ phone, onVerify, onResend, isVerifying }, ref) => {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const modalRef = useRef<ModalHandle>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [timeLeft, setTimeLeft] = useState(180);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  useImperativeHandle(ref, () => ({
    open: () => {
      setTimeLeft(180);
      setOtp(Array(6).fill(''));
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

  return (
    <Modal
      ref={modalRef}
      size='lg'
      position={isDesktop ? 'center' : 'bottom'}
      title={tAuth('identity_verification')}
      titleClassName='title-18 md:title-24 md:px-6'
      footer={
        <div className='flex justify-end gap-4 md:px-6'>
          <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-9 w-15 px-0 md:h-10 md:w-20'>
            {tCommon('cancel')}
          </Button>
          <Button
            variant='primary'
            size='md'
            loading={isVerifying}
            onClick={() => {
              onVerify?.(otp.join(''));
              if (isVerifying === undefined) {
                modalRef.current?.close();
              }
            }}
            className='h-9 w-15 px-0 md:h-10 md:w-20'>
            {tCommon('check')}
          </Button>
        </div>
      }>
      <div className='border-border-soft flex flex-col items-center gap-4 border-t border-b py-6 md:gap-8 md:py-8'>
        <div className='flex flex-col items-center gap-2'>
          <h4 className='title-20'>{tAuth('send_to_phone', { phone: phone || '010-0000-0000' })}</h4>
          <p className='text-text-secondary body-14'>{tAuth('enter_verification_code')}</p>
        </div>

        <div className='flex flex-col items-center gap-3'>
          <OtpInput value={otp} onChange={setOtp} />
          <div className='text-text-brand body-14'>{formatTime(timeLeft)}</div>
        </div>

        <Button
          variant='ghost'
          onClick={onResend}
          disabled={timeLeft > 0}
          className={cn(
            'body-14 text-text-secondary underline transition-colors hover:bg-transparent disabled:no-underline',
            timeLeft == 0 && 'hover:text-text-brand',
          )}>
          {tAuth('no_receive_verification_code')}
        </Button>
      </div>
    </Modal>
  );
});

OtpModal.displayName = 'OtpModal';
