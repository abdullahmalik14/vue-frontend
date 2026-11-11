const SALES_CONDITIONS = ['everyNew', 'customCount', 'growth', 'total', 'customGoal'];
const TIP_CONDITIONS = ['everyNew', 'customTokensCount', 'totalTokensCount', 'customGoal'];
const CASH_GIFT_CONDITIONS = ['everyCashGift', 'customCashGiftsCount', 'totalCashGiftsCount', 'customGoal'];
const PROFILE_METRICS = ['profileLikes', 'feedLikes', 'profileVisits', 'followers'];

export const CONDITIONS_BY_TYPE_METRIC = {
  profile: Object.fromEntries(
    PROFILE_METRICS.map((metric) => [metric, [...SALES_CONDITIONS]]),
  ),
  subscription: {
    salesUsd: [...SALES_CONDITIONS],
    subscribers: [
      'everyNew',
      'everyRecurring',
      'customCount',
      'customRecurringCount',
      'growth',
      'total',
      'customGoal',
    ],
  },
  media: {
    salesUsd: [...SALES_CONDITIONS],
    salesQty: [...SALES_CONDITIONS],
    views: [...SALES_CONDITIONS],
  },
  merch: {
    salesUsd: [...SALES_CONDITIONS],
    salesQty: [...SALES_CONDITIONS],
    views: [...SALES_CONDITIONS],
  },
  customRequest: {
    salesUsd: [...SALES_CONDITIONS],
    salesQty: [...SALES_CONDITIONS],
  },
  livestream: {
    goingLive: ['whenGoingLive'],
    tip: [...TIP_CONDITIONS],
    cashGift: [...CASH_GIFT_CONDITIONS],
    sales: [...SALES_CONDITIONS],
  },
  privateChat: {
    tip: [...TIP_CONDITIONS],
    cashGift: [...CASH_GIFT_CONDITIONS],
    sales: [...SALES_CONDITIONS],
  },
  videoCall: {
    tip: [...TIP_CONDITIONS],
    cashGift: [...CASH_GIFT_CONDITIONS],
    sales: [...SALES_CONDITIONS],
  },
  audioCall: {
    tip: [...TIP_CONDITIONS],
    cashGift: [...CASH_GIFT_CONDITIONS],
    sales: [...SALES_CONDITIONS],
  },
};

export const CONDITION_ICON_KEY = {
  everyNew: 'tip',
  everyRecurring: 'metricUser',
  customCount: 'salesQty',
  customRecurringCount: 'salesQty',
  growth: 'views',
  total: 'likes',
  customGoal: 'salesUsd',
  customTokensCount: 'tip',
  totalTokensCount: 'likes',
  everyCashGift: 'cashGift',
  customCashGiftsCount: 'cashGift',
  totalCashGiftsCount: 'likes',
  whenGoingLive: 'goingLive',
};

const PROFILE_ENTITY = {
  profileLikes: 'Profile Like',
  feedLikes: 'Feed Like',
  profileVisits: 'Profile Visit',
  followers: 'Followers',
};

const PROFILE_ENTITY_LOWER = {
  profileLikes: 'profile like',
  feedLikes: 'feed like',
  profileVisits: 'profile visit',
  followers: 'follower',
};

function profileConditionCopy(metricId, conditionId) {
  const entity = PROFILE_ENTITY[metricId];
  const entityLower = PROFILE_ENTITY_LOWER[metricId];
  const isFollowers = metricId === 'followers';

  const copies = {
    everyNew: {
      label: isFollowers ? 'Every New Followers' : `Every New ${entity}`,
      help: isFollowers
        ? 'Post every time someone follows you to keep your audience engaged.'
        : `Post every time someone gives a new ${entityLower} to keep your audience engaged.`,
    },
    customCount: {
      label: isFollowers ? 'Custom New Followers Count' : `Custom ${entity} Count`,
      help: isFollowers
        ? 'Post when you reach a set number of new followers. Customize the count as needed.'
        : `Post when you reach a set number of new ${entityLower}s. Customize the count as needed.`,
    },
    growth: {
      label: 'Growth Comparison',
      help: isFollowers
        ? 'Post only when the number of followers increases compared to the previous period.'
        : `Post only when the number of ${entityLower}s increases compared to the previous period.`,
    },
    total: {
      label: isFollowers ? 'Total New Followers Count' : `Total ${entity} Count`,
      help: isFollowers
        ? 'Post the total number of followers for a chosen timeframe.'
        : `Post the total number of ${entityLower}s for a chosen timeframe.`,
    },
    customGoal: {
      label: 'Custom Goal',
      help: isFollowers
        ? 'Set a followers goal and post daily progress updates until the goal is achieved.'
        : `Set a ${entityLower} goal and post daily progress updates until the goal is achieved.`,
    },
  };

  return copies[conditionId] || null;
}

