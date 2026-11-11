<script setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import XRepostDropdown from './XRepostDropdown.vue';
import XRepostMerchPickerDropdown from './XRepostMerchPickerDropdown.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';
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

const props = defineProps({
  rule: {
    type: Object,
    required: true,
  },
  assets: {
    type: Object,
    required: true,
  },
  dimmed: {
    type: Boolean,
    default: false,
  },
  isDropdownActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:rule',
  'request-delete',
  'request-discard',
  'dropdown-open',
  'dropdown-close',
  'preview-save',
]);

const { t } = useI18n();
const menuAnchor = ref(null);
const menuDropdownRef = ref(null);
const openDropdownCount = ref(0);

function onDropdownOpen() {
  openDropdownCount.value += 1;
  if (openDropdownCount.value === 1) {
    emit('dropdown-open', props.rule.id);
  }
}

function onDropdownClose() {
  openDropdownCount.value = Math.max(0, openDropdownCount.value - 1);
  if (openDropdownCount.value === 0) {
    emit('dropdown-close', props.rule.id);
  }
}

const cellClass = 'h-[52px] shrink-0 border-r border-b border-[#D0D5DD] box-border';
const growCellClass = 'h-[52px] min-w-0 border-r border-b border-[#D0D5DD] box-border';
const cellPadding = 'px-3';

function patch(partial) {
  emit('update:rule', { ...props.rule, ...partial });
}

const rowTheme = computed(() => TYPE_THEME[props.rule.type] || TYPE_THEME.profile);

const typeOptions = computed(() =>
  TYPE_OPTIONS.map((item) => ({
    value: item.id,
    label: t(`dashboard.xRepost.types.${item.id}`),
    icon: props.assets[item.id],
  })),
);

const metricOptions = computed(() =>
  metricsForType(props.rule.type).map((id) => ({
    value: id,
    label: t(`dashboard.xRepost.metrics.${id}`),
    description: t(`dashboard.xRepost.metricHelp.${props.rule.type}.${id}`),
    icon: props.assets[METRIC_ICON_KEY[id] || id],
  })),
);

const conditionOptions = computed(() => {
  if (!props.rule.metric) return [];

  return conditionsForTypeMetric(props.rule.type, props.rule.metric).map((id) => {
    const copy = getConditionCopy(props.rule.type, props.rule.metric, id);
    const iconKey = CONDITION_ICON_KEY[id] || METRIC_ICON_KEY[props.rule.metric] || 'tip';

    return {
      value: id,
      label: copy?.label || t(`dashboard.xRepost.conditions.${id}.label`),
      description: copy?.help || t(`dashboard.xRepost.conditions.${id}.help`),
      icon: props.assets[iconKey],
    };
  });
});

const showConditionField = computed(() => {
  if (!props.rule.metric) return false;

  const conditions = conditionsForTypeMetric(props.rule.type, props.rule.metric);
  if (conditions.length === 1 && isInstantCondition(conditions[0])) return false;

  return conditions.length > 0;
});

const rowFlow = computed(() => {
  if (!props.rule.condition) return null;
  return getRowFlow(props.rule.type, props.rule.metric, props.rule.condition);
});

const frequencyOptions = computed(() =>
  FREQUENCY_IDS.map((id) => ({
    value: id,
    label: t(`dashboard.xRepost.frequency.${id}`),
  })),
);

const showFrequencyField = computed(() => {
  const flow = rowFlow.value;
  if (!flow) return false;
  if (flow.showMerchPicker && !props.rule.merchItemId) return false;
  if (flow.showTierPicker && !props.rule.tierId) return false;
  return ['salesRangeTotal', 'salesRangeEvery', 'salesSimpleTotal', 'tokensEvery'].includes(flow.kind);
});

const showRangeFields = computed(() => {
  const flow = rowFlow.value;
  if (!flow) return false;
  if (!['salesRangeTotal', 'salesRangeEvery'].includes(flow.kind)) return false;
  return props.rule.frequency === 'customRange';
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
  if (flow.showMerchPicker && !props.rule.merchItemId) return false;
  if (flow.showTierPicker && !props.rule.tierId) return false;
  if (!props.rule.frequency) return false;
  return true;
});

const hasTargetValue = computed(() => String(props.rule.targetValue ?? '').trim() !== '');

const aggregateLabel = computed(() => t('dashboard.xRepost.labels.total'));

