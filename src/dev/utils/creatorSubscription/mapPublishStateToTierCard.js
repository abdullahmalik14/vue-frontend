/**
 * Maps SubscriptionTierPopup publishFlow.state → TierCard props
 * (popup preview + PlanPage settings list via `listMode`).
 */

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(value, fallback = '') {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw;
  return Number.isInteger(num) ? String(num) : String(num);
}

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, '');
}

function computeDiscountedPrice(basePrice, discount) {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || !discount) return null;
  const amount = Number(discount.discountAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (discount.discountType === 'amount') {
    return Math.max(0, base - amount);
  }
  return Math.max(0, base * (1 - amount / 100));
}

function durationPlanMeta(priceDuration, t) {
  const duration = priceDuration || 'month';
  if (duration === 'day') {
    return { id: 'day', label: t('tierCard.demo.plans.oneDay') };
  }
  if (duration === 'year') {
    return { id: 'year', label: t('tierCard.demo.plans.oneYear') };
  }
  return { id: 'month', label: t('tierCard.demo.plans.oneMonth') };
}

function formatPercentOff(value, t, fallback = '10') {
  const amount = String(value ?? '').trim() || fallback;
  return t('tierCard.ui.features.percentOffAmount', { amount });
}

function formatTokensValue(value, t, fallback = '100') {
  const amount = String(value ?? '').trim() || fallback;
  return t('tierCard.ui.features.tokensEveryMonth', { count: amount });
}

function buildFeatures(state, t, tierCardAssets) {
  const features = [];
  if (String(state.freeTokensDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets?.takeCoin,
      label: t('tierCard.ui.features.freeTokens'),
      value: formatTokensValue(state.freeTokensDiscount, t),
    });
  }
  if (String(state.merchDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets?.cart,
      label: t('tierCard.ui.features.merchDiscount'),
      value: formatPercentOff(state.merchDiscount, t),
    });
  }
  if (String(state.payToViewDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets?.image,
      label: t('tierCard.ui.features.ppvDiscount'),
      value: formatPercentOff(state.payToViewDiscount, t),
    });
  }
  if (String(state.customRequestDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets?.cart,
      label: t('tierCard.ui.features.customRequest'),
      value: formatPercentOff(state.customRequestDiscount, t),
    });
  }
  const unsubscribeDiscount = state.unsubscribeDiscount;
  if (unsubscribeDiscount && Number(unsubscribeDiscount.discountAmount) > 0) {
    features.push({
      icon: tierCardAssets?.cart,
      label: t('tierCard.ui.features.unsubscribeDiscount'),
      value:
        unsubscribeDiscount.discountType === 'amount'
          ? t('tierCard.ui.features.amountOff', {
              amount: formatMoney(unsubscribeDiscount.discountAmount),
            })
          : formatPercentOff(unsubscribeDiscount.discountAmount, t),
    });
  }
  return features;
}

/** HTML perk lines for TierCard settings list (white checkbox + accent span). */
function buildSettingsFeatureHtml(state, t, accentHex) {
  const accent = (inner) =>
    `<span class="font-semibold" style="color:${accentHex}">${inner}</span>`;
  const tokens = String(state.freeTokensDiscount || '').trim() || '10';
  const merch = String(state.merchDiscount || '').trim() || '10';
  const custom = String(state.customRequestDiscount || '').trim() || '10';
  const ppv = String(state.payToViewDiscount || '').trim() || '10';
  return [
    `${accent(t('plan.page.featureTokensAccent', { count: tokens }))} ${t('plan.page.featureTokensSuffix')}`,
    `${accent(t('plan.page.featurePercentAccent', { amount: merch }))} ${t('plan.page.featureMerchSuffix')}`,
    `${accent(t('plan.page.featurePercentAccent', { amount: custom }))} ${t('plan.page.featureCustomSuffix')}`,
    `${accent(t('plan.page.featurePercentAccent', { amount: ppv }))} ${t('plan.page.featurePpvSuffix')}`,
  ];
}

function resolveAccentHex(status, followers) {
  if (status === 'draft') return '#07F468';
  if (Number(followers) > 0) return '#07F468';
  return '#4D20FF';
}

function buildStatusRibbon(status, followers, t) {
  if (status === 'draft') {
    return { text: t('plan.page.statusDraft'), variant: 'draft' };
  }
  if (Number(followers) > 0) {
    return {
      text: t('plan.page.followersCount', { count: followers }),
      variant: 'followers',
    };
  }
  return { text: t('plan.page.noFollowersYet'), variant: 'none' };
}

