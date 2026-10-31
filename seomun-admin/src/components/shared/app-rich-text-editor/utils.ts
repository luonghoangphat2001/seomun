import toast from 'react-hot-toast';

import type { FileType } from '@/enums';
import { uploadFile } from '@/lib/api/upload-file';

import { DEFAULT_TEXT_COLOR } from './constants';

export function resolveImageUrlFromPrompt(currentUrl = '') {
  return window.prompt('Image URL', currentUrl)?.trim();
}

export function normalizeColorInputValue(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_TEXT_COLOR;
}

// blob URL -> local File (not uploaded yet) or its uploaded URL (so a retried save doesn't upload twice).
const pendingImages = new Map<string, File | string>();

export function addPendingImage(file: File) {
  const src = URL.createObjectURL(file);
  pendingImages.set(src, file);
  return src;
}

/** Uploads images added in 'deferred' mode and swaps their blob URLs for real ones. Returns null (after a toast) on failure. */
export async function uploadPendingImages(html: string, type: FileType): Promise<string | null> {
  const blobUrls = [...new Set(html.match(/blob:[^"'\s]+/g) ?? [])].filter((blobUrl) => pendingImages.has(blobUrl));

  try {
    const uploadedUrls = await Promise.all(
      blobUrls.map(async (blobUrl) => {
        const pending = pendingImages.get(blobUrl)!;
        const url = typeof pending === 'string' ? pending : (await uploadFile({ file: pending, type })).url;
        pendingImages.set(blobUrl, url);
        return url;
      }),
    );

    return blobUrls.reduce((result, blobUrl, index) => result.replaceAll(blobUrl, uploadedUrls[index]), html);
  } catch (error) {
    console.error('Rich text image upload failed:', error);
    toast.error('Image upload failed.');
    return null;
  }
}
