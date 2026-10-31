import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCreateTemplateMutation } from '../api';
import { TemplateEditor } from '../components/TemplateEditor';

export function TemplateCreatePage() {
  const { t } = useTranslation('page');
  const navigate = useNavigate();
  const createMutation = useCreateTemplateMutation();

  return (
    <TemplateEditor
      title={t('products.templates.editor.create_title', 'Add Template')}
      isPending={createMutation.isPending}
      onSubmit={(payload) => {
        createMutation.mutate(payload, {
          onSuccess: (data) => {
            toast.success(t('products.templates.editor.toast.create_success', 'Template created.'));
            void navigate({ to: '/products/templates/$templateId', params: { templateId: String(data.data.template.id) } });
          },
          onError: () => toast.error(t('products.templates.editor.toast.create_error', 'Failed to create template.')),
        });
      }}
      onCancel={() => void navigate({ to: '/products/templates' })}
    />
  );
}