const SALES_CONDITION_COPY = {
  everyNew: {
    label: 'Every New Sale',
    help: 'Post every time a new sale is made to keep your audience excited and engaged.',
  },
  customCount: {
    label: 'Custom Sales Count',
    help: 'Post when you reach a set number of sales. Customize the count to fit your goals.',
  },
  growth: {
    label: 'Growth Comparison',
    help: 'Post only when your sales increase compared to the previous period to highlight positive trends.',
  },
  total: {
    label: 'Total Sales Count',
    help: 'Post the total number of sales for a chosen timeframe.',
  },
  customGoal: {
    label: 'Custom Goal',
    help: 'Set a sales goal and post daily progress updates until the goal is reached.',
  },
};

const SUBSCRIBER_CONDITION_COPY = {
  everyNew: {
    label: 'Every New Subscriber',
    help: 'Post every time someone subscribes to keep your audience engaged.',
  },
  everyRecurring: {
    label: 'Every Recurring Subscribers',
    help: 'Post every time a recurring subscriber renews their subscription to keep your audience engaged.',
  },
  customCount: {
    label: 'Custom New Subscribers Count',
    help: 'Post when you reach a set number of new subscribers. Customize the count as needed.',
  },
  customRecurringCount: {
    label: 'Custom Recurring Subscribers Count',
    help: 'Post when you hit a set number of recurring subscribers. Customize the count to your preference.',
  },
  growth: {
    label: 'Growth Comparison',
    help: 'Post only when the number of subscribers increases compared to the previous period.',
  },
  total: {
    label: 'Total Subscribers Count',
    help: 'Post the total number of subscribers for a chosen timeframe.',
  },
  customGoal: {
    label: 'Custom Goal',
    help: 'Set a subscriber goal and post daily progress updates until the goal is achieved.',
  },
};

const TIP_CONDITION_COPY = {
  everyNew: {
    label: 'Every New Tip',
    help: 'Post every time a new tip is made to keep your audience excited and engaged.',
  },
  customTokensCount: {
    label: 'Custom Tokens Count',
    help: 'Post when you reach a set number of tokens received. Customize the count to fit your goals.',
  },
  totalTokensCount: {
    label: 'Total Tokens Count',
    help: 'Post the total number of tokens received for a chosen timeframe.',
  },
  customGoal: {
    label: 'Custom Goal',
    help: 'Set a tip goal and post daily progress updates until the goal is reached.',
  },
};

const CASH_GIFT_CONDITION_COPY = {
  everyCashGift: {
    label: 'Every Cash Gift Received',
    help: 'Post every time a new cash gift is made to keep your audience excited and engaged.',
  },
  customCashGiftsCount: {
    label: 'Custom Cash Gifts Count',
    help: 'Post when you reach a set number of cash gifts received. Customize the count to fit your goals.',
  },
  totalCashGiftsCount: {
    label: 'Total Cash Gifts Count',
    help: 'Post the total number of cash gifts received for a chosen timeframe.',
  },
  customGoal: {
    label: 'Custom Goal',
    help: 'Set a cash gift goal and post daily progress updates until the goal is reached.',
  },
};

const GOING_LIVE_CONDITION_COPY = {
  whenGoingLive: {
    label: 'Going Live',
    help: 'Post when you start a live streaming session.',
  },
};

export function conditionsForTypeMetric(typeId, metricId) {
  if (!typeId || !metricId) return [];
  return CONDITIONS_BY_TYPE_METRIC[typeId]?.[metricId] || [];
}

export function defaultConditionForTypeMetric(typeId, metricId) {
  const conditions = conditionsForTypeMetric(typeId, metricId);
  return conditions.length === 1 ? conditions[0] : '';
}

export function getConditionCopy(typeId, metricId, conditionId) {
  if (typeId === 'profile') {
    return profileConditionCopy(metricId, conditionId);
  }

  if (typeId === 'subscription' && metricId === 'subscribers') {
    return SUBSCRIBER_CONDITION_COPY[conditionId] || null;
  }

  if (typeId === 'livestream' && metricId === 'goingLive') {
    return GOING_LIVE_CONDITION_COPY[conditionId] || null;
  }

  if (TIP_CONDITIONS.includes(conditionId) && ['livestream', 'privateChat', 'videoCall', 'audioCall'].includes(typeId) && metricId === 'tip') {
    return TIP_CONDITION_COPY[conditionId] || null;
  }

  if (CASH_GIFT_CONDITIONS.includes(conditionId) && metricId === 'cashGift') {
    return CASH_GIFT_CONDITION_COPY[conditionId] || null;
  }

  if (SALES_CONDITIONS.includes(conditionId)) {
    return SALES_CONDITION_COPY[conditionId] || null;
  }

  return null;
}

