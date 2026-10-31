import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppRichTextEditor, uploadPendingImages } from '@/components/shared/app-rich-text-editor';
import { AppSwitch } from '@/components/shared/app-switch';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';

import { useBoardConfigsQuery, useUpdateBoardConfigMutation } from '../api/board.query';
import type { BoardItem } from '../api/board.response';
import { BoardTypeList, type BoardTypeListSection } from '../components/BoardTypeList';
import { BOARD_TYPE_GROUPS } from '../constants';
import type { BoardType } from '../enum';

type BoardDraft = {
  notice_enabled: boolean;
  notice_message: string;
};

const GROUPED_BOARD_TYPES = BOARD_TYPE_GROUPS.flatMap((group) => group.types);

export function BoardConfigPage() {
  // === Hooks ===
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const { data: configs, isLoading } = useBoardConfigsQuery();
  const updateMutation = useUpdateBoardConfigMutation();

  // === State ===
  const [activeType, setActiveType] = useState<BoardType | undefined>();
  const [draftByType, setDraftByType] = useState<Partial<Record<BoardType, BoardDraft>>>({});
  const [isPreview, setIsPreview] = useState(false);
  const [isEditorUploadingImage, setIsEditorUploadingImage] = useState(false);

  // === Variables ===
  const getTypeLabel = (boardType: BoardType) => t(`board_configs.type.${boardType}`, { defaultValue: boardType });

  const sections = useMemo<BoardTypeListSection[]>(() => {
    const toItem = (config: BoardItem) => ({
      boardType: config.board_type,
      label: getTypeLabel(config.board_type),
      noticeEnabled: config.notice_enabled,
    });

    const grouped = BOARD_TYPE_GROUPS.map((group) => ({
      label: t(group.labelKey),
      items: group.types.flatMap((boardType) => (configs ?? []).filter((config) => config.board_type === boardType).map(toItem)),
    }));

    // Board types the API added but the menu grouping doesn't know about yet.
    const ungrouped = (configs ?? []).filter((config) => !GROUPED_BOARD_TYPES.includes(config.board_type));
    if (ungrouped.length > 0) {
      grouped.push({ label: t('board_configs.group.other'), items: ungrouped.map(toItem) });
    }

    return grouped.filter((group) => group.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs, t]);

  const firstBoardType = sections[0]?.items[0]?.boardType;
  const activeConfig = configs?.find((config) => config.board_type === (activeType ?? firstBoardType));

  const savedDraft: BoardDraft = {
    notice_enabled: activeConfig?.notice_enabled ?? false,
    notice_message: activeConfig?.notice_message ?? '',
  };

  const currentDraft = (activeConfig && draftByType[activeConfig.board_type]) ?? savedDraft;
  const hasChanges = currentDraft.notice_enabled !== savedDraft.notice_enabled || currentDraft.notice_message !== savedDraft.notice_message;

  // === Functions ===
  const patchDraft = (patch: Partial<BoardDraft>) => {
    if (!activeConfig) return;
    setDraftByType((prev) => ({ ...prev, [activeConfig.board_type]: { ...currentDraft, ...patch } }));
  };

  const clearDraft = () => {
    if (!activeConfig) return;
    setDraftByType((prev) => {
      const next = { ...prev };
      delete next[activeConfig.board_type];
      return next;
    });
  };

  const handleSave = async () => {
    if (!activeConfig) return;

    setIsEditorUploadingImage(true);
    const noticeMessage = await uploadPendingImages(currentDraft.notice_message, FileType.NOTICE_ATTACHMENTS);
    setIsEditorUploadingImage(false);
    if (noticeMessage === null) return;

    updateMutation.mutate(
      {
        boardType: activeConfig.board_type,
        notice_enabled: currentDraft.notice_enabled,
        notice_message: noticeMessage.trim() ? noticeMessage : null,
      },
      {
        onSuccess: () => {
          clearDraft();
          toast.success(tMessage('board_configs.update.success'));
        },
        onError: () => toast.error(tMessage('board_configs.update.error')),
      },
    );
  };

  const isBusy = updateMutation.isPending || isEditorUploadingImage;

  // === JSX ===
  return (
    <PageContainer className='lg:h-full'>
      <div>
        <h1 className='text-xl font-semibold'>{t('board_configs.title')}</h1>
        {/* <p className='text-muted-foreground mt-1 text-sm'>{t('board_configs.description')}</p> */}
      </div>

      <Separator />

      {isLoading ? (
        <div className='bg-card flex min-h-60 items-center justify-center rounded-xl border'>
          <Loader2 className='text-muted-foreground size-5 animate-spin' />
        </div>
      ) : (
        <div className='grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[280px_1fr]'>
          <BoardTypeList sections={sections} activeType={activeConfig?.board_type} onSelect={setActiveType} />

          <div className='bg-card scrollbar-thin min-h-0 overflow-y-auto rounded-xl border p-4'>
            <div className='mb-3 flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-base font-semibold'>{activeConfig ? getTypeLabel(activeConfig.board_type) : '-'}</h2>
                <p className='text-muted-foreground text-sm'>{t('board_configs.editor_help')}</p>
              </div>

              <div className='flex items-center gap-2'>
                <AppButton type='button' variant='ghost' className='cursor-pointer' onClick={() => setIsPreview((prev) => !prev)}>
                  {isPreview ? tCommon('action.edit') : tCommon('action.preview')}
                </AppButton>
                <AppButton type='button' variant='outline' className='cursor-pointer' onClick={clearDraft} disabled={!hasChanges || isBusy}>
                  {tCommon('action.cancel')}
                </AppButton>
                <AppButton
                  type='button'
                  className='cursor-pointer'
                  onClick={handleSave}
                  disabled={!hasChanges || !activeConfig || isBusy}
                  isLoading={updateMutation.isPending}
                >
                  {tCommon('action.save')}
                </AppButton>
              </div>
            </div>

            <div className='mb-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2'>
              <div>
                <p className='text-sm font-medium'>{t('board_configs.notice_enabled')}</p>
                <p className='text-muted-foreground text-xs'>{t('board_configs.notice_enabled_help')}</p>
              </div>
              <AppSwitch
                checked={currentDraft.notice_enabled}
                disabled={!activeConfig || isBusy}
                aria-label={t('board_configs.notice_enabled')}
                onValueChange={(checked) => patchDraft({ notice_enabled: checked })}
              />
            </div>

            {isPreview ? (
              <div className='min-h-60 rounded-lg border p-4'>
                {currentDraft.notice_message ? (
                  <div className='app-rich-text-editor__content'>
                    <div className='tiptap' dangerouslySetInnerHTML={{ __html: currentDraft.notice_message }} />
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>{tCommon('message.no_data')}</p>
                )}
              </div>
            ) : (
              <AppRichTextEditor
                value={currentDraft.notice_message}
                onValueChange={(html) => patchDraft({ notice_message: html })}
                placeholder={t('board_configs.editor_placeholder')}
                minHeight={360}
                maxLength={20000}
                imageUploadMode='deferred'
              />
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