const valueSuffixLabel = computed(() => {
  const flow = rowFlow.value;
  if (!flow) return '';
  if (flow.valueSuffix === 'cashGifts') {
    return t('dashboard.xRepost.labels.cashGifts');
  }
  if (flow.valueSuffix === 'newSubscribers') {
    return t('dashboard.xRepost.labels.newSubscribers');
  }
  if (flow.valueSuffix === 'recurringSubscribers') {
    return t('dashboard.xRepost.labels.recurringSubscribers');
  }
  if (flow.kind === 'tokensEvery') {
    return t('dashboard.xRepost.labels.tokens');
  }
  return t('dashboard.xRepost.labels.itemsSold');
});

const showPreview = computed(() => {
  if (isInstantCondition(props.rule.condition)) return true;
  if (!props.rule.condition) return false;
  const flow = rowFlow.value;
  if (!flow) return false;
  if (flow.kind === 'description' || flow.kind === 'instant') return true;
  if (!showAggregateFields.value) return false;
  return hasTargetValue.value;
});

const previewAction = computed(() => {
  if (props.rule.status === 'draft') {
    return {
      labelKey: 'dashboard.xRepost.editDraft',
      icon: props.assets.editDraft || props.assets.previewEye,
    };
  }
  if (props.rule.status === 'published') {
    return {
      labelKey: 'dashboard.xRepost.previewPost',
      icon: props.assets.previewEye,
    };
  }
  return {
    labelKey: 'dashboard.xRepost.previewAndSave',
    icon: props.assets.previewEye,
  };
});

/** Unsaved rows use discard (X); published/draft keep the ⋮ delete menu */
const showDiscardControl = computed(
  () => props.rule.status !== 'published' && props.rule.status !== 'draft',
);

function handleDiscardClick() {
  emit('request-discard', props.rule.id);
}

/** Always reserve Preview Post column width once Total/description is visible */
const showPreviewColumn = computed(() => {
  if (!props.rule.condition) return false;
  const flow = rowFlow.value;
  if (!flow) return false;
  if (flow.kind === 'description' || flow.kind === 'instant') return true;
  return showAggregateFields.value;
});

const showRowFill = computed(
  () => !showDescriptionField.value && !showAggregateFields.value,
);

/** Push Total / Items Sold to the end of the row, before preview */
const showLeadingSpacer = computed(
  () => showPreviewColumn.value && showAggregateFields.value,
);

const frequencyWidthClass = computed(() =>
  showRangeFields.value ? 'w-[170px] shrink-0' : 'w-[266px] shrink-0',
);

const frequencyPanelWidth = computed(() =>
  showRangeFields.value ? FREQUENCY_RANGE_WIDTH : FREQUENCY_SIMPLE_WIDTH,
);

const amountInputStyle = computed(() => {
  if (!hasTargetValue.value) {
    return { width: '104px', minWidth: '104px', maxWidth: '104px' };
  }
  const digits = String(props.rule.targetValue).length;
  const widthCh = Math.max(digits, 1) + 0.5;
  return { width: `${widthCh}ch`, minWidth: `${widthCh}ch`, maxWidth: `${widthCh}ch` };
});

const amountInputAlignClass = computed(() =>
  hasTargetValue.value ? 'text-right' : 'text-left',
);

const descriptionInputClass = `${inputFieldClass} whitespace-nowrap`;

const menuDropdownConfig = {
  trigger: 'click',
  align: 'right',
  positionMode: 'above',
  offset: 8,
  width: 130,
  zIndexBase: 10100,
  closeOnOutsideClick: true,
  style: {
    class: 'overflow-hidden rounded-lg bg-[#FFFFFFB2] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.08)] backdrop-blur-[12px]',
  },
};

function applyFlowDefaults(type, metric, condition) {
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
  const condition = defaultConditionForTypeMetric(props.rule.type, metricId);
  patch({
    metric: metricId,
    ...applyFlowDefaults(props.rule.type, metricId, condition),
  });
}

function onConditionChange(conditionId) {
  patch(applyFlowDefaults(props.rule.type, props.rule.metric, conditionId));
}

function handleDelete() {
  emit('request-delete', props.rule.id);
  nextTick(() => {
    menuDropdownRef.value?.close();
  });
}

const leadingColumnWidthClass = 'w-[200px] shrink-0';

const inputWrapperClass =
  '!h-[52px] !border-transparent !bg-transparent !shadow-none !pl-0 !pr-0';
const inputFieldClass =
  'w-full min-w-0 text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3] placeholder:text-[#667085]';
const daysInputWrapperClass =
  '!h-[52px] !w-[28px] !min-w-[28px] !max-w-[28px] !border-transparent !bg-transparent !shadow-none !px-0 !pl-0 !pr-0';
