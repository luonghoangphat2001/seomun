'use client';

import { Toaster as ReactHotToaster } from 'react-hot-toast';
import { Check } from '@/icons';

export const Toaster = () => {
  return (
    <ReactHotToaster
      position='top-right'
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
        },
        success: {
          duration: 3000,
          icon: <Check />,
          style: {
            background: '#10b981',
          },
        },
        error: {
          duration: 3000,
          style: {
            background: '#ef4444',
          },
        },
        loading: {
          duration: Infinity,
        },
      }}
    />
  );
};
