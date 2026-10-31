import { getRouteApi } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Separator } from '@/components/ui/separator';

import { useTemplateDetailQuery, useUpdateTemplateMutation, templateToFormValues } from '../api';
import type { TemplateDetail } from '../api/template.response';
import { TemplateEditor } from '../components/TemplateEditor';

// === Variables ===

const routeApi = getRouteApi('/products/templates_/$templateId');

// === Component ===

function TemplateMetadata({ template }: { template: TemplateDetail }) {
  const { t } = useTranslation('page');
  return (
    <div className='space-y-4 p-4'>
      <p className='text-sm font-semibold'>{t('products.templates.editor.metadata.title', 'Template Info')}</p>
      <dl className='space-y-3 text-sm'>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.web_editor_id', 'Web Editor ID')}</dt>
          <dd className='mt-0.5 font-medium'>{template.web_editor_id ?? '-'}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.status', 'Status')}</dt>
          <dd className='mt-0.5'>{template.status?.label ?? '-'}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.registrant', 'Registrant')}</dt>
          <dd className='mt-0.5 font-medium'>{template.registrant?.name ?? '-'}</dd>
          {template.registrant?.username && <dd className='text-muted-foreground text-xs'>@{template.registrant.username}</dd>}
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.created', 'Created')}</dt>
          <dd className='mt-0.5'>{dayjs(template.created_at).format('YYYY-MM-DD HH:mm')}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.last_modified', 'Last Modified')}</dt>
          <dd className='mt-0.5'>{dayjs(template.updated_at).format('YYYY-MM-DD HH:mm')}</dd>
        </div>
        {template.editor_size_ids?.length ? (
          <div>
            <dt className='text-muted-foreground text-xs'>{t('products.templates.editor.metadata.editor_size_ids', 'Editor Size IDs')}</dt>
            <dd className='mt-1 flex flex-wrap gap-1'>
              {template.editor_size_ids.map((sid) => (
                <span key={sid} className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
                  {sid}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      {template.front_preview_url || template.back_preview_url || template.preview_images?.length ? (
        <>
          <Separator />
          <div className='space-y-2'>
            <p className='text-sm font-medium'>{t('products.templates.editor.metadata.previews', 'Previews')}</p>
            <div className='flex flex-wrap gap-2'>
              {template.front_preview_url && (
                <div>
                  <p className='text-muted-foreground mb-1 text-xs'>{t('products.templates.editor.side.front', 'Front')}</p>
                  <img src={template.front_preview_url} alt='Front preview' className='h-20 rounded border object-contain' />
                </div>
              )}
              {template.back_preview_url && (
                <div>
                  <p className='text-muted-foreground mb-1 text-xs'>{t('products.templates.editor.side.back', 'Back')}</p>
                  <img src={template.back_preview_url} alt='Back preview' className='h-20 rounded border object-contain' />
                </div>
              )}
              {template.preview_images?.map((url, i) => (
                <div key={url}>
                  <p className='text-muted-foreground mb-1 text-xs'>#{i + 1}</p>
                  <img src={url} alt={`Preview ${i + 1}`} className='h-20 rounded border object-contain' />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function TemplateDetailPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { templateId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const id = Number(templateId);

  // === Hooks ===
  const { data: resp, isLoading } = useTemplateDetailQuery(id);
  const updateMutation = useUpdateTemplateMutation();

  // === Derived ===
  const template = resp?.data?.template;

  // === JSX return ===
  if (isLoading || !template) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground text-sm'>
          {isLoading ? tCommon('message.loading', 'Loading...') : t('products.templates.editor.not_found', 'Template not found.')}
        </p>
      </div>
    );
  }

  return (
    <TemplateEditor
      title={template.name}
      initialValues={templateToFormValues(template)}
      isPending={updateMutation.isPending}
      metadataContent={<TemplateMetadata template={template} />}
      onSubmit={(payload) => {
        updateMutation.mutate(
          { id, payload },
          {
            onSuccess: () => toast.success(tCommon('message.save_success', 'Saved.')),
            onError: () => toast.error(tCommon('message.save_failed', 'Failed to save.')),
          },
        );
      }}
      onCancel={() => void navigate({ to: '/products/templates' })}
    />
  );
}
