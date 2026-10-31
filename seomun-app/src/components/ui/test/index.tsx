'use client';

import {
  Badge,
  Button,
  Checkbox,
  FileItem,
  Input,
  Modal,
  ModalHandle,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  Upload,
} from '@/components/common';
import { FormCheckbox, FormInput, FormRadioGroup, FormSelect, FormTextarea, FormUpload } from '@/components/form';
import { InquiryTableDemo } from './table-demo';
import { Plus } from '@/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormValues = {
  name: string;
  email: string;
  bio: string;
  shippingMethod: string;
  paymentMethod: string;
  refundBank: string;
  agreeTerms: boolean;
  attachments: FileItem[];
};

const SelectOptions = [
  { label: '국민은행', value: 'kb' },
  { label: '신한은행', value: 'sh' },
  { label: '우리은행', value: 'wo' },
  { label: '토스뱅크', value: 'toss' },
];

export const TestPage = () => {
  const t = useTranslations('validation');
  const tCommon = useTranslations('common');

  const [value, setValue] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('1');
  const [selectedCheckbox, setSelectedCheckbox] = useState(false);
  const [selected, setSelected] = useState<number | string>();
  const modalRef = useRef<ModalHandle>(null);
  const modalSmRef = useRef<ModalHandle>(null);
  const modalLgRef = useRef<ModalHandle>(null);
  const modalBottomRef = useRef<ModalHandle>(null);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('min_length', { field: t('auth.name'), length: 2 })),
        email: z.string().email(t('invalid_email')),
        bio: z.string().min(10, t('min_length', { field: t('auth.basic_information'), length: 10 })),
        shippingMethod: z.string().min(1, t('select_required', { field: '배송 방법' })),
        paymentMethod: z.string().min(1, t('select_required', { field: '결제 수단' })),
        refundBank: z.string().min(1, t('select_required', { field: '환불 계좌' })),
        agreeTerms: z.boolean().refine((val) => val === true, t('required', { field: t('auth.term_of_service') })),
        attachments: z.array(z.any()).min(1, t('required', { field: t('common.file') })),
      }),
    [t],
  );

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      shippingMethod: '',
      paymentMethod: '',
      refundBank: '',
      agreeTerms: false,
      attachments: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    console.warn('Form Submitted:', data);
    alert('Form Submitted successfully!');
    reset();
  };

  return (
    <div className='flex flex-col gap-16 bg-white p-10'>
      <div className='flex flex-col gap-12'>
        <h1 className='text-3xl font-bold'>UI Components Gallery</h1>

        {/* Demo Form Section */}
        <section className='border-border-brand space-y-6 rounded-xl border p-8 shadow-sm'>
          <h2 className='text-xl font-bold'>배송 방법 및 결제 (Form Demo)</h2>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
              <FormInput control={control} name='name' label='이름' placeholder='이름을 입력하세요' required />
              <FormInput control={control} name='email' label='이메일' placeholder='example@mail.com' required />
            </div>

            <FormTextarea control={control} name='bio' label='자기소개' placeholder='내용을 입력해주세요 (10자 이상)' required />

            <div className='flex flex-col gap-8'>
              <FormRadioGroup control={control} name='shippingMethod' label='배송 방법' labelPlacement='left' required>
                <Radio label='택배' value='parcel' />
                <Radio label='퀵' value='quick' />
                <Radio label='방문수령' value='pickup' />
              </FormRadioGroup>

              <FormRadioGroup control={control} name='paymentMethod' label='결제 수단' labelPlacement='left' required>
                <Radio label='Toss Payments' value='toss' />
                <Radio label='신용카드' value='card' />
              </FormRadioGroup>

              <FormSelect
                control={control}
                name='refundBank'
                label='환불 계좌'
                labelPlacement='left'
                options={SelectOptions}
                placeholder='선택하다'
                required
              />
            </div>
            <FormUpload
              control={control}
              name='attachments'
              label='첨부파일'
              required
              helperText='파일을 업로드해주세요 (최소 1개)'
            />
            <FormCheckbox control={control} name='agreeTerms' label='이용 약관 및 개인정보 처리방침에 동의합니다' />

            <div className='flex justify-end gap-3'>
              <Button type='button' variant='outline-gray' onClick={() => reset()}>
                {tCommon('reset')}
              </Button>
              <Button type='submit'>{tCommon('submit')}</Button>
            </div>
          </form>
        </section>
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Default State</h2>
          <div className='flex items-end gap-2'>
            <Input
              label='타이틀'
              placeholder='input'
              required
              helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>

          <div className='flex items-start gap-2'>
            <Input
              label='타이틀'
              labelPlacement='left'
              placeholder='input'
              required
              helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>
        </section>

        {/* Row 2: Focused */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Focused State</h2>
          <div className='flex items-end gap-2'>
            <Input
              label='타이틀'
              variant='focused'
              placeholder='input'
              required
              helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>

          <div className='flex items-start gap-2'>
            <Input
              label='타이틀'
              labelPlacement='left'
              variant='focused'
              placeholder='input'
              required
              helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>
        </section>

        {/* Row 3: Error */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Error State</h2>
          <div className='flex items-end gap-2'>
            <Input
              label='타이틀'
              error='알림을 확인해주세요.'
              placeholder='input'
              required
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>

          <div className='flex items-start gap-2'>
            <Input
              label='타이틀'
              labelPlacement='left'
              error='알림을 확인해주세요.'
              placeholder='input'
              required
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>
        </section>

        {/* Row 4: Disabled */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Disabled State</h2>
          <div className='flex items-end gap-2'>
            <Input
              label='타이틀'
              variant='disabled'
              placeholder='input'
              required
              helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>

          <div className='flex items-start gap-2'>
            <Input
              label='타이틀'
              labelPlacement='left'
              variant='disabled'
              placeholder='input'
              required
              //   helperText='알림을 확인해주세요.'
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              onClear={() => setValue('')}
              suffix='text'
            />
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-12 border-t pt-12 md:grid-cols-2'>
        {/* Textarea Examples */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Textarea (Top Label)</h2>
          <Textarea
            label='설명'
            placeholder='내용을 입력해주세요'
            required
            helperText='최대 100자까지 입력 가능합니다.'
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          />
        </section>

        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Textarea (Left Label)</h2>
          <Textarea
            label='설명'
            labelPlacement='left'
            placeholder='내용을 입력해주세요'
            required
            error='내용을 입력해주세요.'
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          />
        </section>

        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Upload</h2>
          <div className='flex flex-col gap-6'>
            <Upload
              label='첨부파일'
              required
              helperText='PDF, JPEG, PNG, 최대 1GB'
              files={[
                { id: '1', name: '첨부파일 명' },
                { id: '2', name: '첨부파일 명' },
              ]}
            />
            <Upload label='첨부파일 (Disabled)' disabled required helperText='파일 업로드가 비활성화되었습니다.' />
            <Upload
              label='첨부파일 (ReadOnly)'
              readOnly
              files={[
                { id: '1', name: '첨부파일 1.pdf' },
                { id: '2', name: '이미지.jpg' },
              ]}
            />
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>ReadOnly States</h2>
          <div className='flex flex-col gap-6'>
            <Input label='Input (ReadOnly)' value='Read only content' readOnly />
            <Textarea label='Textarea (ReadOnly)' value='Read only content' readOnly />
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Upload (Error)</h2>
          <Upload label='첨부파일' labelPlacement='left' required error='파일을 선택해주세요.' />
        </section>
      </div>

      <div className='grid grid-cols-1 gap-12 border-t pt-12 md:grid-cols-2'>
        {/* Checkbox & Radio */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Checkbox & Radio</h2>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-6'>
              <Checkbox label='체크박스' checked={selectedCheckbox} onChange={(value) => setSelectedCheckbox(value)} />
              <Checkbox label='체크박스 (Default)' checked={false} />
              <Checkbox label='체크박스 (Disabled)' disabled />
            </div>

            <RadioGroup label='결제 수단' required helperText='결제 수단을 선택해주세요.'>
              <Radio
                label='신용카드'
                value='1'
                checked={selectedRadio === '1'}
                onChange={(val) => setSelectedRadio(val as never)}
              />
              <Radio
                label='계좌이체'
                value='2'
                checked={selectedRadio === '2'}
                onChange={(val) => setSelectedRadio(val as never)}
              />
              <Radio label='가상계좌 (Disabled)' value='3' disabled />
            </RadioGroup>

            <RadioGroup label='배송 방법' labelPlacement='left' error='배송 방법을 선택해주세요.' required>
              <Radio label='일반 배송' value='1' />
              <Radio label='새벽 배송' value='2' />
              <Radio label='퀵 배송' value='3' />
            </RadioGroup>
          </div>
        </section>

        {/* Select */}
        <section className='space-y-6'>
          <h2 className='text-lg font-bold'>Select</h2>
          <div className='flex flex-col gap-4'>
            <Select
              label='타이틀'
              placeholder='Select option'
              options={[
                { label: 'Option 1', value: '1' },
                { label: 'Option 2', value: '2' },
              ]}
              value={selected}
              onChange={(value) => setSelected(value)}
              required
            />
            <Select
              label='타이틀'
              labelPlacement='left'
              placeholder='Select option'
              options={[
                { label: 'Option 1', value: '1' },
                { label: 'Option 2', value: '2' },
              ]}
              error='내용을 입력해주세요.'
            />
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-12 border-t pt-12'>
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Button Gallery</h2>

          {/* Primary */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Primary</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Button size='lg'>로그인</Button>
              <Button size='md'>로그인</Button>
              <Button size='sm'>로그인</Button>
              <Button size='xs'>로그인</Button>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Button leftIcon={<Plus className='h-4 w-4' />} rightIcon={<Plus className='h-4 w-4' />}>
                로그인
              </Button>
              <Button variant='primary' disabled>
                로그인
              </Button>
              <Button variant='primary' loading>
                로그인
              </Button>
            </div>
          </div>

          {/* Secondary */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Secondary</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='secondary' size='lg'>
                로그인
              </Button>
              <Button variant='secondary' size='md'>
                로그인
              </Button>
              <Button variant='secondary' size='sm'>
                로그인
              </Button>
              <Button variant='secondary' size='xs'>
                로그인
              </Button>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='secondary' leftIcon={<Plus className='h-4 w-4' />} rightIcon={<Plus className='h-4 w-4' />}>
                로그인
              </Button>
              <Button variant='secondary' disabled>
                로그인
              </Button>
              <Button variant='secondary' loading>
                로그인
              </Button>
            </div>
          </div>

          {/* Outline Primary */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Outline Primary</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='outline-primary' size='lg'>
                로그인
              </Button>
              <Button variant='outline-primary' size='md'>
                로그인
              </Button>
              <Button variant='outline-primary' size='sm'>
                로그인
              </Button>
              <Button variant='outline-primary' size='xs'>
                로그인
              </Button>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='outline-primary' leftIcon={<Plus className='h-4 w-4' />} rightIcon={<Plus className='h-4 w-4' />}>
                로그인
              </Button>
              <Button variant='outline-primary' disabled>
                로그인
              </Button>
              <Button variant='outline-primary' loading>
                로그인
              </Button>
            </div>
          </div>

          {/* Outline Gray */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Outline Gray</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='outline-gray' size='lg'>
                로그인
              </Button>
              <Button variant='outline-gray' size='md'>
                로그인
              </Button>
              <Button variant='outline-gray' size='sm'>
                로그인
              </Button>
              <Button variant='outline-gray' size='xs'>
                로그인
              </Button>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Button variant='outline-gray' leftIcon={<Plus className='h-4 w-4' />} rightIcon={<Plus className='h-4 w-4' />}>
                로그인
              </Button>
              <Button variant='outline-gray' disabled>
                로그인
              </Button>
              <Button variant='outline-gray' loading>
                로그인
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-12 border-t pt-12'>
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Badge Gallery</h2>

          {/* Solid Badges */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Solid (Default)</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Badge color='blue'>결제 대기</Badge>
              <Badge color='yellow'>접수대기</Badge>
              <Badge color='red'>교정 대기</Badge>
              <Badge color='secondary'>조판</Badge>
              <Badge color='brown'>인쇄</Badge>
              <Badge color='dark-brown'>후가공</Badge>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Badge color='primary'>Primary</Badge>
              <Badge color='error'>Error</Badge>
            </div>
          </div>

          {/* Outline Badges */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Outline</h3>
            <div className='flex flex-wrap items-center gap-4'>
              <Badge variant='outline' color='blue'>
                결제 대기
              </Badge>
              <Badge variant='outline' color='yellow'>
                접수대기
              </Badge>
              <Badge variant='outline' color='red'>
                교정 대기
              </Badge>
              <Badge variant='outline' color='secondary'>
                조판
              </Badge>
              <Badge variant='outline' color='brown'>
                인쇄
              </Badge>
              <Badge variant='outline' color='dark-brown'>
                후가공
              </Badge>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <Badge variant='outline' color='primary'>
                Primary
              </Badge>
              <Badge variant='outline' color='error'>
                Error
              </Badge>
            </div>
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-12 border-t pt-12'>
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Modal Examples</h2>
          <div className='flex flex-wrap gap-4'>
            <Button onClick={() => modalRef.current?.open()}>Default Modal</Button>
            <Button variant='secondary' onClick={() => modalSmRef.current?.open()}>
              Small Modal
            </Button>
            <Button variant='outline-primary' onClick={() => modalLgRef.current?.open()}>
              Large Modal
            </Button>
            <Button variant='outline-gray' onClick={() => modalBottomRef.current?.open()}>
              Bottom Sheet (Mobile)
            </Button>
          </div>

          {/* Modal Instances */}
          <Modal
            ref={modalRef}
            title='기본 모달'
            description='이것은 기본 모달의 설명입니다.'
            footer={
              <div className='flex justify-end gap-2'>
                <Button variant='outline-gray' size='sm' onClick={() => modalRef.current?.close()}>
                  취소
                </Button>
                <Button size='sm' onClick={() => modalRef.current?.close()}>
                  확인
                </Button>
              </div>
            }>
            <div className='space-y-4'>
              <p>모달 본문 내용이 여기에 들어갑니다. 스크롤이 가능하도록 긴 내용을 넣을 수 있습니다.</p>
              <Input label='이름' placeholder='이름을 입력하세요' />
              <Checkbox label='약관 동의' />
            </div>
          </Modal>

          <Modal
            ref={modalSmRef}
            size='sm'
            title='작은 모달'
            footer={
              <Button fullWidth onClick={() => modalSmRef.current?.close()}>
                닫기
              </Button>
            }>
            <p className='text-center'>작은 사이즈의 모달입니다.</p>
          </Modal>

          <Modal
            ref={modalLgRef}
            size='lg'
            title='큰 모달'
            description='상세 정보를 확인하세요.'
            footer={
              <div className='flex justify-end gap-2'>
                <Button variant='ghost' onClick={() => modalLgRef.current?.close()}>
                  닫기
                </Button>
              </div>
            }>
            <div className='grid grid-cols-2 gap-4'>
              <div className='h-32 rounded-lg bg-gray-100 p-4'>그리드 아이템 1</div>
              <div className='h-32 rounded-lg bg-gray-100 p-4'>그리드 아이템 2</div>
              <div className='h-32 rounded-lg bg-gray-100 p-4'>그리드 아이템 3</div>
              <div className='h-32 rounded-lg bg-gray-100 p-4'>그리드 아이템 4</div>
            </div>
          </Modal>

          <Modal
            ref={modalBottomRef}
            position='bottom'
            title='바텀 시트'
            description='모바일 환경에서 유용한 바텀 시트 스타일입니다.'>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className='flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50'>
                  <div className='bg-primary-100 h-10 w-10 rounded-full' />
                  <div>
                    <div className='font-medium'>리스트 항목 {i}</div>
                    <div className='text-soft text-xs'>항목에 대한 추가 설명</div>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        </section>
      </div>
      <div className='grid grid-cols-1 gap-12 border-t pt-12'>
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Table Demo (Inquiry Request)</h2>
          <InquiryTableDemo />
        </section>
      </div>
    </div>
  );
};
