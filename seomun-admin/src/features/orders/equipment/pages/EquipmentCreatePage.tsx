import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { useCreateEquipmentMutation } from '../api/equipment.query';
import { EquipmentForm } from '../components/EquipmentForm';
import type { EquipmentFormValues } from '../schemas/equipment-form.schema';

export function EquipmentCreatePage() {
  const { t } = useTranslation('page');
  const navigate = useNavigate();
  const createMutation = useCreateEquipmentMutation({
    onSuccess: (response) => {
      toast.success(t('orders.equipment.create.success', 'Equipment registered.'));
      void navigate({
        to: '/orders/equipment/$equipmentId',
        params: { equipmentId: String(response.data.equipment.id) },
      });
    },
    onError: () => {
      toast.error(t('orders.equipment.create.error', 'Failed to register equipment.'));
    },
  });

  const handleSubmit = (values: EquipmentFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('orders.equipment.create.title', 'Register Equipment')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>
          {t('orders.equipment.create.description', 'Create a new equipment record with its image, work process, and current status.')}
        </p> */}
      </div>

      <Separator />

      <EquipmentForm isPending={createMutation.isPending} onCancel={() => void navigate({ to: '/orders/equipment' })} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
