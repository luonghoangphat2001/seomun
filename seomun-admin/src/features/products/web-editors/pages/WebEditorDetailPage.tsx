import { zodResolver } from '@hookform/resolvers/zod';
import { getRouteApi } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppSelectFormField, AppInputFormField } from '@/components/shared/form-fields';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useUpdateWebEditorMutation, useWebEditorDetailQuery, useWebEditorTemplatesQuery } from '../api';
import { WEB_EDITOR_TYPE_TRANSLATION_KEYS } from '../constants';
import { WebEditorStatus } from '../enums';
import { editWebEditorInfoSchema, type EditWebEditorInfoFormValues } from '../schemas';

// === Variables ===

const routeApi = getRouteApi('/products/web-editors_/$webEditorId');

// === Component ===

export function WebEditorDetailPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const { webEditorId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const id = Number(webEditorId);

  // === Hooks ===
  const { data, isLoading } = useWebEditorDetailQuery(id);
  const { data: templatesData } = useWebEditorTemplatesQuery(id);
  const updateMutation = useUpdateWebEditorMutation();

  const webEditor = data?.data.web_editor;
  const templates = templatesData?.data.templates ?? [];

  const statusOptions = useMemo(
    () => [
      { value: WebEditorStatus.ACTIVE, label: t('products.web_editors.enum.status.active') },
      { value: WebEditorStatus.HIDDEN, label: t('products.web_editors.enum.status.hidden') },
    ],
    [t],
  );

  // === State (form) ===
  const form = useForm<EditWebEditorInfoFormValues>({
    resolver: zodResolver(editWebEditorInfoSchema) as Resolver<EditWebEditorInfoFormValues>,
    defaultValues: { name: '', status: WebEditorStatus.ACTIVE },
  });

  // === Effects ===
  useEffect(() => {
    if (webEditor) {
      form.reset({ name: webEditor.name, status: webEditor.status.value });
    }
  }, [form, webEditor]);

  // === Functions ===
  const handleSave = form.handleSubmit((values) => {
    if (!webEditor) return;
    updateMutation.mutate(
      {
        id,
        payload: {
          name: values.name,
          status: values.status,
          type: webEditor.type,
          width: webEditor.width,
          height: webEditor.height,
          unit: webEditor.unit,
          dpi: webEditor.dpi,
          bleed: webEditor.bleed,
          safe_area: webEditor.safe_area,
          config_json: null,
        },
      },
      {
        onSuccess: () => toast.success(tCommon('message.save_success')),
        onError: () => toast.error(tCommon('message.save_failed')),
      },
    );
  });

  const typeLabel = webEditor
    ? WEB_EDITOR_TYPE_TRANSLATION_KEYS[webEditor.type as keyof typeof WEB_EDITOR_TYPE_TRANSLATION_KEYS]
      ? t(WEB_EDITOR_TYPE_TRANSLATION_KEYS[webEditor.type as keyof typeof WEB_EDITOR_TYPE_TRANSLATION_KEYS])
      : webEditor.type
    : '-';

  // === JSX return ===
  return (
    <PageContainer>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' onClick={() => void navigate({ to: '/products/web-editors' })} className='gap-1.5'>
          <ArrowLeft className='size-4' />
          {tCommon('action.back')}
        </Button>
        <Separator orientation='vertical' className='h-5' />
        <h1 className='text-xl font-semibold'>{webEditor?.name ?? '...'}</h1>
      </div>

      <Separator />

      {isLoading ? (
        <div className='text-muted-foreground py-10 text-center text-sm'>{tCommon('message.loading')}</div>
      ) : (
        <div className='space-y-6'>
          {/* Section 1: Basic info — editable */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('products.web_editors.detail.section_info')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className='space-y-4' onSubmit={handleSave}>
                <div className='grid grid-cols-2 gap-4 *:min-w-0'>
                  <AppInputFormField
                    name='name'
                    control={form.control}
                    label={t('products.web_editors.fields.name')}
                    disabled={updateMutation.isPending}
                    required
                  />
                  <AppSelectFormField
                    name='status'
                    control={form.control}
                    label={t('products.web_editors.fields.status')}
                    options={statusOptions}
                    disabled={updateMutation.isPending}
                    required
                  />
                </div>
                <div className='flex justify-end'>
                  <AppButton type='submit' onClick={handleSave} isLoading={updateMutation.isPending}>
                    {tCommon('action.save')}
                  </AppButton>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Section 2: Specifications — read-only */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('products.web_editors.detail.section_specs')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3'>
                <div>
                  <dt className='text-muted-foreground text-xs'>{t('products.web_editors.fields.type')}</dt>
                  <dd className='mt-1 text-sm font-medium'>{typeLabel}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs'>{t('products.web_editors.fields.dpi')}</dt>
                  <dd className='mt-1 text-sm font-medium'>{webEditor?.dpi ?? '-'}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs'>{t('products.web_editors.fields.bleed')}</dt>
                  <dd className='mt-1 text-sm font-medium'>{webEditor != null ? `${webEditor.bleed} mm` : '-'}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground text-xs'>{t('products.web_editors.fields.safe_area')}</dt>
                  <dd className='mt-1 text-sm font-medium'>{webEditor != null ? `${webEditor.safe_area} mm` : '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Section 3: Templates */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('products.web_editors.detail.section_templates')}</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className='text-muted-foreground py-4 text-center text-sm'>{t('products.web_editors.templates_modal.empty')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('products.web_editors.detail.template_col_name')}</TableHead>
                      <TableHead>{t('products.web_editors.detail.template_col_status')}</TableHead>
                      <TableHead className='w-10' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((tpl) => (
                      <TableRow key={tpl.id}>
                        <TableCell className='font-medium'>{tpl.name}</TableCell>
                        <TableCell className='text-muted-foreground'>{tpl.status}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => void navigate({ to: '/products/templates/$templateId', params: { templateId: String(tpl.id) } })}
                          >
                            <ArrowRight className='size-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
