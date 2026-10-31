import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouter } from '@/app/router';

import '@/app/i18n';
import '@/app/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
