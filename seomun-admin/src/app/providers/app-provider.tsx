import type { PropsWithChildren } from 'react';

import { QueryProvider } from '@/app/providers/query-provider';
import { Toaster } from 'react-hot-toast';
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      {children}
      <Toaster position='top-right' />
    </QueryProvider>
  );
}
