import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRichTextEditor, uploadPendingImages } from '@/components/shared/app-rich-text-editor';
import { PageContainer } from '@/components/shared/PageContainer';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';
import { cn } from '@/utils/cn';

import {
  useCreateShoppingSettingItemMutation,
  useDeleteShoppingSettingItemMutation,
  useShoppingSettingItemListQuery,
  useShoppingSettingsQuery,
  useUpdateShoppingSettingItemMutation,
} from '../api';
import { ShoppingGuideSectionList } from '../components';
import { DEFAULT_SHOPPING_GUIDE_SECTION, SHOPPING_GUIDE_SECTIONS } from '../constants';

type ItemDraft = {
  title: string;
  content: string;
};

type PendingNavigation = { type: 'item' | 'setting'; id: number } | { type: 'create' };

const EMPTY_ITEM_DRAFT: ItemDraft = { title: '', content: '' };

export function ShoppingSettingsPage() {
  const { t } = useTranslation();
  const [activeSettingId, setActiveSettingId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft | null>(null);
  const [newItemDraft, setNewItemDraft] = useState<ItemDraft>(EMPTY_ITEM_DRAFT);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [isEditorUploadingImage, setIsEditorUploadingImage] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<number | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);

  const { data: settingsData, isLoading: isSettingsLoading } = useShoppingSettingsQuery({ page: 1, per_page: 20 });
  const settings = useMemo(() => settingsData?.data.settings ?? [], [settingsData]);
  const translatedSections = useMemo(
    () =>
      SHOPPING_GUIDE_SECTIONS.flatMap((section) => {
        const setting = settings.find((item) => item.type === section.type);
        return setting ? [{ id: setting.id, label: t(section.labelKey, section.type) }] : [];
      }),
    [settings, t],
  );
  const activeSetting = useMemo(
    () =>
      settings.find((setting) => setting.id === activeSettingId) ??
      settings.find((setting) => setting.type === DEFAULT_SHOPPING_GUIDE_SECTION) ??
      settings[0],
    [activeSettingId, settings],
  );

  const { data: settingItems = [], isLoading: isItemsLoading } = useShoppingSettingItemListQuery(
    activeSetting ? { shopping_setting_id: activeSetting.id } : undefined,
  );
  const selectedItem = useMemo(() => settingItems.find((item) => item.id === selectedItemId) ?? settingItems[0], [selectedItemId, settingItems]);

  const createItemMutation = useCreateShoppingSettingItemMutation({
    onSuccess: (response) => {
      setIsCreatingItem(false);
      setNewItemDraft(EMPTY_ITEM_DRAFT);
      setSelectedItemId(response.data.id);
      setEditDraft(null);
      setIsPreview(true);
      toast.success(t('common.message.save_success'));
    },
    onError: () => toast.error(t('common.message.save_failed')),
  });
  const updateItemMutation = useUpdateShoppingSettingItemMutation({
    onSuccess: () => {
      setEditDraft(null);
      setIsPreview(true);
      toast.success(t('common.message.save_success'));
    },
    onError: () => toast.error(t('common.message.save_failed')),
  });
  const deleteItemMutation = useDeleteShoppingSettingItemMutation({
    onSuccess: () => {
      setEditDraft(null);
      setSelectedItemId(null);
      setItemIdToDelete(null);
      toast.success(t('page.products.shopping_settings.delete_success'));
    },
    onError: () => toast.error(t('page.products.shopping_settings.delete_failed')),
  });

  const currentDraft = isCreatingItem
    ? newItemDraft
    : selectedItem
      ? (editDraft ?? { title: selectedItem.title, content: selectedItem.content })
      : EMPTY_ITEM_DRAFT;
  const hasChanges = isCreatingItem
    ? Boolean(currentDraft.title.trim() || currentDraft.content.trim())
    : Boolean(selectedItem && (currentDraft.title !== selectedItem.title || currentDraft.content !== selectedItem.content));
  const isMutating = createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending;
  const canSave = Boolean((isCreatingItem || selectedItem) && currentDraft.title.trim() && hasChanges && !isEditorUploadingImage);
  const itemPendingDelete = settingItems.find((item) => item.id === itemIdToDelete);

  const updateCurrentDraft = (updates: Partial<ItemDraft>) => {
    if (isCreatingItem) {
      setNewItemDraft((previous) => ({ ...previous, ...updates }));
      return;
    }

    if (!selectedItem) return;
    setEditDraft((previous) => ({ ...(previous ?? { title: selectedItem.title, content: selectedItem.content }), ...updates }));
  };

  const navigateToSetting = (settingId: number) => {
    setActiveSettingId(settingId);
    setSelectedItemId(null);
    setEditDraft(null);
    setIsCreatingItem(false);
    setNewItemDraft(EMPTY_ITEM_DRAFT);
    setIsPreview(true);
  };

  const navigateToItem = (itemId: number) => {
    setIsCreatingItem(false);
    setNewItemDraft(EMPTY_ITEM_DRAFT);
    setEditDraft(null);
    setSelectedItemId(itemId);
    setIsPreview(true);
  };

  const startCreateItem = () => {
    setIsCreatingItem(true);
    setNewItemDraft(EMPTY_ITEM_DRAFT);
    setEditDraft(null);
    setSelectedItemId(null);
    setIsPreview(false);
  };

  const executeNavigation = (navigation: PendingNavigation) => {
    if (navigation.type === 'setting') {
      navigateToSetting(navigation.id);
    } else if (navigation.type === 'item') {
      navigateToItem(navigation.id);
    } else {
      startCreateItem();
    }
  };

  const requestNavigation = (navigation: PendingNavigation) => {
    if (!isPreview || hasChanges) {
      setPendingNavigation(navigation);
      return;
    }
    executeNavigation(navigation);
  };

  const handleSelectSetting = (settingId: number) => {
    if (settingId === activeSetting?.id) return;
    requestNavigation({ type: 'setting', id: settingId });
  };

  const handleSelectItem = (itemId: number) => {
    if (!isCreatingItem && itemId === selectedItem?.id) return;
    requestNavigation({ type: 'item', id: itemId });
  };

  const handleCreateItem = () => requestNavigation({ type: 'create' });

  const handleStartEdit = () => {
    if (!selectedItem || isCreatingItem) return;
    setEditDraft({ title: selectedItem.title, content: selectedItem.content });
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!activeSetting || !currentDraft.title.trim()) return;

    setIsEditorUploadingImage(true);
    const content = await uploadPendingImages(currentDraft.content, FileType.PRODUCT_IMAGES);
    setIsEditorUploadingImage(false);
    if (content === null) return;

    if (isCreatingItem) {
      createItemMutation.mutate({
        shopping_setting_id: activeSetting.id,
        title: currentDraft.title.trim(),
        content,
      });
      return;
    }

    if (selectedItem) {
      updateItemMutation.mutate({
        itemId: selectedItem.id,
        title: currentDraft.title.trim(),
        content,
      });
    }
  };

  const handleCancel = () => {
    if (isCreatingItem) {
      setIsCreatingItem(false);
      setNewItemDraft(EMPTY_ITEM_DRAFT);
      setIsPreview(true);
      return;
    }

    if (!selectedItem) return;
    setEditDraft(null);
    setIsPreview(true);
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.products.shopping_settings.title')}</h1>
        {/* <p className='text-muted-foreground mt-1 text-sm'>{t('page.products.shopping_settings.description')}</p> */}
      </div>

      <Separator />

      {isSettingsLoading ? (
        <div className='bg-card flex min-h-60 items-center justify-center rounded-xl border'>
          <Loader2 className='text-muted-foreground size-5 animate-spin' />
        </div>
      ) : settings.length === 0 ? (
        <div className='bg-card text-muted-foreground flex min-h-60 items-center justify-center rounded-xl border text-sm'>
          {t('common.message.no_data')}
        </div>
      ) : (
        <div className='grid gap-4 lg:grid-cols-[280px_1fr]'>
          <aside className='bg-card rounded-xl border p-3'>
            <ShoppingGuideSectionList sections={translatedSections} activeId={activeSetting?.id ?? null} onSelect={handleSelectSetting} />

            <Separator className='my-3' />

            <div className='mb-2 flex items-center justify-between gap-2 px-1'>
              <p className='text-sm font-medium'>{t('page.products.shopping_settings.items')}</p>
              <AppButton type='button' size='sm' variant='outline' onClick={handleCreateItem} disabled={isMutating} leftIcon={<Plus />}>
                {t('page.products.shopping_settings.add_item')}
              </AppButton>
            </div>

            {isItemsLoading ? (
              <div className='flex h-16 items-center justify-center'>
                <Loader2 className='text-muted-foreground size-4 animate-spin' />
              </div>
            ) : settingItems.length === 0 ? (
              <p className='text-muted-foreground px-1 py-2 text-sm'>{t('common.message.no_data')}</p>
            ) : (
              <div className='max-h-72 space-y-1 overflow-y-auto'>
                {settingItems.map((item) => (
                  <AppButton
                    key={item.id}
                    type='button'
                    variant='ghost'
                    className={cn(
                      'h-auto w-full cursor-pointer justify-start px-3 py-2 text-left font-normal',
                      !isCreatingItem && selectedItem?.id === item.id && 'bg-muted font-medium',
                    )}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    {item.title}
                  </AppButton>
                ))}
              </div>
            )}
          </aside>

          <section className='bg-card rounded-xl border p-4'>
            {isItemsLoading && !isCreatingItem ? (
              <div className='flex min-h-96 items-center justify-center'>
                <Loader2 className='text-muted-foreground size-5 animate-spin' />
              </div>
            ) : !isCreatingItem && !selectedItem ? (
              <div className='flex min-h-96 flex-col items-center justify-center gap-3'>
                <p className='text-muted-foreground text-sm'>{t('page.products.shopping_settings.no_items')}</p>
                <AppButton onClick={handleCreateItem} leftIcon={<Plus />}>
                  {t('page.products.shopping_settings.add_item')}
                </AppButton>
              </div>
            ) : (
              <>
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    {isPreview ? (
                      <h2 className='text-base font-semibold'>{currentDraft.title}</h2>
                    ) : (
                      <div>
                        <label htmlFor='shopping-setting-item-title' className='text-sm font-medium'>
                          {t('page.products.shopping_settings.item_title')}
                        </label>
                        <Input
                          id='shopping-setting-item-title'
                          value={currentDraft.title}
                          onChange={(event) => updateCurrentDraft({ title: event.target.value })}
                          placeholder={t('page.products.shopping_settings.item_title_placeholder')}
                          disabled={isMutating}
                          className='mt-1 h-9'
                        />
                      </div>
                    )}
                    <p className='text-muted-foreground mt-1 text-sm'>{t('page.products.shopping_settings.editor_help')}</p>
                  </div>

                  <div className='flex shrink-0 items-center gap-2'>
                    {isPreview && !isCreatingItem && (
                      <AppButton type='button' variant='ghost' onClick={handleStartEdit} disabled={isMutating}>
                        {t('common.action.edit')}
                      </AppButton>
                    )}
                    {!isCreatingItem && selectedItem && (
                      <AppButton
                        type='button'
                        variant='ghost'
                        className='text-destructive hover:text-destructive'
                        onClick={() => setItemIdToDelete(selectedItem.id)}
                        disabled={isMutating || isEditorUploadingImage}
                        leftIcon={<Trash2 />}
                      >
                        {t('common.action.delete')}
                      </AppButton>
                    )}
                    {!isPreview && (
                      <>
                        <AppButton type='button' variant='outline' onClick={handleCancel} disabled={isMutating || isEditorUploadingImage}>
                          {t('common.action.cancel')}
                        </AppButton>
                        <AppButton
                          type='button'
                          onClick={handleSave}
                          disabled={!canSave || isMutating}
                          isLoading={createItemMutation.isPending || updateItemMutation.isPending}
                        >
                          {t('common.action.save')}
                        </AppButton>
                      </>
                    )}
                  </div>
                </div>

                {isPreview ? (
                  <div className='min-h-96 rounded-lg border p-4'>
                    {currentDraft.content ? (
                      <div className='app-rich-text-editor__content'>
                        <div className='tiptap' dangerouslySetInnerHTML={{ __html: currentDraft.content }} />
                      </div>
                    ) : (
                      <p className='text-muted-foreground text-sm'>{t('page.products.shopping_settings.no_content')}</p>
                    )}
                  </div>
                ) : (
                  <AppRichTextEditor
                    value={currentDraft.content}
                    onValueChange={(content) => updateCurrentDraft({ content })}
                    placeholder={t('page.products.shopping_settings.editor_placeholder')}
                    minHeight={360}
                    maxLength={20000}
                    imageUploadMode='deferred'
                  />
                )}
              </>
            )}
          </section>
        </div>
      )}

      <AppDialogModal
        isOpen={itemIdToDelete !== null}
        setIsOpen={(isOpen) => !isOpen && setItemIdToDelete(null)}
        title={t('common.action.delete')}
        okText={t('common.action.delete')}
        cancelText={t('common.action.cancel')}
        confirmLoading={deleteItemMutation.isPending}
        onOk={() => itemIdToDelete !== null && deleteItemMutation.mutate(itemIdToDelete)}
      >
        <p className='text-sm'>{t('page.products.shopping_settings.delete_item_confirmation', { title: itemPendingDelete?.title ?? '' })}</p>
      </AppDialogModal>

      <AppDialogModal
        isOpen={pendingNavigation !== null}
        setIsOpen={(isOpen) => !isOpen && setPendingNavigation(null)}
        title={t('page.products.shopping_settings.discard_changes_title')}
        okText={t('page.products.shopping_settings.discard_changes_confirm')}
        cancelText={t('common.action.cancel')}
        onOk={() => {
          if (!pendingNavigation) return;
          executeNavigation(pendingNavigation);
          setPendingNavigation(null);
        }}
      >
        <p className='text-sm'>{t('page.products.shopping_settings.discard_changes_description')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
