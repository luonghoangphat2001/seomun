'use client';

import ContactSection from './components/ContactSection';
import MenuSection from './components/MenuSection';
import InfoSection from './components/InfoSection';

const MySidebar = () => {
  return (
    <div className='hidden w-47 min-w-47 md:block'>
      <InfoSection />
      <MenuSection />
      <ContactSection />
    </div>
  );
};

export default MySidebar;
