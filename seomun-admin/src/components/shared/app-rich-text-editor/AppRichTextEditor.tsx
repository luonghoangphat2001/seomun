import type { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { TableRow } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder, Selection } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Grid2x2,
  Heading3,
  Highlighter,
  ImageIcon,
  ImageUp,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  PaintBucket,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  SeparatorHorizontal,
  SquareDashed,
  Strikethrough,
  Table2,
  TableCellsSplit,
  TableColumnsSplit,
  TableRowsSplit,
  Trash2,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { CellBorderIcon } from './components/CellBorderIcon';
import { EditorButton, TextColorPicker, ToolbarDivider, ToolbarMenu, ToolbarSelect } from './components/ToolbarControls';
import {
  EDITOR_DISABLED_TOOLTIPS,
  EMPTY_TOOLBAR_STATE,
  CELL_BORDER_ACTION_GROUPS,
  HORIZONTAL_RULE_THICKNESS_OPTIONS,
  IMAGE_CAPTION_POSITIONS,
  IMAGE_RESIZE_CONFIG,
} from './constants';
import { insertImageFigure, RichTextImageFigure } from './rich-text-figure.extension';
import { RichTextHorizontalRule } from './rich-text-horizontal-rule.extension';
import { RichTextImage } from './rich-text-image.extension';
import { RichTextTable, RichTextTableCell, RichTextTableHeader, setCellBorders } from './rich-text-table.extension';
import type { AppRichTextEditorProps, CellBorderAction, ImageCaptionPosition } from './types';
import { addPendingImage, resolveImageUrlFromPrompt } from './utils';

