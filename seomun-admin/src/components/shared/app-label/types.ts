import type * as React from 'react';

export type AppLabelProps = React.ComponentPropsWithoutRef<'label'> & {
  label?: React.ReactNode;

  required?: boolean;
};
