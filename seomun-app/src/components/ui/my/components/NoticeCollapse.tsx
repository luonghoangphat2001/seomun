'use client';

import { useMediaQuery } from '@/hooks';
import { Careright } from '@/icons';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useState } from 'react';

type Props = {
  title: string;
  /** Numbered note lines. Omit and pass children instead for rich content. */
  notes?: string[];
  children?: ReactNode;
};

/** The collapsible notice box used across My Page (cart, saved options, admin board notices). */
const NoticeCollapse = ({ title, notes, children }: Props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = useState(isDesktop);

  return (
    <section className='border-border-soft rounded-lg py-4 md:mt-2 md:bg-blue-50 md:p-6'>
      <div className='-ml-1 flex cursor-pointer items-center gap-2' onClick={() => setOpen(!open)}>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
          <Careright className='size-6 text-[#F97316]' />
        </motion.div>

        <p className='title-14'>{title}</p>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='overflow-hidden'>
            <div className='mt-3 space-y-3 md:mt-4'>
              {notes
                ? notes.map((text, index) => (
                    <div key={index} className='body-14 flex items-start gap-2'>
                      <span className='min-w-4'>{index + 1}.</span>
                      <span>{text}</span>
                    </div>
                  ))
                : children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default NoticeCollapse;