export function AppRichTextEditor({
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Write something...',
  disabled = false,
  readOnly = false,
  isInvalid = false,
  minHeight = 240,
  maxLength,
  imageUploadMode = 'url',
  onImageUpload,
  onImageUploadingChange,
  className,
}: AppRichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageCaptionPosition, setImageCaptionPosition] = useState<ImageCaptionPosition>('below');
  const { t } = useTranslation('page');
  const imageCaptionPositionOptions = useMemo(
    () => IMAGE_CAPTION_POSITIONS.map((position) => ({ value: position, label: t(`rich_text_editor.caption_position.${position}`) })),
    [t],
  );
  const cellBorderGroups = useMemo(
    () =>
      CELL_BORDER_ACTION_GROUPS.map((actions) =>
        actions.map((action) => ({
          value: action,
          label: t(`rich_text_editor.cell_border.${action}`),
          icon: <CellBorderIcon action={action} className='size-5' />,
        })),
      ),
    [t],
  );
  const isEditable = !disabled && !readOnly;

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
        link: {
          autolink: true,
          linkOnPaste: true,
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        },
      }),
      RichTextImageFigure,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Selection,
      RichTextHorizontalRule,
      TextStyle,
      Color,
      BackgroundColor,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      RichTextImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'app-rich-text-editor__image',
        },
        resize: IMAGE_RESIZE_CONFIG,
      }),
      RichTextTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'app-rich-text-editor__table',
        },
      }),
      TableRow,
      RichTextTableHeader,
      RichTextTableCell,
    ],
    [maxLength, placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value ?? defaultValue ?? '',
    editable: isEditable,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: currentEditor }) => {
      queueMicrotask(() => onValueChange?.(currentEditor.getHTML()));
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return EMPTY_TOOLBAR_STATE;
      }

      return {
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
        isParagraph: currentEditor.isActive('paragraph'),
        isHeading1: currentEditor.isActive('heading', { level: 1 }),
        isHeading2: currentEditor.isActive('heading', { level: 2 }),
        isHeading3: currentEditor.isActive('heading', { level: 3 }),
        isBold: currentEditor.isActive('bold'),
        isItalic: currentEditor.isActive('italic'),
        isUnderline: currentEditor.isActive('underline'),
        isStrike: currentEditor.isActive('strike'),
        isCode: currentEditor.isActive('code'),
        textColor: (currentEditor.getAttributes('textStyle').color as string | undefined) ?? '',
        textBackgroundColor: (currentEditor.getAttributes('textStyle').backgroundColor as string | undefined) ?? '',
        isBulletList: currentEditor.isActive('bulletList'),
        isOrderedList: currentEditor.isActive('orderedList'),
        isBlockquote: currentEditor.isActive('blockquote'),
        isCodeBlock: currentEditor.isActive('codeBlock'),
        isHorizontalRule: currentEditor.isActive('horizontalRule'),
        horizontalRuleThickness: Number(currentEditor.getAttributes('horizontalRule').thickness ?? 1),
        isAlignLeft:
          currentEditor.isActive({ textAlign: 'left' }) ||
          currentEditor.isActive('horizontalRule', { align: 'left' }) ||
          currentEditor.isActive('imageFigure', { align: 'left' }),
        isAlignCenter:
          currentEditor.isActive({ textAlign: 'center' }) ||
          currentEditor.isActive('horizontalRule', { align: 'center' }) ||
          currentEditor.isActive('imageFigure', { align: 'center' }),
        isAlignRight:
          currentEditor.isActive({ textAlign: 'right' }) ||
          currentEditor.isActive('horizontalRule', { align: 'right' }) ||
          currentEditor.isActive('imageFigure', { align: 'right' }),
        isAlignJustify: currentEditor.isActive({ textAlign: 'justify' }),
        isLink: currentEditor.isActive('link'),
        isTable: currentEditor.isActive('table'),
        isTableBorderless: Boolean(currentEditor.getAttributes('table').borderless),
        cellBackgroundColor:
          ((currentEditor.getAttributes('tableCell').backgroundColor ?? currentEditor.getAttributes('tableHeader').backgroundColor) as
            | string
            | undefined) ?? '',
        characterCount: currentEditor.storage.characterCount.characters(),
        wordCount: currentEditor.storage.characterCount.words(),
      };
    },
  });

  useEffect(() => {
    editor?.setEditable(isEditable);
  }, [editor, isEditable]);

  useEffect(() => {
    onImageUploadingChange?.(isUploadingImage);
  }, [isUploadingImage, onImageUploadingChange]);

  useEffect(() => {
    if (!editor || value === undefined || value === editor.getHTML()) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const runCommand = useCallback(
    (command: (editor: Editor) => boolean) => {
      if (!editor || !isEditable) {
        return;
      }

      command(editor);
    },
    [editor, isEditable],
  );

  const handleSetLink = useCallback(() => {
    if (!editor || !isEditable) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previousUrl ?? '')?.trim();

    if (url === undefined) {
      return;
    }

    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor, isEditable]);

  const insertImage = useCallback(
    (src: string) => {
      if (!editor || !isEditable || !src) {
        return;
      }

      insertImageFigure(editor, src, imageCaptionPosition);
    },
    [editor, imageCaptionPosition, isEditable],
  );

  const canUploadImage = Boolean(onImageUpload) || imageUploadMode === 'deferred';

  const handleImageUrlAction = useCallback(() => {
    if (!editor || !isEditable) {
      return;
    }

    const currentUrl = editor.getAttributes('image').src as string | undefined;
    const url = resolveImageUrlFromPrompt(currentUrl ?? '');

    if (url) {
      insertImage(url);
    }
  }, [editor, insertImage, isEditable]);

  const handleImageFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file || !isEditable) {
        return;
      }

      if (!onImageUpload) {
        insertImage(addPendingImage(file));
        return;
      }

      try {
        setIsUploadingImage(true);
        const uploadedUrl = await onImageUpload(file);

        if (!uploadedUrl) {
          return;
        }

        insertImage(uploadedUrl);
      } catch (error) {
        console.error('Rich text image upload failed:', error);
        toast.error('Image upload failed.');
      } finally {
        setIsUploadingImage(false);
      }
    },
    [insertImage, isEditable, onImageUpload],
  );

  // The align buttons also position a selected horizontal rule (its own `align` attribute; hr has no text-align).
  const setAlignment = useCallback(
    (alignment: 'left' | 'center' | 'right') => {
      if (!editor || !isEditable) {
        return;
      }

      if (editor.isActive('horizontalRule')) {
        editor.chain().focus().updateAttributes('horizontalRule', { align: alignment }).run();
        return;
      }

      // Anywhere inside an image figure (row or caption), the whole figure is aligned.
      if (editor.isActive('imageFigure')) {
        editor.chain().focus().updateAttributes('imageFigure', { align: alignment }).run();
        return;
      }

      editor.chain().focus().setTextAlign(alignment).run();
    },
    [editor, isEditable],
  );

  const setTextColor = useCallback(
    (color: string) => {
      if (!editor || !isEditable || !color) {
        return;
      }

      // No focus(): it would pull focus out of the open color picker on every drag update.
      editor.chain().setColor(color).run();
    },
    [editor, isEditable],
  );

  const currentToolbarState = toolbarState ?? EMPTY_TOOLBAR_STATE;
  const toolbarDisabled = !editor || !isEditable;
  const characterLimitExceeded = Boolean(maxLength && currentToolbarState.characterCount > maxLength);

  return (
    <div
      className={cn(
        'border-input bg-background overflow-clip rounded-lg border transition-colors',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3',
        disabled && 'bg-input/50 cursor-not-allowed opacity-50',
        readOnly && !disabled && 'bg-muted/40 border-border/80',
        (isInvalid || characterLimitExceeded) && 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        className,
      )}
      data-invalid={isInvalid || characterLimitExceeded ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-readonly={readOnly ? 'true' : undefined}
    >
      <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleImageFileChange} disabled={toolbarDisabled} />

      <TooltipProvider>
        {/* Sticky while scrolling long content; the wrapper uses overflow-clip because overflow-hidden would break sticky. */}
        <div className='bg-muted sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2'>
          <EditorButton
            label='Undo'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.nothingToUndo}
            icon={Undo2}
            disabled={toolbarDisabled || !currentToolbarState.canUndo}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().undo().run())}
          />
          <EditorButton
            label='Redo'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.nothingToRedo}
            icon={Redo2}
            disabled={toolbarDisabled || !currentToolbarState.canRedo}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().redo().run())}
          />

          <ToolbarDivider />

          <EditorButton
            label='Paragraph'
            icon={Pilcrow}
            active={currentToolbarState.isParagraph}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setParagraph().run())}
          />
          <EditorButton
            label='Heading 1'
            icon={Heading1}
            active={currentToolbarState.isHeading1}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 1 }).run())}
          />
          <EditorButton
            label='Heading 2'
            icon={Heading2}
            active={currentToolbarState.isHeading2}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 2 }).run())}
          />
          <EditorButton
            label='Heading 3'
            icon={Heading3}
            active={currentToolbarState.isHeading3}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 3 }).run())}
          />

          <ToolbarDivider />

          <EditorButton
            label='Bold'
            icon={Bold}
            active={currentToolbarState.isBold}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBold().run())}
          />
          <EditorButton
            label='Italic'
            icon={Italic}
            active={currentToolbarState.isItalic}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleItalic().run())}
          />
          <EditorButton
            label='Underline'
            icon={Underline}
            active={currentToolbarState.isUnderline}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleUnderline().run())}
          />
          <EditorButton
            label='Strike'
            icon={Strikethrough}
            active={currentToolbarState.isStrike}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleStrike().run())}
          />
          <EditorButton
            label='Inline code'
            icon={Code}
            active={currentToolbarState.isCode}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleCode().run())}
          />
          <TextColorPicker value={currentToolbarState.textColor} onChange={setTextColor} disabled={toolbarDisabled} />
          <TextColorPicker
            label='Text background color'
            icon={Highlighter}
            value={currentToolbarState.textBackgroundColor}
            onChange={(color) => runCommand((currentEditor) => currentEditor.chain().setBackgroundColor(color).run())}
            disabled={toolbarDisabled}
          />

          <ToolbarDivider />

          <EditorButton
            label='Bullet list'
            icon={List}
            active={currentToolbarState.isBulletList}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBulletList().run())}
          />
          <EditorButton
            label='Ordered list'
            icon={ListOrdered}
            active={currentToolbarState.isOrderedList}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleOrderedList().run())}
          />
          <EditorButton
            label='Blockquote'
            icon={Quote}
            active={currentToolbarState.isBlockquote}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBlockquote().run())}
          />
          <EditorButton
            label='Code block'
            icon={Rows3}
            active={currentToolbarState.isCodeBlock}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleCodeBlock().run())}
          />
          <EditorButton
            label='Horizontal rule'
            icon={SeparatorHorizontal}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setHorizontalRule().run())}
          />
          <ToolbarSelect
            label='Line thickness'
            className='w-18'
            value={String(currentToolbarState.horizontalRuleThickness)}
            options={HORIZONTAL_RULE_THICKNESS_OPTIONS}
            onChange={(thickness) =>
              runCommand((currentEditor) =>
                currentEditor
                  .chain()
                  .focus()
                  .updateAttributes('horizontalRule', { thickness: Number(thickness) })
                  .run(),
              )
            }
            disabled={toolbarDisabled || !currentToolbarState.isHorizontalRule}
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectHorizontalRuleToEdit}
          />

          <ToolbarDivider />

          <EditorButton
            label='Align left'
            icon={AlignLeft}
            active={currentToolbarState.isAlignLeft}
            disabled={toolbarDisabled}
            onClick={() => setAlignment('left')}
          />
          <EditorButton
            label='Align center'
            icon={AlignCenter}
            active={currentToolbarState.isAlignCenter}
            disabled={toolbarDisabled}
            onClick={() => setAlignment('center')}
          />
          <EditorButton
            label='Align right'
            icon={AlignRight}
            active={currentToolbarState.isAlignRight}
            disabled={toolbarDisabled}
            onClick={() => setAlignment('right')}
          />
          <EditorButton
            label='Align justify'
            icon={AlignJustify}
            active={currentToolbarState.isAlignJustify}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setTextAlign('justify').run())}
          />

          <ToolbarDivider />

          <EditorButton label='Set link' icon={LinkIcon} active={currentToolbarState.isLink} disabled={toolbarDisabled} onClick={handleSetLink} />
          <EditorButton
            label='Remove link'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectLinkToRemove}
            icon={Unlink}
            disabled={toolbarDisabled || !currentToolbarState.isLink}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().unsetLink().run())}
          />
          {canUploadImage ? (
            <EditorButton
              label='Upload image'
              icon={ImageUp}
              disabled={toolbarDisabled || isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
            />
          ) : null}
          <EditorButton label='Insert image URL' icon={ImageIcon} disabled={toolbarDisabled} onClick={handleImageUrlAction} />
          <ToolbarSelect
            label={t('rich_text_editor.caption_position.label')}
            className='w-34'
            value={imageCaptionPosition}
            options={imageCaptionPositionOptions}
            onChange={(position) => setImageCaptionPosition(position as ImageCaptionPosition)}
            disabled={toolbarDisabled}
          />

          <ToolbarDivider />

          <EditorButton
            label='Insert table'
            icon={Table2}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
          />
          <EditorButton
            label='Add row after'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={Rows3}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().addRowAfter().run())}
          />
          <EditorButton
            label='Add column after'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={TableCellsSplit}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().addColumnAfter().run())}
          />
          <EditorButton
            label='Delete row'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={TableRowsSplit}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().deleteRow().run())}
          />
          <EditorButton
            label='Delete column'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={TableColumnsSplit}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().deleteColumn().run())}
          />
          <TextColorPicker
            label='Cell background color'
            icon={PaintBucket}
            value={currentToolbarState.cellBackgroundColor}
            onChange={(color) => runCommand((currentEditor) => currentEditor.chain().setCellAttribute('backgroundColor', color).run())}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
          />
          <ToolbarMenu
            label={t('rich_text_editor.cell_border.label')}
            icon={Grid2x2}
            groups={cellBorderGroups}
            onSelect={(action) =>
              runCommand((currentEditor) =>
                currentEditor
                  .chain()
                  .focus()
                  .command(({ state, tr }) => setCellBorders(state, tr, action as CellBorderAction))
                  .run(),
              )
            }
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
          />
          <EditorButton
            label={currentToolbarState.isTableBorderless ? 'Show table border' : 'Hide table border'}
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={SquareDashed}
            active={currentToolbarState.isTableBorderless}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() =>
              runCommand((currentEditor) =>
                currentEditor.chain().focus().updateAttributes('table', { borderless: !currentToolbarState.isTableBorderless }).run(),
              )
            }
          />
          <EditorButton
            label='Delete table'
            disabledLabel={EDITOR_DISABLED_TOOLTIPS.selectTableToEdit}
            icon={Trash2}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().deleteTable().run())}
          />

          <ToolbarDivider />

          <EditorButton
            label='Clear formatting'
            icon={RemoveFormatting}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().unsetAllMarks().clearNodes().run())}
          />
        </div>
      </TooltipProvider>

      <EditorContent
        editor={editor}
        className='app-rich-text-editor__content'
        style={{
          minHeight,
        }}
      />

      {maxLength ? (
        <div
          className={cn(
            'text-muted-foreground flex items-center justify-end gap-2 border-t px-3 py-2 text-xs',
            characterLimitExceeded && 'text-destructive',
          )}
        >
          <span>
            {currentToolbarState.characterCount}/{maxLength} characters
          </span>
          <span aria-hidden='true'>·</span>
          <span>{currentToolbarState.wordCount} words</span>
        </div>
      ) : null}
    </div>
  );
}
