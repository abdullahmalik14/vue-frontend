import { mapPublishStateToTierCard } from './mapPublishStateToTierCard.js';

function baseFormValues(overrides = {}) {
  return {
    planDetailSubstep: 'paid-tier',
    priceDuration: 'month',
    tierName: '',
    description: '',
    bgImage: null,
    isFeaturedTier: false,
    basePrice: '9.99',
    freeTokensDiscount: '100',
    merchDiscount: '10',
    payToViewDiscount: '15',
    customRequestDiscount: '20',
    selectedMediaOptions: ['video', 'image'],
    subscriberDiscount: null,
    unsubscribeDiscount: null,
    ...overrides,
  };
}

/**
 * Fake PlanPage list entries for UI work (drafts + published + followers).
 * @param {{ t: Function, defaultBgUrl?: string }} options
 */
function buildDemoSubscriptionTiers({ t, defaultBgUrl = '' }) {
  const specs = [
    {
      id: 'demo-published-vip',
      status: 'published',
      followers: 248,
      formValues: baseFormValues({
        tierName: 'VIP Access',
        description:
          'Full vault, early drops, and monthly live Q&A for your closest fans.',
        basePrice: '29.99',
        isFeaturedTier: true,
        freeTokensDiscount: '250',
        merchDiscount: '20',
      }),
    },
    {
      id: 'demo-published-circle',
      status: 'published',
      followers: 56,
      formValues: baseFormValues({
        tierName: 'Inner Circle',
        description: 'Weekly exclusives plus chat perks for active subscribers.',
        basePrice: '14.99',
        freeTokensDiscount: '150',
      }),
    },
    {
      id: 'demo-published-free',
      status: 'published',
      followers: 0,
      formValues: baseFormValues({
        planDetailSubstep: 'free-tier',
        tierName: 'Free Fan Club',
        description: 'Public updates and community posts — no subscription fee.',
        basePrice: '',
        isFeaturedTier: false,
        freeTokensDiscount: '10',
        merchDiscount: '5',
      }),
    },
    {
      id: 'demo-draft-soft',
      status: 'draft',
      followers: 0,
      formValues: baseFormValues({
        tierName: 'Soft Launch',
        description: 'Draft tier for a soft open — polish copy before publish.',
        basePrice: '7.99',
        isFeaturedTier: true,
      }),
    },
    {
      id: 'demo-draft-summer',
      status: 'draft',
      followers: 0,
      formValues: baseFormValues({
        tierName: 'Summer Special',
        description: 'Limited seasonal bundle with merch and PPV discounts.',
        basePrice: '19.99',
        subscriberDiscount: {
          discountType: 'percent',
          discountAmount: '15',
        },
      }),
    },
    {
      id: 'demo-draft-bts',
      status: 'draft',
      followers: 0,
      formValues: baseFormValues({
        tierName: 'Behind the Scenes',
        description: 'Raw BTS clips and voice notes for day-one supporters.',
        basePrice: '11.99',
        priceDuration: 'month',
      }),
    },
    {
      id: 'demo-draft-weekly',
      status: 'draft',
      followers: 0,
      formValues: baseFormValues({
        tierName: 'Weekly Drop',
        description: 'Publish gated until media checkboxes are selected.',
        basePrice: '4.99',
        selectedMediaOptions: [],
      }),
    },
    {
      id: 'demo-draft-cuts',
      status: 'draft',
      followers: 0,
      formValues: baseFormValues({
        tierName: 'Exclusive Cuts',
        description: 'Director cuts and alternate endings for power fans.',
        basePrice: '24.99',
        customRequestDiscount: '25',
        payToViewDiscount: '30',
      }),
    },
  ];

  return specs.map((spec) => {
    const hasMedia =
      Array.isArray(spec.formValues.selectedMediaOptions) &&
      spec.formValues.selectedMediaOptions.length > 0;
    const card = mapPublishStateToTierCard({
      state: spec.formValues,
      t,
      defaultBgUrl,
      status: spec.status,
      id: spec.id,
      followers: spec.followers,
      hasMedia,
      listMode: true,
    });
    return {
      id: spec.id,
      status: spec.status,
      followers: spec.followers,
      hasMedia,
      isFreeTier: card.isFreeTier,
      formValues: spec.formValues,
      card,
    };
  });
}

export { buildDemoSubscriptionTiers };
