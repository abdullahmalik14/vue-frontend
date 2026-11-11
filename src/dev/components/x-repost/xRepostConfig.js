import {
  conditionsForTypeMetric,
  defaultConditionForTypeMetric,
  getConditionCopy,
  showsCountFields,
  showsFrequency,
  isInstantCondition,
  getRowFlow,
  getDefaultTargetValue,
  getDefaultCustomDays,
  CONDITION_ICON_KEY,
} from './xRepostConditionFlows.js';
import {
  DEFAULT_SUBSCRIPTION_TIER_ID,
  SUBSCRIPTION_TIER_OPTIONS,
  subscriptionTierById,
} from './xRepostSubscriptionTiers.js';

export {
  conditionsForTypeMetric,
  defaultConditionForTypeMetric,
  getConditionCopy,
  showsCountFields,
  showsFrequency,
  isInstantCondition,
  getRowFlow,
  getDefaultTargetValue,
  getDefaultCustomDays,
  CONDITION_ICON_KEY,
  DEFAULT_SUBSCRIPTION_TIER_ID,
  SUBSCRIPTION_TIER_OPTIONS,
  subscriptionTierById,
};

export const TYPE_OPTIONS = [
  { id: 'profile' },
  { id: 'subscription' },
  { id: 'media' },
  { id: 'merch' },
  { id: 'customRequest' },
  { id: 'livestream' },
  { id: 'privateChat' },
  { id: 'videoCall' },
  { id: 'audioCall' },
];

export const TYPE_THEME = {
  profile: { selected: 'bg-[#ECFDFF] dark:bg-[#0c3a44]', add: 'bg-[#06AED4]', icon: '#22CCEE' },
  subscription: { selected: 'bg-[#FFF1F3] dark:bg-[#4a1520]', add: 'bg-[#F63D68]', icon: '#FD6F8E' },
  media: { selected: 'bg-[#FDF4FF] dark:bg-[#2e1a4a]', add: 'bg-[#7A5AF8]', icon: '#E478FA' },
  merch: { selected: 'bg-[#ECFDFF] dark:bg-[#0c3a44]', add: 'bg-[#06AED4]', icon: '#22CCEE' },
  customRequest: { selected: 'bg-[#ECFDF3] dark:bg-[#0c3b24]', add: 'bg-[#12B76A]', icon: '#85E13A' },
  livestream: { selected: 'bg-[#FFF6ED] dark:bg-[#4a2c14]', add: 'bg-[#F79009]', icon: '#F79009' },
  privateChat: { selected: 'bg-[#FEFCE8] dark:bg-[#3f3a12]', add: 'bg-[#EAAA08]', icon: '#FAC515' },
  videoCall: { selected: 'bg-[#FDF2F8] dark:bg-[#4a1535]', add: 'bg-[#EE46BC]', icon: '#F670C7' },
  audioCall: { selected: 'bg-[#ECFDF5] dark:bg-[#0c3b2a]', add: 'bg-[#12B76A]', icon: '#47CD89' },
};

export const METRICS_BY_TYPE = {
  profile: ['profileLikes', 'feedLikes', 'profileVisits', 'followers'],
  subscription: ['salesUsd', 'subscribers'],
  media: ['salesUsd', 'salesQty', 'views'],
  merch: ['salesUsd', 'salesQty', 'views'],
  customRequest: ['salesUsd', 'salesQty'],
  livestream: ['goingLive', 'tip', 'cashGift', 'sales'],
  privateChat: ['tip', 'cashGift', 'sales'],
  videoCall: ['tip', 'cashGift', 'sales'],
  audioCall: ['tip', 'cashGift', 'sales'],
};

export const METRIC_ICON_KEY = {
  profileLikes: 'likes',
  feedLikes: 'likes',
  profileVisits: 'metricEye',
  followers: 'metricUser',
  salesUsd: 'salesUsd',
  subscribers: 'metricUser',
  subscriptionPlan: 'metricUser',
  salesQty: 'salesQty',
  mediaLikes: 'likes',
  views: 'metricEye',
  watchDuration: 'metricEye',
  merchLikes: 'likes',
  goingLive: 'goingLive',
  tip: 'tip',
  cashGift: 'cashGift',
  sales: 'salesCart',
};

export const CONDITION_IDS = ['everyNew', 'customCount', 'growth', 'total', 'customGoal'];

export const FREQUENCY_IDS = ['daily', 'weekly', 'monthly', 'customRange'];

/** Custom Range dropdown column width (px) */
export const FREQUENCY_RANGE_WIDTH = 170;
/** 7 Days column width (px) */
export const FREQUENCY_DAYS_WIDTH = 96;
/** Daily/Weekly/Monthly column = Custom Range + 7 Days combined */
export const FREQUENCY_SIMPLE_WIDTH = FREQUENCY_RANGE_WIDTH + FREQUENCY_DAYS_WIDTH;

/** Row column widths (px) — first three columns share equal width */
export const ROW_LEADING_COLUMN_WIDTH = 200;
export const ROW_TYPE_WIDTH = ROW_LEADING_COLUMN_WIDTH;
export const ROW_METRIC_WIDTH = ROW_LEADING_COLUMN_WIDTH;
export const ROW_CONDITIONS_WIDTH = ROW_LEADING_COLUMN_WIDTH;
export const ROW_MERCH_PICKER_WIDTH = 200;
export const ROW_COUNT_WIDTH = 130;
export const ROW_GOAL_WIDTH = 248;
/** Wide enough for "Total / Enter Amount / Items Sold" without squashing the scroll track */
export const ROW_AGGREGATE_MIN_WIDTH = 360;
export const ROW_PREVIEW_WIDTH = 128;
export const ROW_MENU_WIDTH = 40;

export function themeForType(typeId) {
  return TYPE_THEME[typeId] || TYPE_THEME.profile;
}

export function metricsForType(typeId) {
  return METRICS_BY_TYPE[typeId] || [];
}

export function defaultMetricForType(typeId) {
  return metricsForType(typeId)[0] || '';
}

export function showsCustomRangeFields(conditionId, frequencyId) {
  return showsFrequency(conditionId) && frequencyId === 'customRange';
}

export function createRule({ type, metric, status = 'unsaved' }) {
  const condition = defaultConditionForTypeMetric(type, metric);
  const flow = getRowFlow(type, metric, condition);
  const copy = getConditionCopy(type, metric, condition);

  return {
    id: Date.now() + Math.random(),
    type,
    metric,
    status,
    condition,
    frequency: '',
    customDays: flow ? getDefaultCustomDays(flow.kind) : '7',
    targetValue: '',
    progressCurrent: 0,
    postMessage: flow?.kind === 'description' ? copy?.help || '' : '',
    merchItemId: '',
    tierId: '',
  };
}
