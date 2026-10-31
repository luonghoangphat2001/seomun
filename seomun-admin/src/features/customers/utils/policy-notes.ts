import type { PointPolicySection } from '../types/customer.type';

const CUSTOMER_POLICY_SECTIONS: PointPolicySection[] = [
  {
    id: 'membership-level-and-cumulative-standard-information',
    title: 'Membership level and cumulative standard information',
    items: [
      {
        id: 'membership-level-and-cumulative-standard-information-1',
        content: 'The cumulative amount applies equally to printed products and design products.',
      },
      {
        id: 'membership-level-and-cumulative-standard-information-2',
        content:
          'Membership is operated based on the 4 quarters of the year (January to March / April to June / July to September / October to December).',
      },
      {
        id: 'membership-level-and-cumulative-standard-information-3',
        content:
          'It is accumulated for the quarter based on the order date. (Example: Order on September 30th -> Even if it is received on October 1st, it is accumulated for 3 quarters.)',
      },
      {
        id: 'membership-level-and-cumulative-standard-information-4',
        content: 'The upgrade date is the first day of each quarter.',
      },
      {
        id: 'membership-level-and-cumulative-standard-information-5',
        content: 'The level is maintained regardless of the order amount during the upgraded quarter.',
      },
      {
        id: 'membership-level-and-cumulative-standard-information-6',
        content:
          'If the cumulative amount for the next quarter falls below the existing level maintenance standard, the level will be downgraded from the following quarter.',
      },
    ],
  },
  {
    id: 'calculation-of-cumulative-amount',
    title: 'Calculation of cumulative amount',
    items: [
      {
        id: 'calculation-of-cumulative-amount-1',
        content: 'The cumulative amount for printed products = Supply price + Tax - Discount + Shipping fee.',
      },
      {
        id: 'calculation-of-cumulative-amount-2',
        content: 'The cumulative amount for design products = Supply price + Tax - Discount.',
      },
      {
        id: 'calculation-of-cumulative-amount-3',
        content: 'The cumulative amount applies to all payment methods.',
      },
    ],
  },
  {
    id: 'point-accumulation-information',
    title: 'Point accumulation information',
    items: [
      {
        id: 'point-accumulation-information-1',
        content: 'Point accumulation is only possible when paying with a virtual account.',
      },
      {
        id: 'point-accumulation-information-2',
        content:
          'Points are accumulated based on the payment amount including VAT. (Example: Gold Member) 10,000 won payment -> 2% accumulation = 200 points)',
      },
      {
        id: 'point-accumulation-information-3',
        content: 'Points are accumulated after shipment is completed.',
      },
      {
        id: 'point-accumulation-information-4',
        content: 'Points are re-accumulated for the payment amount excluding shipping costs and point usage amount.',
      },
      {
        id: 'point-accumulation-information-5',
        content: 'Points cannot be refunded. However, if an order using points is refunded, the used points will be restored.',
      },
    ],
  },
  {
    id: 'point-usage-guide',
    title: 'Point usage guide',
    items: [
      {
        id: 'point-usage-guide-1',
        content: 'Points can be used in units of 100 points.',
      },
      {
        id: 'point-usage-guide-2',
        content: 'Points cannot be used to pay for shipping costs.',
      },
      {
        id: 'point-usage-guide-3',
        content: 'Tax invoices cannot be issued for amounts paid with points.',
      },
      {
        id: 'point-usage-guide-4',
        content: 'Unused points will automatically expire every 12 months.',
      },
      {
        id: 'point-usage-guide-5',
        content: 'Points and membership levels will automatically expire when you cancel your membership.',
      },
      {
        id: 'point-usage-guide-6',
        content: 'Points cannot be converted to cash.',
      },
    ],
  },
  {
    id: 'other-notes',
    title: 'Other notes',
    items: [
      {
        id: 'other-notes-1',
        content: 'Point and membership policies may change according to company policy without prior notice.',
      },
    ],
  },
];

const POINT_POLICY_SECTION_IDS = ['point-accumulation-information', 'point-usage-guide', 'other-notes'] as const;
const MEMBERSHIP_POLICY_SECTION_IDS = [
  'membership-level-and-cumulative-standard-information',
  'calculation-of-cumulative-amount',
  'other-notes',
] as const;

function filterPolicySections(sections: PointPolicySection[], sectionIds: readonly string[]) {
  return sections.filter((section) => sectionIds.includes(section.id));
}

export function getPointPolicySections(sections: PointPolicySection[]) {
  return filterPolicySections(sections, POINT_POLICY_SECTION_IDS);
}

export function getMembershipPolicySections(sections: PointPolicySection[]) {
  return filterPolicySections(sections, MEMBERSHIP_POLICY_SECTION_IDS);
}

export function getCustomerPolicySections() {
  return CUSTOMER_POLICY_SECTIONS;
}
