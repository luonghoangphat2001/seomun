export const BannerSkeleton = () => {
  return (
    <div className='mx-auto w-full animate-pulse px-0 sm:px-4 sm:pt-3 md:max-w-[1464px] md:px-3'>
      <div className='relative h-40 w-full overflow-hidden bg-gray-200 sm:h-110 sm:rounded-[24px]'>
        <div className='from-primary/10 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-r' />
      </div>
    </div>
  );
};
