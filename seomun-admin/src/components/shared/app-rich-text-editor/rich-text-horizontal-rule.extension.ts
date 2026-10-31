import { ResizableNodeView } from '@tiptap/core';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

const MIN_WIDTH_PX = 40;

const JUSTIFY_BY_ALIGN: Record<string, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export const RichTextHorizontalRule = HorizontalRule.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // Stored as a percentage ("50%") so the rule scales with the content width; null = full width.
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => (attributes.width ? { style: `width: ${String(attributes.width)}` } : {}),
      },
      // Line thickness in px; 1 is the default and isn't written to the HTML.
      thickness: {
        default: 1,
        parseHTML: (element) => parseInt(element.style.borderTopWidth, 10) || 1,
        renderHTML: (attributes) => (Number(attributes.thickness) > 1 ? { style: `border-top-width: ${Number(attributes.thickness)}px` } : {}),
      },
      // 'left' | 'center' | 'right'; center is the default and isn't written to the HTML.
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'center',
        renderHTML: (attributes) => (attributes.align && attributes.align !== 'center' ? { 'data-align': attributes.align } : {}),
      },
    };
  },

  addNodeView() {
    if (typeof document === 'undefined') {
      return null;
    }

    return ({ node, getPos, editor }) => {
      const element = document.createElement('hr');
      let wrapper: HTMLElement | null = null;

      // The resize handles live on the wrapper, so the wrapper carries the width and the <hr> fills it.
      // The container is a full-width flex row, so alignment is its justify-content.
      // In the editor the line is drawn as a background (see globals.css), sized by --hr-thickness.
      const syncAttributes = (attributes: Record<string, unknown>) => {
        element.style.width = '100%';
        element.style.setProperty('--hr-thickness', `${Number(attributes.thickness) || 1}px`);

        if (wrapper) {
          wrapper.style.width = typeof attributes.width === 'string' ? attributes.width : '100%';
        }

        nodeView.dom.style.justifyContent = JUSTIFY_BY_ALIGN[String(attributes.align)] ?? 'center';
      };

      const nodeView = new ResizableNodeView({
        element,
        editor,
        node,
        getPos,
        onResize: (width) => {
          if (wrapper) {
            wrapper.style.width = `${width}px`;
          }
        },
        onCommit: (width) => {
          const pos = getPos();
          const rowWidth = nodeView.dom.clientWidth;

          if (pos === undefined || !rowWidth) {
            return;
          }

          const percent = Math.min(100, Math.round((width / rowWidth) * 100));
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, { width: percent >= 100 ? null : `${percent}%` })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }

          syncAttributes(updatedNode.attrs);
          return true;
        },
        options: {
          directions: ['left', 'right'],
          min: { width: MIN_WIDTH_PX },
        },
      });

      wrapper = nodeView.dom.querySelector<HTMLElement>('[data-resize-wrapper]');
      syncAttributes(node.attrs);

      return nodeView;
    };
  },
});
