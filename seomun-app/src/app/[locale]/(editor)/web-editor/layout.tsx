import { HeaderWebEditor } from '@/components/ui/web-editor/HeaderWebEditor';
import { SidebarEditor } from '@/components/ui/web-editor/SidebarEditor';
import { PropsWithChildren } from 'react';

export default async function layout({ children }: PropsWithChildren) {
  return (
    <main className='flex h-dvh flex-col'>
      <HeaderWebEditor />
      <section className='relative flex min-h-0 flex-1 flex-col-reverse md:flex-row'>
        <SidebarEditor />
        {children}
      </section>
    </main>
  );
}
