import { ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import type { TaskLogRESP } from '../api';
import type { JsonPathKey } from '../utils/format-json-value';

const HTML_PREVIEW_STYLE = `<!doctype html><style>
body{margin:12px;font:14px/1.6 system-ui,sans-serif;word-break:break-word}
img{max-width:100%;height:auto}
</style>`;

type FrameSide = 'before' | 'after';

// path: where the HTML sits inside a JSON field value (e.g. ['email', 'content'])
export type HtmlField = { key: string; label: string; path?: JsonPathKey[] };

function getFieldValue(values: TaskLogRESP['before_values'], { key, path = [] }: HtmlField) {
  if (Array.isArray(values)) return undefined;
  return path.reduce<unknown>(
    (value, pathKey) => (value !== null && typeof value === 'object' ? (value as Record<JsonPathKey, unknown>)[pathKey] : undefined),
    values?.[key]?.value,
  );
}

function HtmlPreview({
  value,
  title,
  className,
  onFrameLoad,
}: {
  value: unknown;
  title: string;
  className: string;
  onFrameLoad: (win: Window) => void;
}) {
  if (value === null || value === undefined || value === '') {
    return <div className={`text-muted-foreground flex h-[60vh] items-center justify-center rounded-md border ${className}`}>-</div>;
  }

  return (
    <iframe
      sandbox='allow-same-origin'
      title={title}
      srcDoc={HTML_PREVIEW_STYLE + String(value)}
      onLoad={(e) => e.currentTarget.contentWindow && onFrameLoad(e.currentTarget.contentWindow)}
      className={`block h-[60vh] w-full rounded-md border bg-white ${className}`}
    />
  );
}

export function HtmlValueDialog({ log, field, onClose }: { log: TaskLogRESP; field?: HtmlField; onClose: () => void }) {
  const { t } = useTranslation();
  const [syncScroll, setSyncScroll] = useState(true);
  // Mirrors syncScroll for the frame scroll listeners
  const syncScrollRef = useRef(syncScroll);
  const frames = useRef<Partial<Record<FrameSide, Window>>>({});
  // Frame whose next scroll event is our own programmatic scroll, skipped to avoid a ping-pong loop
  const programmaticScroll = useRef<Window>(undefined);
  const beforeTitle = t('page.system_logs.tasks.columns.before_values');
  const afterTitle = t('page.system_logs.tasks.columns.after_values');

  // Same scroll offset on both sides, so identical lines stay side by side
  const attachFrame = (side: FrameSide) => (win: Window) => {
    frames.current[side] = win;

    win.addEventListener('scroll', () => {
      if (programmaticScroll.current === win) {
        programmaticScroll.current = undefined;
        return;
      }
      const other = frames.current[side === 'before' ? 'after' : 'before'];
      const src = win.document.scrollingElement;
      const dst = other?.document.scrollingElement;
      if (!syncScrollRef.current || !other || !src || !dst) return;

      const top = Math.min(src.scrollTop, dst.scrollHeight - dst.clientHeight);
      if (Math.abs(dst.scrollTop - top) < 1) return;
      programmaticScroll.current = other;
      dst.scrollTop = top;
    });
  };

  return (
    <Dialog
      open={!!field}
      onOpenChange={(open) => {
        if (open) return;
        frames.current = {};
        onClose();
      }}
    >
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader className='flex-row items-center gap-4 pr-8'>
          <DialogTitle>{field && [field.label, ...(field.path ?? [])].join(' › ')}</DialogTitle>
          <div className='ml-auto flex items-center gap-2'>
            <Switch
              id='task-log-sync-scroll'
              size='sm'
              checked={syncScroll}
              onCheckedChange={(checked) => {
                syncScrollRef.current = checked;
                setSyncScroll(checked);
              }}
            />
            <Label htmlFor='task-log-sync-scroll' className='text-xs font-medium'>
              {t('page.system_logs.tasks.sync_scroll')}
            </Label>
          </div>
        </DialogHeader>

        {field && (
          <div className='grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]'>
            <div className='min-w-0 space-y-2'>
              <span className='inline-flex rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800'>{beforeTitle}</span>
              <HtmlPreview
                value={getFieldValue(log.before_values, field)}
                title={beforeTitle}
                className='border-red-200'
                onFrameLoad={attachFrame('before')}
              />
            </div>
            <div
              className='bg-muted text-muted-foreground flex size-9 items-center justify-center justify-self-center rounded-full'
              aria-hidden='true'
            >
              <ArrowRight className='size-4 rotate-90 sm:rotate-0' />
            </div>
            <div className='min-w-0 space-y-2'>
              <span className='inline-flex rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'>{afterTitle}</span>
              <HtmlPreview
                value={getFieldValue(log.after_values, field)}
                title={afterTitle}
                className='border-emerald-200'
                onFrameLoad={attachFrame('after')}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
