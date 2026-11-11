import { computed } from 'vue';
import {
  TYPE_OPTIONS,
  TYPE_THEME,
  FREQUENCY_IDS,
  FREQUENCY_RANGE_WIDTH,
  FREQUENCY_SIMPLE_WIDTH,
  METRIC_ICON_KEY,
  CONDITION_ICON_KEY,
  metricsForType,
  defaultMetricForType,
  conditionsForTypeMetric,
  defaultConditionForTypeMetric,
  getConditionCopy,
  isInstantCondition,
  getRowFlow,
  getDefaultCustomDays,
  SUBSCRIPTION_TIER_OPTIONS,
} from './xRepostConfig.js';

export function applyFlowDefaults(type, metric, condition) {
  const flow = getRowFlow(type, metric, condition);
  const copy = getConditionCopy(type, metric, condition);

  if (!flow) {
    return {
      condition,
      frequency: '',
      customDays: '7',
      targetValue: '',
      postMessage: '',
      merchItemId: '',
      tierId: '',
    };
  }

  return {
    condition,
    frequency: '',
    customDays: getDefaultCustomDays(flow.kind),
    targetValue: '',
    postMessage: flow.kind === 'description' ? copy?.help || '' : '',
    merchItemId: '',
    tierId: '',
  };
}