export function showsCountFields(conditionId) {
  return ['customCount', 'customRecurringCount', 'customTokensCount', 'customCashGiftsCount'].includes(
    conditionId,
  );
}

export function showsFrequency(conditionId) {
  return ['customGoal', 'growth', 'total', 'totalTokensCount', 'totalCashGiftsCount'].includes(
    conditionId,
  );
}

export function isInstantCondition(conditionId) {
  return conditionId === 'whenGoingLive';
}

const SALES_AGGREGATE_METRICS = ['salesUsd', 'salesQty', 'views', 'sales'];

function isSalesAggregateContext(typeId, metricId) {
  if (typeId === 'subscription' && metricId === 'salesUsd') return true;
  if (['media', 'merch', 'customRequest'].includes(typeId) && SALES_AGGREGATE_METRICS.includes(metricId)) {
    return true;
  }
  if (['livestream', 'privateChat', 'videoCall', 'audioCall'].includes(typeId) && metricId === 'sales') {
    return true;
  }
  return false;
}

/**
 * Trailing row layout after a condition is selected.
 * kinds:
 * - instant: going live, preview only
 * - description: editable post copy (profile/subscription instant conditions)
 * - salesRangeTotal: frequency + optional custom days + Total + target
 * - salesRangeEvery: frequency + optional custom days + Every + target
 * - salesSimpleTotal: frequency (no custom-range days) + Total + target
 * - tokensEvery: frequency + Every + target (Tokens suffix)
 */
export function getRowFlow(typeId, metricId, conditionId) {
  if (!conditionId) return null;
  if (conditionId === 'whenGoingLive') {
    return { kind: 'instant' };
  }

  if (typeId === 'profile' && conditionId === 'everyNew') {
    return { kind: 'description' };
  }

  if (
    typeId === 'subscription' &&
    metricId === 'subscribers' &&
    ['everyNew', 'everyRecurring'].includes(conditionId)
  ) {
    return { kind: 'description' };
  }

  if (conditionId === 'everyCashGift') {
    return { kind: 'description' };
  }

  if (
    conditionId === 'everyNew' &&
    ['privateChat', 'videoCall', 'audioCall', 'livestream'].includes(typeId) &&
    metricId !== 'sales'
  ) {
    return { kind: 'description' };
  }

  if (
    conditionId === 'everyNew' &&
    ['privateChat', 'videoCall', 'audioCall', 'livestream'].includes(typeId) &&
    metricId === 'sales'
  ) {
    return { kind: 'description' };
  }

  if (metricId === 'tip' && conditionId === 'customTokensCount') {
    return { kind: 'tokensEvery', defaultFrequency: 'weekly' };
  }

  if (conditionId === 'customCashGiftsCount') {
    return { kind: 'tokensEvery', defaultFrequency: 'weekly', valueSuffix: 'cashGifts' };
  }

  if (
    typeId === 'subscription' &&
    metricId === 'subscribers' &&
    conditionId === 'customCount'
  ) {
    return {
      kind: 'salesRangeEvery',
      defaultFrequency: 'customRange',
      showTierPicker: true,
      valueSuffix: 'newSubscribers',
    };
  }

  if (
    typeId === 'subscription' &&
    metricId === 'subscribers' &&
    conditionId === 'customRecurringCount'
  ) {
    return {
      kind: 'salesRangeEvery',
      defaultFrequency: 'customRange',
      showTierPicker: true,
      valueSuffix: 'recurringSubscribers',
    };
  }

  if (['customCount', 'customRecurringCount'].includes(conditionId)) {
    return { kind: 'salesRangeEvery', defaultFrequency: 'customRange' };
  }

  if (typeId === 'customRequest' && conditionId === 'everyNew') {
    return { kind: 'salesSimpleTotal', defaultFrequency: 'weekly' };
  }

  if (conditionId === 'everyNew' && isSalesAggregateContext(typeId, metricId)) {
    return { kind: 'salesRangeTotal', defaultFrequency: 'customRange' };
  }

  if (typeId === 'merch' && conditionId === 'customGoal') {
    return {
      kind: 'salesRangeEvery',
      defaultFrequency: '',
      showMerchPicker: true,
      pickFrequencyFirst: true,
    };
  }

  if (['growth', 'total', 'customGoal', 'totalTokensCount', 'totalCashGiftsCount'].includes(conditionId)) {
    return { kind: 'salesRangeTotal', defaultFrequency: 'customRange' };
  }

  if (typeId === 'profile' || (typeId === 'subscription' && metricId === 'subscribers')) {
    return { kind: 'salesRangeTotal', defaultFrequency: 'customRange' };
  }

  return { kind: 'description' };
}

export function getDefaultTargetValue(_flowKind) {
  return '';
}

export function getDefaultCustomDays(flowKind) {
  return flowKind === 'salesRangeEvery' ? '10' : '7';
}