function greenTheme(unionGreenUrl) {
  return {
    textPrimary: 'text-[#07F468] dark:text-[#06c454]',
    textSecondary: 'text-[#FFED29] dark:text-[#FFED29]',
    shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',
    barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',
    barTextColor: 'text-[#FFED29]',
    featuredBg: 'bg-black dark:bg-[#181a1b]',
    buttonBgImage: unionGreenUrl ? `url('${unionGreenUrl}')` : '',
    flashLabel: 'text-[#07F468] dark:text-[#06c454]',
    flashText: '#07F468',
    textReNew: 'text-white dark:text-[#e8e6e3]',
    featuredText: 'text-[#07F468] dark:text-[#06c454]',
  };
}

/**
 * @param {object} options
 * @param {object} options.state - publishFlow.state (or saved formValues)
 * @param {Function} options.t - i18n t
 * @param {object} [options.tierCardAssets]
 * @param {string} [options.unionGreenUrl]
 * @param {'published'|'draft'} [options.status]
 * @param {string|number} [options.id]
 * @param {number} [options.followers]
 * @param {boolean} [options.hasMedia] — draft Publish gate (selectedMediaOptions)
 */
export function mapPublishStateToTierCard({
  state,
  t,
  tierCardAssets = {},
  unionGreenUrl = '',
  defaultBgUrl = '',
  status = 'published',
  id = 1,
  followers = 0,
  hasMedia = false,
  /** PlanPage list — checkbox features + status ribbon borders on TierCard */
  listMode = false,
}) {
  const isFreeTier = state.planDetailSubstep === 'free-tier';
  const planMeta = durationPlanMeta(state.priceDuration, t);
  const basePrice = formatPrice(state.basePrice, listMode ? '0' : '');
  const subscriberDiscount = state.subscriberDiscount;
  const discounted = computeDiscountedPrice(basePrice, subscriberDiscount);
  const displayPrice =
    discounted != null
      ? formatMoney(discounted)
      : listMode
        ? isFreeTier
          ? '0'
          : basePrice || '0'
        : basePrice || '0';
  const statusRibbon = buildStatusRibbon(status, followers, t);

  let discountLabel = '';
  let oldPrice = '';
  if (listMode && subscriberDiscount && discounted != null && basePrice) {
    oldPrice = formatMoney(basePrice);
    if (subscriberDiscount.discountType === 'amount') {
      discountLabel = `-${t('subscriptionCard.currencyPrefix')}${formatMoney(subscriberDiscount.discountAmount)}`;
    } else {
      discountLabel = `-${formatMoney(subscriberDiscount.discountAmount)}%`;
    }
  }

  const description = listMode
    ? String(state.description || '').trim() ||
      t('demo.subscriptionCards.cards.description')
    : stripHtml(state.description) || t('tierCard.ui.empty.description');

  const features = listMode
    ? buildSettingsFeatureHtml(state, t, resolveAccentHex(status, followers))
    : buildFeatures(state, t, tierCardAssets);

  return {
    id,
    emptyState: false,
    settingsList: Boolean(listMode),
    title: String(state.tierName || '').trim() || t('tierCard.ui.empty.tierName'),
    backgroundImage: state.bgImage || defaultBgUrl || null,
    isFeatured: Boolean(state.isFeaturedTier),
    hidePlanSelector: true,
    priceDisplay: isFreeTier ? 'free' : 'paid',
    stats: { video: 0, image: 0, audio: 0 },
    theme: greenTheme(unionGreenUrl),
    plans: [
      {
        id: planMeta.id,
        label: planMeta.label,
        price: isFreeTier && !listMode ? t('tierCard.ui.free') : displayPrice,
        discount: null,
      },
    ],
    defaultPlan: planMeta.id,
    flashSale: {
      active: Boolean(!listMode && subscriberDiscount && discounted != null && basePrice),
      endsIn: t('plan.preview.mock.endsIn'),
      originalPrice: basePrice ? `$${basePrice}` : '',
    },
    description,
    features,
    discountLabel,
    oldPrice,
    statusRibbon: listMode ? statusRibbon : undefined,
    footer: { type: 'none' },
    isFreeTier,
    status,
    followers,
    formValues: { ...state },
  };
}

export function isPublishStateEmpty(state) {
  return (
    !String(state.tierName || '').trim() &&
    !stripHtml(state.description) &&
    !state.bgImage &&
    !String(state.basePrice || '').trim()
  );
}

export { stripHtml, formatPrice, formatMoney, computeDiscountedPrice };
