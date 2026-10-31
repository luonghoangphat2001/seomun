import { Link } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
  usePermissionDetailQuery,
  usePermissionMenuSettingsQuery,
  useUpdatePermissionMenuSettingsMutation,
  useUpdatePermissionMutation,
} from '../api/permission.query';
import type { PermissionMenuSettingsRESP, PermissionRESP } from '../api/permission.response';
import { PERMISSION_STATUS_STYLES } from '../components/PermissionColumns';
import { PermissionFormDialog } from '../components/PermissionFormDialog';
import { PermissionMenuMatrix, type PermissionMatrixNavItem } from '../components/PermissionMenuMatrix';
import { PermissionAction, PermissionUsageStatus } from '../enums';
import type { PermissionFormValues } from '../schemas';

const VIEW_ACTIONS = [PermissionAction.REGISTER, PermissionAction.VIEW, PermissionAction.EDIT, PermissionAction.APPROVAL, PermissionAction.DELETE];

/** Union of both sources */
function getGrantedMenuKeys(settings?: PermissionMenuSettingsRESP['data'], permission?: PermissionRESP | null) {
  const groups = settings?.groups ?? settings?.menu_structure ?? [];
  const menuPermissions = [...(permission?.menu_permissions ?? []), ...(settings?.permission?.menu_permissions ?? [])];

  return new Set([
    ...groups.flatMap((group) => group.menus ?? []).flatMap((menu) => (menu.show_in_navigation ? [String(menu.key)] : [])),
    ...menuPermissions.flatMap((item) => (item.actions.length > 0 ? [String(item.menu)] : [])),
  ]);
}

type PermissionDetailPageProps = {
  permissionId: number;
  navItems: PermissionMatrixNavItem[];
};

export function PermissionDetailPage({ permissionId, navItems }: PermissionDetailPageProps) {
  const { t } = useTranslation();
  const { data: permission } = usePermissionDetailQuery(permissionId);
  const { data: settingsResponse, isLoading } = usePermissionMenuSettingsQuery(permissionId);
  const updateMutation = useUpdatePermissionMenuSettingsMutation(permissionId);
  const updateInfoMutation = useUpdatePermissionMutation(permissionId);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  const grantedKeys = useMemo(() => getGrantedMenuKeys(settingsResponse?.data, permission), [settingsResponse, permission]);
  const selectedKeys = useMemo(() => {
    const keys = new Set(grantedKeys);
    Object.entries(overrides).forEach(([key, checked]) => (checked ? keys.add(key) : keys.delete(key)));
    return keys;
  }, [grantedKeys, overrides]);
  const isDirty = Object.entries(overrides).some(([key, checked]) => grantedKeys.has(key) !== checked);

  const handleChange = (menuKeys: string[], checked: boolean) => {
    setOverrides((previous) => ({ ...previous, ...Object.fromEntries(menuKeys.map((key) => [key, checked])) }));
  };

  const handleSave = () => {
    updateMutation.mutate(
      { menu_permissions: [...selectedKeys].map((menu) => ({ menu, actions: VIEW_ACTIONS })) },
      {
        onSuccess: () => {
          toast.success(t('page.permissions.settings.messages.update_success'));
          setOverrides({});
        },
        onError: (error) => {
          toast.error(error.response?.data?.message ?? error.message ?? t('page.permissions.settings.messages.update_error'));
        },
      },
    );
  };

  const handleSubmitInfo = (values: PermissionFormValues) => {
    updateInfoMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('page.permissions.list.messages.update_success'));
        setIsFormOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? error.message ?? t('page.permissions.list.messages.update_error'));
      },
    });
  };

  const status = permission?.usage_status.value;

  return (
    <PageContainer>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='truncate text-xl font-semibold'>{permission?.name ?? t('page.permissions.settings.title')}</h1>
            {status && (
              <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${PERMISSION_STATUS_STYLES[status]}`}>
                {status === PermissionUsageStatus.ACTIVE ? t('page.permissions.status.active') : t('page.permissions.status.inactive')}
              </span>
            )}
          </div>
          <p className='text-muted-foreground mt-0.5 text-sm'>{permission?.description || t('page.permissions.settings.description')}</p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link to='/permissions'>
              <ArrowLeft className='size-4' />
              {t('common.action.back')}
            </Link>
          </Button>
          <Button variant='outline' size='sm' className='gap-1.5' disabled={!permission} onClick={() => setIsFormOpen(true)}>
            <Pencil className='size-4' />
            {t('common.action.edit')}
          </Button>
          <Button size='sm' className='gap-1.5' disabled={!isDirty || updateMutation.isPending} onClick={handleSave}>
            {updateMutation.isPending ? <Loader2 className='size-4 animate-spin' /> : <Save className='size-4' />}
            {t('common.action.save')}
          </Button>
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <Skeleton className='h-96 w-full' />
      ) : (
        <PermissionMenuMatrix navItems={navItems} selectedKeys={selectedKeys} disabled={updateMutation.isPending} onChange={handleChange} />
      )}

      <PermissionFormDialog
        open={isFormOpen}
        permission={permission}
        isPending={updateInfoMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitInfo}
      />
    </PageContainer>
  );
}
