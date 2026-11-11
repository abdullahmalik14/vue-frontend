<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import XRepostDropdown from '@/dev/components/x-repost/XRepostDropdown.vue';
import XRepostMerchPickerDropdown from '@/dev/components/x-repost/XRepostMerchPickerDropdown.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useXRepostRuleDraft } from '@/dev/components/x-repost/useXRepostRuleDraft.js';

const props = defineProps({
  rule: {
    type: Object,
    required: true,
  },
  assets: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['patch']);

const { t } = useI18n();
const assetsRef = computed(() => props.assets);
const ruleRef = computed(() => props.rule);

function patch(partial) {
  emit('patch', partial);
}

const {
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
  aggregateLabel,
  valueSuffixLabel,
  canPreview,
  onTypeChange,
  onMetricChange,
  onConditionChange,
} = useXRepostRuleDraft(ruleRef, patch, { t, assets: assetsRef });

defineExpose({
  canPreview,
});

const fieldLabelClass = 'px-3 text-xs font-medium uppercase tracking-wide text-[#0C111D]';
const conditionStackClass = 'x-repost-mobile-condition-stack flex flex-col divide-y divide-[#D0D5DD] border-y border-[#D0D5DD]';
const stackedDropdownProps = {
  showBorderTop: false,
  showBorderBottom: false,
  mobileFieldBorder: false,
};
const inputWrapperClass =
  '!h-[52px] !border-transparent !bg-transparent !shadow-none !pl-0 !pr-0';
const inputFieldClass =
  'w-full min-w-0 text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3] placeholder:text-[#667085]';
const daysInputWrapperClass =
  '!h-[52px] !w-[28px] !min-w-[28px] !max-w-[28px] !border-transparent !bg-transparent !shadow-none !px-0';
const daysInputClass = `${inputFieldClass} !w-[28px] !min-w-[28px] text-center`;
const amountInputWrapperClass =
  '!h-6 !w-auto !min-w-0 !max-w-none !flex-none !border-transparent !bg-transparent !p-0 !shadow-none';
const amountInputClass =
  `${inputFieldClass} !h-6 !min-h-0 !w-full !py-0 !leading-6 font-semibold`;

const hasTargetValue = computed(() => String(props.rule.targetValue ?? '').trim() !== '');
const amountBoxStyle = computed(() => {
  if (!hasTargetValue.value) {
    return { width: '7.5rem', minWidth: '7.5rem', maxWidth: '7.5rem' };
  }
  const digits = String(props.rule.targetValue).length;
  const widthCh = Math.max(digits, 1) + 0.5;
  return { width: `${widthCh}ch`, minWidth: `${widthCh}ch`, maxWidth: `${widthCh}ch` };
});
</script>

<template>
  <div class="flex w-full flex-col gap-6 bg-white dark:bg-[#1b1d1e]">
    <div class="flex flex-col gap-1">
      <p :class="fieldLabelClass">{{ t('dashboard.xRepost.columns.type') }}</p>
      <XRepostDropdown
        :model-value="rule.type"
        :options="typeOptions"
        :chevron-icon="assets.chevron"
        :trigger-class="rowTheme.selected"
        :selected-option-class="rowTheme.selected"
        width-class="w-full"
        :show-border-right="false"
        show-border-top
        :truncate-label="true"
        force-open-above
        label-class="text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="onTypeChange"
      />
    </div>

    <div class="flex flex-col gap-1">
      <p :class="fieldLabelClass">{{ t('dashboard.xRepost.columns.metric') }}</p>
      <XRepostDropdown
        :model-value="rule.metric"
        :options="metricOptions"
        :chevron-icon="assets.chevron"
        :trigger-class="rowTheme.selected"
        :selected-option-class="rowTheme.selected"
        :icon-tint-color="rowTheme.icon"
        width-class="w-full"
        :show-border-right="false"
        show-border-top
        :truncate-label="true"
        force-open-above
        option-layout="rich"
        label-class="text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
        @update:model-value="onMetricChange"
      />
    </div>

    <div v-if="showConditionField" class="flex flex-col gap-1">
      <p :class="fieldLabelClass">{{ t('dashboard.xRepost.columns.conditions') }}</p>
      <div :class="conditionStackClass">
        <XRepostDropdown
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
          width-class="w-full"
          :show-border-right="false"
          :show-border-top="stackedDropdownProps.showBorderTop"
          :show-border-bottom="stackedDropdownProps.showBorderBottom"
          :mobile-field-border="stackedDropdownProps.mobileFieldBorder"
          force-open-above
          label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
          option-title-class="text-base font-medium leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
          option-description-class="w-full text-xs font-normal leading-[18px] text-[#667085]"
          @update:model-value="onConditionChange"
        />

        <XRepostMerchPickerDropdown
          v-if="showMerchPicker"
          :model-value="rule.merchItemId || ''"
          :chevron-icon="assets.chevron"
          width-class="w-full"
          force-open-above
          @update:model-value="(value) => patch({ merchItemId: value })"
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
          width-class="w-full"
          :show-border-right="false"
          :show-border-top="stackedDropdownProps.showBorderTop"
          :show-border-bottom="stackedDropdownProps.showBorderBottom"
          :mobile-field-border="stackedDropdownProps.mobileFieldBorder"
          :truncate-label="true"
          force-open-above
          option-layout="rich"
          label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
          @update:model-value="(value) => patch({ tierId: value })"
        />

        <div
          v-if="showAmountField"
          class="flex h-[52px] items-center justify-between px-3"
        >
          <span class="shrink-0 text-base font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
            {{ aggregateLabel }}
          </span>
          <div class="ml-auto flex shrink-0 items-center gap-1">
            <div class="shrink-0" :style="amountBoxStyle">
              <DashboardTextInput
                :model-value="rule.targetValue"
                type="number"
                :show-label="false"
                :show-controls="false"
                :placeholder="t('dashboard.xRepost.placeholders.amount')"
                :wrapper-class="amountInputWrapperClass"
                :input-class="`${amountInputClass} ${hasTargetValue ? 'text-right' : 'text-left'}`"
                @update:model-value="(value) => patch({ targetValue: value })"
              />
            </div>
            <span class="whitespace-nowrap text-sm font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
              {{ valueSuffixLabel }}
            </span>
          </div>
        </div>

        <div
          v-if="showFrequencyField"
          class="flex h-[52px] items-stretch"
        >
          <XRepostDropdown
            :model-value="rule.frequency"
            :options="frequencyOptions"
            :placeholder="t('dashboard.xRepost.frequency.placeholder')"
            :chevron-icon="assets.chevron"
            :help-icon="assets.help"
            :show-help="Boolean(rule.frequency)"
            :width-class="showRangeFields ? 'w-1/2 min-w-0' : 'w-full'"
            :show-border-right="showRangeFields"
            :show-border-top="stackedDropdownProps.showBorderTop"
            :show-border-bottom="stackedDropdownProps.showBorderBottom"
            :mobile-field-border="stackedDropdownProps.mobileFieldBorder"
            :truncate-label="true"
            force-open-above
            :selected-option-class="rowTheme.selected"
            label-class="truncate text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
            @update:model-value="(value) => patch({ frequency: value })"
          />
          <div
            v-if="showRangeFields"
            class="flex w-1/2 min-w-0 items-center justify-end border-l border-[#D0D5DD] px-3"
          >
            <div class="flex shrink-0 items-center gap-[10px]">
              <div class="w-7 shrink-0">
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
              </div>
              <span class="shrink-0 whitespace-nowrap text-sm font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('dashboard.xRepost.units.days') }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="showDescriptionField"
          class="flex min-h-[52px] items-center px-3"
        >
          <DashboardTextInput
            :model-value="rule.postMessage"
            :show-label="false"
            :show-controls="false"
            :placeholder="t('dashboard.xRepost.placeholders.postMessage')"
            :wrapper-class="inputWrapperClass"
            :input-class="inputFieldClass"
            @update:model-value="(value) => patch({ postMessage: value })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.x-repost-mobile-condition-stack :deep(.x-repost-mobile-trigger) {
  border-top: none !important;
  border-bottom: none !important;
}
</style>
