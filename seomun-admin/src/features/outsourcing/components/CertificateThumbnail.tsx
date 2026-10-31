import { FileText, ImageOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

// === Variables ===

/**
 * The PDF is rendered at this width then scaled down, so the first page stays legible instead of
 * being squeezed into a tiny viewport. The iframe is also drawn slightly wider than the box so the
 * viewer's scrollbar falls outside the crop.
 */
const PDF_RENDER_WIDTH = 320;
const PDF_RENDER_RATIO = 1.4;
const PDF_SCROLLBAR_BLEED = 16;

// === Types ===

type CertificateThumbnailProps = {
  url: string;
  mimeType: string;
  name: string;
  /** Rendered box size in px. */
  size?: number;
  className?: string;
};

export function CertificateThumbnail({ url, mimeType, name, size = 64, className }: CertificateThumbnailProps) {
  // === State ===
  const [hasFailed, setHasFailed] = useState(false);

  // === Variables ===
  const isPdf = mimeType === 'application/pdf';

  // === JSX ===
  return (
    <div className={cn('bg-muted/40 relative shrink-0 overflow-hidden rounded-md border', className)} style={{ width: size, height: size }}>
      {isPdf ? (
        <iframe
          src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH`}
          title={name}
          tabIndex={-1}
          className='pointer-events-none absolute top-0 left-0 border-0'
          style={{
            width: PDF_RENDER_WIDTH,
            height: PDF_RENDER_WIDTH * PDF_RENDER_RATIO,
            transform: `scale(${(size + PDF_SCROLLBAR_BLEED) / PDF_RENDER_WIDTH})`,
            transformOrigin: 'top left',
          }}
        />
      ) : hasFailed ? (
        <span className='text-muted-foreground grid size-full place-items-center'>
          {mimeType.startsWith('image/') ? <ImageOff className='size-5' /> : <FileText className='size-5' />}
        </span>
      ) : (
        <img src={url} alt={name} onError={() => setHasFailed(true)} className='size-full object-cover' />
      )}
    </div>
  );
}
