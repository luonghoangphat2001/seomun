import { MemberShipLevelType } from '@/types';

export const MEMBERSHIP_LEVELS: MemberShipLevelType[] = [
  {
    name: 'Family',
    min: 0,
    pointPercent: 0,
    activeIcon: '/images/level/bronze.png',
    inactiveIcon: '/images/level/bronze-inactive.png',
  },
  {
    name: 'Bronze',
    min: 100000,
    pointPercent: 0,
    activeIcon: '/images/level/silver.png',
    inactiveIcon: '/images/level/silver-inactive.png',
  },
  {
    name: 'Silver',
    min: 500000,
    pointPercent: 1,
    activeIcon: '/images/level/gold.png',
    inactiveIcon: '/images/level/gold-inactive.png',
  },
  {
    name: 'Gold',
    min: 1000000,
    pointPercent: 2,
    activeIcon: '/images/level/diamond.png',
    inactiveIcon: '/images/level/diamond-inactive.png',
  },
  {
    name: 'Diamond',
    min: 3000000,
    pointPercent: 3,
    activeIcon: '/images/level/vip.png',
    inactiveIcon: '/images/level/vip-inactive.png',
  },
  {
    name: 'VIP',
    min: 12000000,
    pointPercent: 4,
    activeIcon: '/images/level/vvip.png',
    inactiveIcon: '/images/level/vvip-inactive.png',
  },
];
