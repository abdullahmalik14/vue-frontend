<script setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';
import {
  TYPE_THEME,
  METRIC_ICON_KEY,
  getConditionCopy,
  getRowFlow,
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
});

const emit = defineEmits(['request-delete', 'preview-save']);

const { t } = useI18n();
const menuAnchor = ref(null);
const menuDropdownRef = ref(null);

const rowTheme = computed(() => TYPE_THEME[props.rule.type] || TYPE_THEME.profile);
const cardStyle = computed(() => ({
  borderLeft: `2px solid ${rowTheme.value.icon}`,
}));
const typeLabel = computed(() => t(`dashboard.xRepost.types.${props.rule.type}`));
const metricLabel = computed(() => t(`dashboard.xRepost.metrics.${props.rule.metric}`));
const typeIcon = computed(() => props.assets[props.rule.type] || '');
const metricIcon = computed(() => {
  const key = METRIC_ICON_KEY[props.rule.metric] || props.rule.metric;
  return props.assets[key] || '';
});

const rowFlow = computed(() => {
  if (!props.rule.condition) return null;
  return getRowFlow(props.rule.type, props.rule.metric, props.rule.condition);
});

const isSalesAggregateKind = computed(() => {
  const kind = rowFlow.value?.kind;
  return ['salesRangeTotal', 'salesRangeEvery', 'salesSimpleTotal', 'tokensEvery'].includes(kind);
});

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

const summaryText = computed(() => {
  const parts = [];
  const copy = getConditionCopy(props.rule.type, props.rule.metric, props.rule.condition);
  if (copy?.label) parts.push(copy.label);

  if (isSalesAggregateKind.value && String(props.rule.targetValue ?? '').trim()) {
    parts.push(`${aggregateLabel.value} ${props.rule.targetValue} ${valueSuffixLabel.value}`);
  }

  if (props.rule.frequency === 'customRange' && String(props.rule.customDays ?? '').trim()) {
    parts.push(
      `${t('dashboard.xRepost.labels.every')} ${props.rule.customDays} ${t('dashboard.xRepost.units.days')}`,
    );
  } else if (props.rule.frequency) {
    parts.push(t(`dashboard.xRepost.frequency.${props.rule.frequency}`));
  }

  if (!parts.length && props.rule.postMessage) {
    parts.push(props.rule.postMessage);
  }

  return parts.join(' / ');
});

const menuItems = computed(() => [
  {
    id: 'preview',
    label: t('dashboard.xRepost.previewPost'),
    icon: props.assets.previewEye,
    tone: 'default',
  },
  {
    id: 'edit',
    label: t('dashboard.xRepost.editDraft'),
    icon: props.assets.editDraft,
    tone: 'default',
  },
  {
    id: 'delete',
    label: t('dashboard.xRepost.delete'),
    icon: props.assets.trash,
    tone: 'danger',
  },
]);

const menuDropdownConfig = {
  trigger: 'click',
  align: 'right',
  positionMode: 'below',
  offset: 8,
  width: 168,
  zIndexBase: 10100,
  closeOnOutsideClick: true,
  style: {
    class: 'overflow-hidden rounded-lg bg-white shadow-[0px_4px_16px_0px_rgba(16,24,40,0.12)]',
  },
};

function tintedIconStyle(src, color) {
  if (!src) return null;
  return {
    backgroundColor: color,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
}

function closeMenu() {
  nextTick(() => {
    menuDropdownRef.value?.close();
  });
}

function onMenuAction(id) {
  if (id === 'delete') {
    emit('request-delete', props.rule.id);
    closeMenu();
    return;
  }
  emit('preview-save', props.rule);
  closeMenu();
}
</script>

<template>
  <div
    class="flex w-full flex-col gap-2 bg-white px-4 py-4"
    :style="cardStyle"
  >
    <div class="flex items-start gap-2">
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        <span
          v-if="typeIcon"
          class="size-4 shrink-0"
          :style="tintedIconStyle(typeIcon, rowTheme.icon)"
        />
        <span class="text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]">
          {{ typeLabel }}
        </span>
        <span class="text-xs font-[400] leading-5 text-[#667085]">/</span>
        <span
          v-if="metricIcon"
          class="size-4 shrink-0"
          :style="tintedIconStyle(metricIcon, rowTheme.icon)"
        />
        <span class="text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]">
          {{ metricLabel }}
        </span>
      </div>

      <div
        ref="menuAnchor"
        tabindex="0"
        class="mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center"
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
      >
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-[#F9FAFB]"
          @click.stop="onMenuAction(item.id)"
        >
          <span
            v-if="item.icon"
            class="size-4 shrink-0"
            :style="tintedIconStyle(item.icon, item.tone === 'danger' ? '#FF4405' : '#344054')"
          />
          <span
            class="whitespace-nowrap text-xs font-medium"
            :class="item.tone === 'danger' ? 'text-[#FF4405]' : 'text-[#344054]'"
          >
            {{ item.label }}
          </span>
        </button>
      </DropdownMenu>
    </div>

    <p
      v-if="summaryText"
      class="text-xs font-normal leading-[18px] text-[#0C111D] dark:text-[#bdb7af]"
    >
      {{ summaryText }}
    </p>
  </div>
</template>
