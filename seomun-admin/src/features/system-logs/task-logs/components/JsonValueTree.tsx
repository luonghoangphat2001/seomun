import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  countUnchangedEntries,
  formatJsonInline,
  humanizeKey,
  isHtml,
  isJsonEqual,
  isPlainObject,
  type JsonLinePart,
  type JsonPathKey,
} from '../utils/format-json-value';

type Side = 'before' | 'after';

const CHANGED_STYLES: Record<Side, string> = {
  before: 'rounded bg-red-100 px-1 text-red-800 line-through decoration-red-400 box-decoration-clone',
  after: 'rounded bg-emerald-100 px-1 text-emerald-800 box-decoration-clone',
};

export function JsonLineParts({ parts, onViewHtml }: { parts: JsonLinePart[]; onViewHtml: (path: JsonPathKey[]) => void }) {
  const { t } = useTranslation();

  return parts.map((part, index) =>
    typeof part === 'string' ? (
      <Fragment key={index}>{part}</Fragment>
    ) : (
      <button key={index} type='button' className='cursor-pointer font-medium text-blue-600 hover:underline' onClick={() => onViewHtml(part.path)}>
        {t('common.action.view')}
      </button>
    ),
  );
}

type JsonValueTreeProps = {
  value: Record<string, unknown>;
  other: unknown;
  diff: boolean;
  side: Side;
  path: JsonPathKey[];
  showUnchanged: boolean;
  onViewHtml: (path: JsonPathKey[]) => void;
};

// Nested object as an indented key/value tree; in diff mode changed values are highlighted and unchanged ones hidden unless showUnchanged
function JsonValueTree({ value, other, diff, side, path, showUnchanged, onViewHtml }: JsonValueTreeProps) {
  const otherRecord = isPlainObject(other) ? other : {};
  const entries = Object.entries(value).filter(([key, item]) => !diff || showUnchanged || !isJsonEqual(item, otherRecord[key]));

  return (
    <div className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-0.5'>
      {entries.map(([key, item]) => {
        const changed = diff && !isJsonEqual(item, otherRecord[key]);
        const highlighted = changed && !isHtml(item);
        const childPath = [...path, key];
        const keyClassName = diff && !changed ? 'text-muted-foreground/70' : 'text-muted-foreground';

        if (isPlainObject(item)) {
          return (
            <div key={key} className='col-span-2'>
              <div className={keyClassName}>{humanizeKey(key)}</div>
              <div className='border-border ml-1 border-l pl-2'>
                <JsonValueTree
                  value={item}
                  other={otherRecord[key]}
                  diff={diff}
                  side={side}
                  path={childPath}
                  showUnchanged={showUnchanged}
                  onViewHtml={onViewHtml}
                />
              </div>
            </div>
          );
        }

        return (
          <Fragment key={key}>
            <span className={keyClassName}>{humanizeKey(key)}</span>
            <span className={`min-w-0 ${diff && !changed ? 'text-muted-foreground' : 'text-foreground'}`}>
              <span className={highlighted ? CHANGED_STYLES[side] : undefined}>
                <JsonLineParts parts={formatJsonInline(item, childPath)} onViewHtml={onViewHtml} />
              </span>
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

export function JsonFieldValue({
  value,
  other,
  side,
  onViewHtml,
}: {
  value: Record<string, unknown>;
  other: unknown;
  side: Side;
  onViewHtml: (path: JsonPathKey[]) => void;
}) {
  const { t } = useTranslation();
  const [showUnchanged, setShowUnchanged] = useState(false);
  const diff = other !== null && other !== undefined;
  const unchangedCount = diff ? countUnchangedEntries(value, other) : 0;

  return (
    <div className='min-w-0 space-y-1'>
      <JsonValueTree value={value} other={other} diff={diff} side={side} path={[]} showUnchanged={showUnchanged} onViewHtml={onViewHtml} />
      {unchangedCount > 0 && (
        <button
          type='button'
          aria-expanded={showUnchanged}
          className='cursor-pointer font-medium text-blue-600 hover:underline'
          onClick={() => setShowUnchanged((prev) => !prev)}
        >
          {showUnchanged ? t('common.action.show_less') : t('page.system_logs.tasks.unchanged_count', { count: unchangedCount })}
        </button>
      )}
    </div>
  );
}
