import type * as React from 'react';

export type AppMessageProps = React.HTMLAttributes<HTMLParagraphElement> & {
  message?: React.ReactNode;
};
