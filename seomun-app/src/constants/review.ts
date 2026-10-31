import { MY_REVIEW_TAB } from '@/enums/review';

export const REVIEW_TABS = [
  { label: 'my.write_review', value: MY_REVIEW_TAB.ORDER_LIST },
  { label: 'my.my_review', value: MY_REVIEW_TAB.MY_REVIEW },
];

export const REVIEW_CAUTIONS = [
  {
    title: 'my.review_caution_1',
  },
  {
    title: 'my.review_caution_2',
  },
  {
    title: 'my.review_caution_3',
  },
  {
    title: 'my.review_caution_4',
  },
  {
    title: 'my.review_caution_5',
    items: ['my.review_caution_5a', 'my.review_caution_5b', 'my.review_caution_5c', 'my.review_caution_5d'],
  },
  {
    title: 'my.review_caution_6',
  },
];
