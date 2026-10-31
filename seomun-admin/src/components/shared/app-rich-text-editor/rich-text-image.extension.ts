import { ResizableNodeView } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';

export const RichTextImage = Image.extend({
  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === 'undefined') {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

    return ({ node, getPos, editor }) => {
      const element = document.createElement('img');

      const syncImageAttributes = (attributes: Record<string, unknown>) => {
        const src = typeof attributes.src === 'string' ? attributes.src : '';
        const alt = typeof attributes.alt === 'string' ? attributes.alt : null;
        const title = typeof attributes.title === 'string' ? attributes.title : null;
        const width = typeof attributes.width === 'number' ? attributes.width : null;
        const height = typeof attributes.height === 'number' ? attributes.height : null;

        element.src = src;
        element.className = String(this.options.HTMLAttributes.class ?? '');

        if (alt) {
          element.alt = alt;
        } else {
          element.removeAttribute('alt');
        }

        if (title) {
          element.title = title;
        } else {
          element.removeAttribute('title');
        }

        if (width) {
          element.setAttribute('width', String(width));
          element.style.width = `${width}px`;
        } else {
          element.removeAttribute('width');
          element.style.width = '';
        }

        if (height) {
          element.setAttribute('height', String(height));
          element.style.height = `${height}px`;
        } else {
          element.removeAttribute('height');
          element.style.height = '';
        }
      };

      syncImageAttributes(node.attrs);

      const nodeView = new ResizableNodeView({
        element,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          element.style.width = `${width}px`;
          element.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();

          if (pos === undefined) {
            return;
          }

          this.editor.chain().setNodeSelection(pos).updateAttributes(this.name, { width, height }).run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }

          syncImageAttributes(updatedNode.attrs);
          return true;
        },
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const dom = nodeView.dom;
      dom.style.visibility = 'hidden';
      dom.style.pointerEvents = 'none';

      element.onload = () => {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      };

      return nodeView;
    };
  },
});
