import type * as React from 'react';

export type AppHintProps = React.HTMLAttributes<HTMLParagraphElement> & {
  hint?: React.ReactNode;
};