const daysInputClass = `${inputFieldClass} !w-[28px] !min-w-[28px] text-center`;
const amountInputWrapperClass =
  '!h-6 !w-full !min-w-0 !max-w-none !flex-none !border-transparent !border-b-0 !bg-transparent !p-0 !px-0 !shadow-none [box-shadow:none]';
const amountInputClass =
  `${inputFieldClass} !h-6 !min-h-0 !w-full !min-w-0 !py-0 !leading-6 !p-0 font-semibold`;
</script>

<template>
  <div
    class="flex h-[52px] w-full min-w-max items-stretch bg-[#F4F5F3] transition-opacity duration-200"
    :class="[
      dimmed ? 'opacity-20' : '',
      isDropdownActive ? 'relative z-[2]' : '',
    ]"
  >
    <div
      class="sticky left-0 z-[1] flex shrink-0 items-stretch bg-[#F4F5F3]"
      :class="leadingColumnWidthClass"
    >
      <XRepostDropdown
        :model-value="rule.type"
        :options="typeOptions"
        :chevron-icon="assets.chevron"
        :trigger-class="rowTheme.selected"
        :selected-option-class="rowTheme.selected"
        :width-class="`${leadingColumnWidthClass} !w-full`"
        :truncate-label="true"
        label-class="text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="onTypeChange"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />
    </div>

      <XRepostDropdown
        :model-value="rule.metric"
        :options="metricOptions"
        :chevron-icon="assets.chevron"
        :trigger-class="rowTheme.selected"
        :selected-option-class="rowTheme.selected"
        :icon-tint-color="rowTheme.icon"
        :width-class="leadingColumnWidthClass"
        :truncate-label="true"
        option-layout="rich"
        :panel-min-width="280"
        label-class="text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="onMetricChange"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <XRepostDropdown
        v-if="showConditionField"
        :model-value="rule.condition"
        :options="conditionOptions"
        :placeholder="t('dashboard.xRepost.conditions.placeholder')"
        :chevron-icon="assets.chevron"
        :help-icon="assets.help"
        :show-help="Boolean(rule.condition)"
        :show-trigger-icon="false"
        :selected-option-class="rowTheme.selected"
        :icon-tint-color="rowTheme.icon"
        option-layout="rich"
        :panel-min-width="280"
        :width-class="leadingColumnWidthClass"
        label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="onConditionChange"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <XRepostMerchPickerDropdown
        v-if="showMerchPicker"
        :model-value="rule.merchItemId || ''"
        :chevron-icon="assets.chevron"
        @update:model-value="(value) => patch({ merchItemId: value })"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <XRepostDropdown
        v-if="showTierPicker"
        :model-value="rule.tierId || ''"
        :options="tierOptions"
        :placeholder="t('dashboard.xRepost.tiers.placeholder')"
        :chevron-icon="assets.chevron"
        :help-icon="assets.help"
        :show-help="Boolean(rule.tierId)"
        :show-trigger-icon="false"
        :selected-option-class="rowTheme.selected"
        :width-class="leadingColumnWidthClass"
        :truncate-label="true"
        option-layout="rich"
        :panel-min-width="280"
        label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="(value) => patch({ tierId: value })"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <XRepostDropdown
        v-if="showFrequencyField"
        :model-value="rule.frequency"
        :options="frequencyOptions"
        :placeholder="t('dashboard.xRepost.frequency.placeholder')"
        :chevron-icon="assets.chevron"
        :help-icon="assets.help"
        :show-help="Boolean(rule.frequency)"
        :width-class="frequencyWidthClass"
        :panel-width="frequencyPanelWidth"
        :truncate-label="true"
        :selected-option-class="rowTheme.selected"
        label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#0C111D]"
        @update:model-value="(value) => patch({ frequency: value })"
        @open="onDropdownOpen"
        @close="onDropdownClose"
      />

      <div
        v-if="showRangeFields"
        :class="[cellClass, cellPadding, 'flex w-[96px] shrink-0 items-center justify-end']"
      >
        <div class="flex shrink-0 items-center gap-1">
          <DashboardTextInput
            :model-value="rule.customDays"
            type="number"
            :show-label="false"
            :show-controls="false"
            :placeholder="t('dashboard.xRepost.placeholders.days')"
            :wrapper-class="daysInputWrapperClass"
            :input-class="daysInputClass"
            @update:model-value="(value) => patch({ customDays: value })"
          />
          <span class="shrink-0 whitespace-nowrap text-sm font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('dashboard.xRepost.units.days') }}
          </span>
        </div>
      </div>

      <div
        v-if="showDescriptionField"
        :class="[
          growCellClass,
          cellPadding,
          'flex min-w-[280px] flex-1 items-center',
          showPreviewColumn ? '!border-r-0' : '',
        ]"
      >
        <DashboardTextInput
          :model-value="rule.postMessage"
          :show-label="false"
          :show-controls="false"
          :placeholder="t('dashboard.xRepost.placeholders.postMessage')"
          :wrapper-class="inputWrapperClass"
          :input-class="descriptionInputClass"
          @update:model-value="(value) => patch({ postMessage: value })"
        />
      </div>

      <div
        v-if="showLeadingSpacer"
        :class="[growCellClass, 'min-w-0 flex-1 !border-r-0']"
        aria-hidden="true"
      ></div>

      <div
        v-if="showAggregateFields"
        :class="[
          growCellClass,
          cellPadding,
          'flex w-[248px] shrink-0 items-center justify-between gap-2',
          showPreviewColumn ? '!border-r-0' : '',
        ]"
      >
        <span class="flex h-6 shrink-0 items-center whitespace-nowrap text-sm font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
          {{ aggregateLabel }}
        </span>
        <div class="ml-auto flex shrink-0 items-center gap-1">
          <div class="shrink-0" :style="amountInputStyle">
            <DashboardTextInput
              :model-value="rule.targetValue"
              type="number"
              :show-label="false"
              :show-controls="false"
              :placeholder="t('dashboard.xRepost.placeholders.amount')"
              :wrapper-class="amountInputWrapperClass"
              :input-class="`${amountInputClass} ${amountInputAlignClass}`"
              @update:model-value="(value) => patch({ targetValue: value })"
            />
          </div>
          <span class="flex h-6 shrink-0 items-center whitespace-nowrap text-sm font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
            {{ valueSuffixLabel }}
          </span>
        </div>
      </div>

      <div
        v-if="showRowFill"
        :class="[growCellClass, 'min-w-[24px] flex-1']"
        aria-hidden="true"
      ></div>

    <div class="sticky right-0 z-[1] flex shrink-0 items-stretch bg-[#F4F5F3]">
      <div
        v-if="showPreviewColumn"
        :class="[cellClass, 'flex w-[148px] shrink-0 items-stretch border-l border-[#D0D5DD]']"
      >
        <button
          v-if="showPreview"
          type="button"
          class="group flex h-full w-full items-center gap-1.5 px-3 text-xs font-normal leading-6 text-[#344054] transition-colors hover:bg-[#0C111D] hover:text-[#07F468] active:bg-[#0C111D] active:text-[#07F468] dark:text-[#dbd8d3]"
          @click="emit('preview-save', rule)"
        >
          <span
            v-if="previewAction.icon"
            class="size-4 shrink-0 bg-[#344054] transition-colors group-hover:bg-[#07F468] group-active:bg-[#07F468] dark:bg-[#dbd8d3]"
            :style="{
              WebkitMaskImage: `url(${previewAction.icon})`,
              maskImage: `url(${previewAction.icon})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }"
            aria-hidden="true"
          />
          <span class="whitespace-nowrap">
            {{ t(previewAction.labelKey) }}
          </span>
        </button>
      </div>

      <div
        class="relative flex h-[52px] w-10 shrink-0 items-center justify-center border-b border-l border-[#D0D5DD] bg-[#FFFFFFB2] box-border"
      >
        <button
          v-if="showDiscardControl"
          type="button"
          class="flex size-6 cursor-pointer items-center justify-center"
          :aria-label="t('dashboard.xRepost.leaveConfirm.discard')"
          @click.stop="handleDiscardClick"
        >
          <img
            v-if="assets.discard"
            :src="assets.discard"
            alt=""
            width="20"
            height="20"
            class="size-5 object-contain"
          />
        </button>

        <template v-else>
          <div
            ref="menuAnchor"
            tabindex="0"
            class="flex size-6 cursor-pointer items-center justify-center"
          >
            <img
              v-if="assets.more"
              :src="assets.more"
              alt=""
              width="16"
              height="16"
              class="size-4 object-contain"
            />
          </div>

          <DropdownMenu
            v-if="menuAnchor"
            ref="menuDropdownRef"
            :anchor="menuAnchor"
            :config="menuDropdownConfig"
            @open="onDropdownOpen"
            @close="onDropdownClose"
          >
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-[14px] text-left hover:bg-white/50"
              @click.stop="handleDelete"
            >
              <img
                v-if="assets.trash"
                :src="assets.trash"
                alt=""
                width="16"
                height="16"
                class="size-4 shrink-0 object-contain"
              />
              <span class="whitespace-nowrap text-xs font-medium text-[#ff4405]">
                {{ t('dashboard.xRepost.delete') }}
              </span>
            </button>
          </DropdownMenu>
        </template>
      </div>
    </div>
  </div>
</template>
