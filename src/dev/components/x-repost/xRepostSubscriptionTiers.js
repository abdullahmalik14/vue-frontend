export const DEFAULT_SUBSCRIPTION_TIER_ID = 'all';

export const SUBSCRIPTION_TIER_OPTIONS = [
  { id: 'all', labelKey: 'allTier', helpKey: 'allTierHelp' },
  { id: 'free123', labelKey: 'freeTier123', helpKey: 'freeTier123Help' },
  { id: 'paid1', labelKey: 'paidTier1', helpKey: 'paidTier1Help' },
  { id: 'paid2', labelKey: 'paidTier2', helpKey: 'paidTier2Help' },
  { id: 'paid3', labelKey: 'paidTier3', helpKey: 'paidTier3Help' },
  { id: 'paid4', labelKey: 'paidTier4', helpKey: 'paidTier4Help' },
  { id: 'paid5', labelKey: 'paidTier5', helpKey: 'paidTier5Help' },
];

export function subscriptionTierById(tierId) {
  return SUBSCRIPTION_TIER_OPTIONS.find((tier) => tier.id === tierId) || null;
}
