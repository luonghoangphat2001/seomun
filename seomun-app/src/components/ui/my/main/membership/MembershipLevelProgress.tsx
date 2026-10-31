'use client';

import { MEMBERSHIP_LEVELS } from '@/constants/my';
import { getCurrentMembershipLevel } from '@/lib/utils/helper';
import Image from 'next/image';

type Props = {
  money: number;
  showText?: boolean;
};

const MembershipLevelProgress = ({ money, showText = true }: Props) => {
  //Find current level
  const { currentIndex, currentLevel, nextLevel, isMaxLevel } = getCurrentMembershipLevel(money);

  // MOBILE progress (current -> next only)
  let progressPercentMobile = 100;

  if (!isMaxLevel && nextLevel) {
    const range = nextLevel.min - currentLevel.min;
    const progress = money - currentLevel.min;
    progressPercentMobile = (progress / range) * 100;
  }

  progressPercentMobile = Math.min(Math.max(progressPercentMobile, 0), 100);

  // DESKTOP progress (full bar)

  const totalSegments = MEMBERSHIP_LEVELS.length - 1;

  let segmentProgress = 0;

  if (!isMaxLevel && nextLevel) {
    const range = nextLevel.min - currentLevel.min;
    const progress = money - currentLevel.min;
    segmentProgress = progress / range;
  }
  const progressPercentDesktop = Math.min(((currentIndex + segmentProgress) / totalSegments) * 100, 100);

  return (
    <div className='w-full rounded-xl'>
      {/**PC version */}
      <div className='relative hidden md:block'>
        {/* LINE WRAPPER (fix left/right overflow) */}
        <div
          className='absolute'
          style={{
            left: 36,
            right: 36,
            top: 36, // center line to icon
            transform: 'translateY(-100%)',
          }}>
          {/* Background */}
          <div className='bg-border-soft h-3 w-full rounded-full' />

          {/* Gradient progress */}
          <div
            className='absolute top-0 left-0 h-3 rounded-full bg-[linear-gradient(90deg,#FCB1B1_0%,#EFA211_67.31%)] transition-all duration-500'
            style={{ width: `${progressPercentDesktop}%` }}
          />
        </div>

        {/* Level */}
        <div className='flex w-full justify-between'>
          {MEMBERSHIP_LEVELS.map((level, index) => {
            const isActive = index === currentIndex;
            const isPassed = index < currentIndex;

            return (
              <div key={level.name} className='flex flex-col items-center'>
                {/* ICON */}
                <div className='z-10 flex h-18 w-18 items-center justify-center'>
                  <Image
                    src={isActive || isPassed ? level.activeIcon : level.inactiveIcon}
                    alt={level.name}
                    width={72}
                    height={72}
                    unoptimized
                  />
                </div>

                {/* LABEL */}
                <span className='body-14 mt-1'>{level.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile version */}
      <div className='relative block px-1.5 md:hidden'>
        <div className='relative'>
          {/* LINE */}
          <div
            className='absolute'
            style={{
              left: 24,
              right: 24,
              top: 24,
              transform: 'translateY(-100%)',
            }}>
            <div className='h-1.5 w-full rounded-full bg-gray-300' />

            <div
              className='absolute top-0 left-0 h-1.5 rounded-full transition-all duration-500'
              style={{
                width: `${progressPercentMobile}%`,
                background: 'linear-gradient(90deg, #FCB1B1 0%, #EFA211 67.31%)',
              }}
            />
          </div>

          {/* ONLY 2 LEVELS */}
          <div className='flex items-start justify-between'>
            {/* CURRENT */}
            <div className='flex flex-col items-center'>
              <div className='z-10 flex h-12 w-12 items-center justify-center'>
                <Image src={currentLevel.activeIcon} alt={currentLevel.name} width={48} height={48} unoptimized />
                {/* <currentLevel.activeIcon key={currentLevel.name} width={48} height={48} /> */}
              </div>
              {showText && <span className='mt-2 text-sm text-black'>{currentLevel.name}</span>}
            </div>

            {/* NEXT */}
            {!isMaxLevel && nextLevel && (
              <div className='flex flex-col items-center'>
                <div className='z-10 flex h-12 w-12 items-center justify-center'>
                  <Image src={nextLevel.inactiveIcon} alt={nextLevel.name} width={48} height={48} unoptimized />
                  {/* <nextLevel.inactiveIcon key={nextLevel.name} width={48} height={48} /> */}
                </div>
                {showText && <span className='mt-2 text-sm text-gray-400'>{nextLevel.name}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipLevelProgress;
