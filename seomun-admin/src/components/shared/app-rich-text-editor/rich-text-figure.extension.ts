import { type Editor, mergeAttributes, Node } from '@tiptap/core';
import type { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model';
import { NodeSelection, Plugin } from '@tiptap/pm/state';
import { dropPoint } from '@tiptap/pm/transform';

import type { ImageCaptionPosition } from './types';

// Image figure = an image row + its caption bound into one block, so they move, delete and align together:
//   <figure data-align="center"><div data-image-row><img><img></div><figcaption>…</figcaption></figure>
// The caption goes above or below the row (the order of the two children). A figure without images is removed.

const GRIP_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.6"/><circle cx="15" cy="5" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="19" r="1.6"/><circle cx="15" cy="19" r="1.6"/></svg>';

function figureStartOf($pos: ResolvedPos) {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    if ($pos.node(depth).type.name === 'imageFigure') {
      return $pos.before(depth);
    }
  }

  return null;
}

function containsImage(node: ProseMirrorNode) {
  let found = false;
  node.descendants((child) => {
    found ||= child.type.name === 'image';
    return !found;
  });
  return found;
}

/**
 * Inserts an image: into the current figure's row when the cursor is inside a figure (so images can share a row
 * and its caption), otherwise as a new figure with an empty caption above/below it, with the cursor in the caption.
 */
export function insertImageFigure(editor: Editor, src: string, captionPosition: ImageCaptionPosition) {
  const { selection } = editor.state;
  const { $from } = selection;
  const image = { type: 'image', attrs: { src } };

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const figure = $from.node(depth);

    if (figure.type.name !== 'imageFigure') {
      continue;
    }

    // In the row: insert at the cursor (replaces a selected image). In the caption: append to the row.
    if ($from.parent.type.name === 'imageRow') {
      return editor.chain().focus().insertContent(image).run();
    }

    const figurePos = $from.before(depth);
    let rowEnd = -1;
    figure.forEach((child, offset) => {
      if (child.type.name === 'imageRow') {
        rowEnd = figurePos + 1 + offset + child.nodeSize - 1;
      }
    });

    return editor.chain().focus().insertContentAt(rowEnd, image).run();
  }

  // A new figure is its own block: it replaces an empty line, otherwise goes right after the current block.
  let from = selection.to;
  let to = selection.to;

  if (!(selection instanceof NodeSelection && selection.node.isBlock) && $from.depth > 0) {
    to = $from.after();
    from = $from.parent.isTextblock && $from.parent.content.size === 0 ? $from.before() : to;
  }

  const row = { type: 'imageRow', content: [image] };
  const caption = { type: 'figcaption' };
  editor
    .chain()
    .focus()
    .insertContentAt({ from, to }, { type: 'imageFigure', content: captionPosition === 'above' ? [caption, row] : [row, caption] })
    .run();

  let captionPos = -1;
  editor.state.doc.nodeAt(from)?.forEach((child, offset) => {
    if (child.type.name === 'figcaption') {
      captionPos = from + 1 + offset + 1;
    }
  });

  return captionPos >= 0 && editor.commands.setTextSelection(captionPos);
}

const ImageRow = Node.create({
  name: 'imageRow',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'div[data-image-row]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-image-row': '' }), 0];
  },
});

const Figcaption = Node.create({
  name: 'figcaption',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'figcaption' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figcaption', HTMLAttributes, 0];
  },
});

export const RichTextImageFigure = Node.create({
  name: 'imageFigure',
  group: 'block',
  content: '(imageRow figcaption | figcaption imageRow)',
  // Backspace after the figure selects it instead of merging text into the caption.
  isolating: true,
  draggable: true,

  addExtensions() {
    return [ImageRow, Figcaption];
  },

  addAttributes() {
    return {
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figure' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', HTMLAttributes, 0];
  },

  // A grip on the left drags the whole figure; clicking it selects the figure (then Delete removes it).
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('figure');
      const handle = document.createElement('div');
      const content = document.createElement('div');

      handle.dataset.dragHandle = '';
      handle.contentEditable = 'false';
      handle.title = 'Drag to move, click to select';
      handle.innerHTML = GRIP_ICON;
      handle.addEventListener('click', () => {
        const pos = getPos();

        if (typeof pos === 'number') {
          editor.commands.setNodeSelection(pos);
        }
      });

      dom.append(handle, content);
      dom.dataset.align = String(node.attrs.align);

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          dom.dataset.align = String(updatedNode.attrs.align);
          return true;
        },
        // Only the content area is ProseMirror's; the grip and figure attributes are ours.
        ignoreMutation: (mutation) => mutation.type !== 'selection' && !content.contains(mutation.target),
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      // There is no second caption/row to split into: Enter leaves the figure onto a new line below it.
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;

        if ($from.depth < 2 || $from.node($from.depth - 1).type.name !== this.name) {
          return false;
        }

        const afterFigure = $from.after($from.depth - 1);
        return editor
          .chain()
          .insertContentAt(afterFigure, { type: 'paragraph' })
          .setTextSelection(afterFigure + 1)
          .run();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        // Deleting (or dragging out) the last image of a figure removes the figure and its caption.
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const emptyFigures: { from: number; to: number }[] = [];
          newState.doc.descendants((child, pos) => {
            if (child.type.name !== this.name) {
              return true;
            }

            if (!containsImage(child)) {
              emptyFigures.push({ from: pos, to: pos + child.nodeSize });
            }

            return false;
          });

          if (!emptyFigures.length) {
            return null;
          }

          const tr = newState.tr;
          emptyFigures.reverse().forEach(({ from, to }) => tr.delete(from, to));
          return tr;
        },
        props: {
          // An image in a figure can be dragged to reorder it within its own row only; dropping it anywhere else
          // (outside, into the caption, into another figure) is blocked so it never leaves its caption.
          handleDrop: (view, event, slice, moved) => {
            // `node` is set when the drag started on a node that wasn't selected yet; it's missing from the typings.
            const source = (view.dragging as { node?: NodeSelection } | null)?.node ?? view.state.selection;

            if (!moved || !(source instanceof NodeSelection) || source.node.type.name !== 'image') {
              return false;
            }

            const sourceFigure = figureStartOf(source.$from);

            if (sourceFigure === null) {
              return false;
            }

            // Same drop position ProseMirror would use.
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const insertPos = coords ? dropPoint(view.state.doc, coords.pos, slice) : null;

            if (insertPos === null) {
              return true;
            }

            const $insert = view.state.doc.resolve(insertPos);
            return !($insert.parent.type.name === 'imageRow' && figureStartOf($insert) === sourceFigure);
          },
        },
      }),
    ];
  },
});
