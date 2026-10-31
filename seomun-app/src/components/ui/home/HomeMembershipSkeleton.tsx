export const HomeMembershipSkeleton = () => {
  return (
    <>
      <div className='mobile-seperator mx-0'></div>
      <section className='global-padding animate-pulse space-y-3 py-6 md:hidden'>
        <div className='border-border-soft rounded-[12px] border bg-white'>
          <div className='border-border-soft bg-border-light flex items-center justify-between rounded-t-[12px] border-b p-4'>
            <div className='flex items-center gap-3'>
              <div className='size-12 rounded-full bg-gray-200' />
              <div className='space-y-2'>
                <div className='h-4 w-24 rounded bg-gray-200' />
                <div className='h-3.5 w-12 rounded bg-gray-200' />
              </div>
            </div>
            <div className='size-10 rounded-full bg-gray-200' />
          </div>

          <div className='flex flex-col items-center gap-3 px-6 py-5'>
            <div className='h-4 w-full rounded bg-gray-200' />
            <div className='flex flex-col items-center gap-1.5 pt-2'>
              <div className='h-4 w-40 rounded bg-gray-200' />
              <div className='h-4 w-48 rounded bg-gray-200' />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div className='border-border-soft flex flex-col gap-4 rounded-[12px] border bg-white px-3 py-4'>
            <div className='h-4 w-12 rounded bg-gray-200' />
            <div className='h-6 w-20 rounded bg-gray-200' />
          </div>
          <div className='border-border-soft flex flex-col gap-4 rounded-[12px] border bg-white px-3 py-4'>
            <div className='h-4 w-20 rounded bg-gray-200' />
            <div className='h-6 w-24 rounded bg-gray-200' />
          </div>
        </div>

        <div className='flex justify-center pt-2'>
          <div className='h-11 w-[240px] rounded-full bg-gray-200' />
        </div>
      </section>
      <div className='mobile-seperator mx-0'></div>
    </>
  );
};