export function useXRepostRuleDraft(rule, patch, { t, assets }) {
  const rowTheme = computed(() => TYPE_THEME[rule.value.type] || TYPE_THEME.profile);

  const typeOptions = computed(() =>
    TYPE_OPTIONS.map((item) => ({
      value: item.id,
      label: t(`dashboard.xRepost.types.${item.id}`),
      icon: assets.value[item.id],
    })),
  );

  const metricOptions = computed(() =>
    metricsForType(rule.value.type).map((id) => ({
      value: id,
      label: t(`dashboard.xRepost.metrics.${id}`),
      description: t(`dashboard.xRepost.metricHelp.${rule.value.type}.${id}`),
      icon: assets.value[METRIC_ICON_KEY[id] || id],
    })),
  );

  const conditionOptions = computed(() => {
    if (!rule.value.metric) return [];

    return conditionsForTypeMetric(rule.value.type, rule.value.metric).map((id) => {
      const copy = getConditionCopy(rule.value.type, rule.value.metric, id);
      const iconKey = CONDITION_ICON_KEY[id] || METRIC_ICON_KEY[rule.value.metric] || 'tip';

      return {
        value: id,
        label: copy?.label || t(`dashboard.xRepost.conditions.${id}.label`),
        description: copy?.help || t(`dashboard.xRepost.conditions.${id}.help`),
        icon: assets.value[iconKey],
      };
    });
  });

  const showConditionField = computed(() => {
    if (!rule.value.metric) return false;
    const conditions = conditionsForTypeMetric(rule.value.type, rule.value.metric);
    if (conditions.length === 1 && isInstantCondition(conditions[0])) return false;
    return conditions.length > 0;
  });

  const rowFlow = computed(() => {
    if (!rule.value.condition) return null;
    return getRowFlow(rule.value.type, rule.value.metric, rule.value.condition);
  });

  const frequencyOptions = computed(() =>
    FREQUENCY_IDS.map((id) => ({
      value: id,
      label: t(`dashboard.xRepost.frequency.${id}`),
    })),
  );

  const isSalesAggregateKind = computed(() => {
    const kind = rowFlow.value?.kind;
    return ['salesRangeTotal', 'salesRangeEvery', 'salesSimpleTotal', 'tokensEvery'].includes(kind);
  });

  const showFrequencyField = computed(() => {
    const flow = rowFlow.value;
    if (!flow) return false;
    if (flow.showMerchPicker && !rule.value.merchItemId) return false;
    if (flow.showTierPicker && !rule.value.tierId) return false;
    return isSalesAggregateKind.value;
  });

  const showAmountField = computed(() => {
    const flow = rowFlow.value;
    if (!flow || !isSalesAggregateKind.value) return false;
    if (flow.showMerchPicker && !rule.value.merchItemId) return false;
    if (flow.showTierPicker && !rule.value.tierId) return false;
    return true;
  });

  const showRangeFields = computed(() => {
    const flow = rowFlow.value;
    if (!flow) return false;
    if (!['salesRangeTotal', 'salesRangeEvery'].includes(flow.kind)) return false;
    return rule.value.frequency === 'customRange';
  });

  const showDescriptionField = computed(() => rowFlow.value?.kind === 'description');
  const showMerchPicker = computed(() => Boolean(rowFlow.value?.showMerchPicker));
  const showTierPicker = computed(() => Boolean(rowFlow.value?.showTierPicker));

  const tierOptions = computed(() =>
    SUBSCRIPTION_TIER_OPTIONS.map((tier) => ({
      value: tier.id,
      label: t(`dashboard.xRepost.tiers.${tier.labelKey}`),
      description: t(`dashboard.xRepost.tiers.${tier.helpKey}`),
    })),
  );

  const showAggregateFields = computed(() => {
    const flow = rowFlow.value;
    if (!flow) return false;
    if (!['salesRangeTotal', 'salesRangeEvery', 'salesSimpleTotal', 'tokensEvery'].includes(flow.kind)) {
      return false;
    }
    if (flow.showMerchPicker && !rule.value.merchItemId) return false;
    if (flow.showTierPicker && !rule.value.tierId) return false;
    if (!rule.value.frequency) return false;
    return true;
  });

  const hasTargetValue = computed(() => String(rule.value.targetValue ?? '').trim() !== '');

  const aggregateLabel = computed(() => {
    const kind = rowFlow.value?.kind;
    if (kind === 'salesRangeEvery' || kind === 'tokensEvery') {
      return t('dashboard.xRepost.labels.every');
    }
    return t('dashboard.xRepost.labels.total');
  });

  const valueSuffixLabel = computed(() => {
    const flow = rowFlow.value;
    if (!flow) return '';
    if (flow.valueSuffix === 'cashGifts') return t('dashboard.xRepost.labels.cashGifts');
    if (flow.valueSuffix === 'newSubscribers') return t('dashboard.xRepost.labels.newSubscribers');
    if (flow.valueSuffix === 'recurringSubscribers') return t('dashboard.xRepost.labels.recurringSubscribers');
    if (flow.kind === 'tokensEvery') return t('dashboard.xRepost.labels.tokens');
    return t('dashboard.xRepost.labels.itemsSold');
  });

  const canPreview = computed(() => {
    if (isInstantCondition(rule.value.condition)) return true;
    if (!rule.value.condition) return false;
    const flow = rowFlow.value;
    if (!flow) return false;
    if (flow.kind === 'description' || flow.kind === 'instant') return true;
    if (!showAggregateFields.value) return false;
    return hasTargetValue.value;
  });

  const frequencyPanelWidth = computed(() =>
    showRangeFields.value ? FREQUENCY_RANGE_WIDTH : FREQUENCY_SIMPLE_WIDTH,
  );

  function onTypeChange(typeId) {
    const metric = defaultMetricForType(typeId);
    const condition = defaultConditionForTypeMetric(typeId, metric);
    patch({
      type: typeId,
      metric,
      ...applyFlowDefaults(typeId, metric, condition),
    });
  }

  function onMetricChange(metricId) {
    const condition = defaultConditionForTypeMetric(rule.value.type, metricId);
    patch({
      metric: metricId,
      ...applyFlowDefaults(rule.value.type, metricId, condition),
    });
  }

  function onConditionChange(conditionId) {
    patch(applyFlowDefaults(rule.value.type, rule.value.metric, conditionId));
  }

  return {
    rowTheme,
    typeOptions,
    metricOptions,
    conditionOptions,
    showConditionField,
    frequencyOptions,
    showFrequencyField,
    showAmountField,
    showRangeFields,
    showDescriptionField,
    showMerchPicker,
    showTierPicker,
    tierOptions,
    showAggregateFields,
    aggregateLabel,
    valueSuffixLabel,
    canPreview,
    frequencyPanelWidth,
    onTypeChange,
    onMetricChange,
    onConditionChange,
  };
}
