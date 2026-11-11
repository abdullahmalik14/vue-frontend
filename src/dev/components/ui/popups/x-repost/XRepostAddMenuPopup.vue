<script setup>
import { computed, watch, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import { createStepStateEngine, attachEngineLogging } from '@/utils/stateEngine.js';
import { createDashboardSidebarSlideInConfig } from '@/systems/dashboard/createDashboardSidebarSlideInConfig.js';
import XRepostMobileAddForm from './XRepostMobileAddForm.vue';
import XRepostLeaveConfirmPopup from './XRepostLeaveConfirmPopup.vue';
import {
  TYPE_OPTIONS,
  TYPE_THEME,
  METRICS_BY_TYPE,
  METRIC_ICON_KEY,
  defaultMetricForType,
  defaultConditionForTypeMetric,
} from '@/dev/components/x-repost/xRepostConfig.js';
import { applyFlowDefaults, useXRepostRuleDraft } from '@/dev/components/x-repost/useXRepostRuleDraft.js';

const MOBILE_MAX_WIDTH = 767;

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assets: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'add', 'preview-draft']);

const { t } = useI18n();
const selectedType = ref('profile');
const hoveredMetric = ref('profileLikes');
const hoveredMobileMetric = ref('');
const isMobileAdd = ref(typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH);
const DISCARD_CONFIRM_STEP = 4;
const anchorMaxHeight = ref(null);

const DRAFT_DEFAULTS = {
  type: '',
  metric: '',
  condition: '',
  frequency: '',
  customDays: '7',
  targetValue: '',
  postMessage: '',
  merchItemId: '',
  tierId: '',
};

const engine = createStepStateEngine({
  flowId: 'xRepostMobileAdd',
  initialStep: 1,
  urlSync: 'none',
  defaults: { ...DRAFT_DEFAULTS },
});

if (import.meta.env.DEV) {
  attachEngineLogging(engine);
}

engine.initialize({ fromUrl: false });

const assetsRef = computed(() => props.assets);
const draftRule = computed(() => ({
  type: engine.state.type,
  metric: engine.state.metric,
  condition: engine.state.condition,
  frequency: engine.state.frequency,
  customDays: engine.state.customDays,
  targetValue: engine.state.targetValue,
  postMessage: engine.state.postMessage,
  merchItemId: engine.state.merchItemId,
  tierId: engine.state.tierId,
}));

function patchDraft(partial) {
  Object.entries(partial).forEach(([path, value]) => {
    engine.setState(path, value, { reason: 'mobile-add-form' });
  });
}

const mobileDraft = useXRepostRuleDraft(draftRule, patchDraft, { t, assets: assetsRef });
const canPreviewMobile = mobileDraft.canPreview;

const desktopPopupConfig = computed(() => ({
  actionType: 'popup',
  isAbsolute: true,
  customEffect: 'instant',
  closeEffect: 'instant',
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  shouldCloseOnEscape: true,
  shouldLockBodyScroll: false,
  scrollable: false,
  innerScroll: true,
  maxHeight: anchorMaxHeight.value ? `${anchorMaxHeight.value}px` : '80vh',
  height: 'auto',
  width: { default: '497px' },
  containerClass: 'bottom-full right-0 z-50 mb-2',
}));

const mobilePopupConfig = createDashboardSidebarSlideInConfig({
  from: 'right',
  offset: '0px',
  width: { default: '100%' },
  height: '100%',
  shouldShowOverlay: true,
  shouldLockBodyScroll: true,
  shouldCloseOnOutsideClick: false,
  shouldCloseOnEscape: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0 [&>div]:w-full',
});

const popupConfig = computed(() =>
  isMobileAdd.value ? mobilePopupConfig : desktopPopupConfig.value,
);

function syncMobileBreakpoint() {
  isMobileAdd.value = typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH;
}

function syncAnchorMaxHeight() {
  const anchor = document.querySelector('[data-x-repost-add-anchor]');
  if (!anchor) {
    anchorMaxHeight.value = null;
    return;
  }

  const { top } = anchor.getBoundingClientRect();
  anchorMaxHeight.value = Math.max(280, Math.floor(top - 12));
}

const theme = computed(() => TYPE_THEME[selectedType.value] || TYPE_THEME.profile);

const activeMetrics = computed(() => METRICS_BY_TYPE[selectedType.value] || []);

const mobileMetrics = computed(() => METRICS_BY_TYPE[engine.state.type] || []);

const mobileTheme = computed(() => TYPE_THEME[engine.state.type] || TYPE_THEME.profile);

watch(selectedType, (typeId) => {
  hoveredMetric.value = (METRICS_BY_TYPE[typeId] || [])[0] || '';
});

function resetMobileEngine() {
  hoveredMobileMetric.value = '';
  Object.entries(DRAFT_DEFAULTS).forEach(([path, value]) => {
    engine.setState(path, value, { silent: true, reason: 'mobile-add-reset' });
  });
  engine.forceStep(1, { intent: 'reset' });
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      anchorMaxHeight.value = null;
      resetMobileEngine();
      return;
    }
    selectedType.value = 'profile';
    hoveredMetric.value = 'profileLikes';
    syncMobileBreakpoint();
    resetMobileEngine();
    nextTick(() => syncAnchorMaxHeight());
  },
);

function metricIcon(metricId) {
  const key = METRIC_ICON_KEY[metricId] || metricId;
  return props.assets[key] || '';
}

function tintedIconStyle(src, color) {
  return {
    backgroundColor: color || theme.value.icon,
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

function metricLabel(metricId) {
  return t(`dashboard.xRepost.metrics.${metricId}`);
}

function metricHelp(metricId, typeId = selectedType.value) {
  return t(`dashboard.xRepost.metricHelp.${typeId}.${metricId}`);
}

function addRule(metricId) {
  emit('add', { type: selectedType.value, metric: metricId });
  emit('update:modelValue', false);
}

function closePopup() {
  emit('update:modelValue', false);
}

function onMobileDiscardClick() {
  if (isMobileAdd.value) {
    engine.goToStep(DISCARD_CONFIRM_STEP, { intent: 'discard-prompt' });
    return;
  }
  closePopup();
}

function onDiscardConfirmBack() {
  engine.goToStep(3, { intent: 'back' });
}

function confirmDiscardMobileAdd() {
  closePopup();
}

function selectMobileType(typeId) {
  hoveredMobileMetric.value = '';
  engine.setState('type', typeId, { reason: 'select-type' });
  engine.setState('metric', '', { reason: 'select-type' });
  engine.goToStep(2, { intent: 'select-type' });
}

function selectMobileMetric(metricId) {
  hoveredMobileMetric.value = metricId;
  engine.setState('metric', metricId, { reason: 'hover-metric' });
}

function addMobileMetric(metricId) {
  const typeId = engine.state.type;
  const condition = defaultConditionForTypeMetric(typeId, metricId);
  patchDraft({
    type: typeId,
    metric: metricId,
    ...applyFlowDefaults(typeId, metricId, condition),
  });
  engine.goToStep(3, { intent: 'select-metric' });
}

function goMobileBack() {
  if (engine.step === 3) {
    hoveredMobileMetric.value = engine.state.metric || '';
    engine.goToStep(2, { intent: 'back' });
    return;
  }
  if (engine.step === 2) {
    hoveredMobileMetric.value = '';
    engine.goToStep(1, { intent: 'back' });
  }
}

function previewMobileDraft() {
  if (!canPreviewMobile.value) return;
  emit('preview-draft', {
    type: engine.state.type,
    metric: engine.state.metric || defaultMetricForType(engine.state.type),
    condition: engine.state.condition,
    frequency: engine.state.frequency,
    customDays: engine.state.customDays,
    targetValue: engine.state.targetValue,
    postMessage: engine.state.postMessage,
    merchItemId: engine.state.merchItemId,
    tierId: engine.state.tierId,
  });
  emit('update:modelValue', false);
}

onMounted(() => {
  syncMobileBreakpoint();
  window.addEventListener('resize', syncMobileBreakpoint);
});

onUnmounted(() => {
  window.removeEventListener('resize', syncMobileBreakpoint);
});
</script>

<template>
  <BasePopup
    :key="isMobileAdd ? 'x-repost-add-mobile' : 'x-repost-add-desktop'"
    :model-value="modelValue"
    :popup-config="popupConfig"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div
      v-if="!isMobileAdd"
      class="flex max-h-[min(674px,80vh)] w-[497px] max-w-[calc(100vw-2rem)] min-h-0 flex-col items-start gap-4 overflow-hidden rounded-lg bg-white/90 p-4 shadow-[0px_0px_8px_0px_rgba(0,0,0,0.25)] backdrop-blur-[50px] dark:bg-[#1b1d1e]/90"
    >
      <p class="w-full shrink-0 text-base font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
        {{ t('dashboard.xRepost.popupTitle') }}
      </p>

      <div class="flex min-h-0 w-full flex-1 items-stretch gap-2">
        <div
          class="flex min-h-0 w-[189px] shrink-0 flex-col items-start gap-4 self-stretch overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            v-for="typeItem in TYPE_OPTIONS"
            :key="typeItem.id"
            type="button"
            class="flex h-[45px] min-h-[45px] w-full cursor-pointer items-center rounded-[5px] outline-none px-4"
            :class="selectedType === typeItem.id
              ? (TYPE_THEME[typeItem.id].selected)
              : 'opacity-50'"
            @click="selectedType = typeItem.id"
          >
            <div class="flex w-full items-center gap-1">
              <span class="flex min-w-0 flex-1 items-center gap-1">
                <img
                  v-if="assets[typeItem.id]"
                  :src="assets[typeItem.id]"
                  alt=""
                  width="16"
                  height="16"
                  class="size-4 shrink-0"
                />
                <span class="min-w-0 text-left text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t(`dashboard.xRepost.types.${typeItem.id}`) }}
                </span>
              </span>
              <img
                v-if="selectedType === typeItem.id && assets.arrow"
                :src="assets.arrow"
                alt=""
                width="12"
                height="12"
                class="size-3 shrink-0"
              />
            </div>
          </button>
        </div>

        <div
          class="flex min-h-0 min-w-0 flex-1 self-stretch flex-col overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div class="flex flex-col items-start gap-2">
            <div
              v-for="metricId in activeMetrics"
              :key="metricId"
              class="flex min-h-[45px] w-full flex-col items-start justify-center gap-1 rounded-[5px] p-4"
              :class="hoveredMetric === metricId ? theme.selected : ''"
              @mouseenter="hoveredMetric = metricId"
            >
              <div class="flex w-full items-center gap-1">
                <span class="flex min-w-0 flex-1 items-center gap-1">
                  <span
                    v-if="metricIcon(metricId)"
                    class="size-4 shrink-0"
                    :style="tintedIconStyle(metricIcon(metricId))"
                  />
                  <span class="min-w-0 text-base font-medium leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
                    {{ metricLabel(metricId) }}
                  </span>
                </span>
                <button
                  v-if="hoveredMetric === metricId"
                  type="button"
                  class="flex shrink-0 items-center justify-center rounded-[5px] px-2 py-0.5"
                  :class="theme.add"
                  @click="addRule(metricId)"
                >
                  <span class="whitespace-nowrap text-xs font-bold leading-[18px] text-white">
                    {{ t('dashboard.xRepost.add') }}
                  </span>
                </button>
              </div>
              <p class="w-full text-xs font-normal leading-[18px] text-[#667085]">
                {{ metricHelp(metricId) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex h-full max-h-full w-full min-h-0 flex-col bg-white dark:bg-[#1b1d1e]"
    >
      <div class="flex shrink-0 items-center justify-between px-4 py-4">
        <div class="flex min-w-0 items-center gap-2">
          <button
            v-if="engine.step === 2"
            type="button"
            class="flex shrink-0 items-center justify-center"
            @click="goMobileBack"
          >
            <img
              v-if="assets.mobileBack"
              :src="assets.mobileBack"
              alt=""
              width="12"
              height="12"
              class="size-3 shrink-0"
            />
          </button>
          <div class="flex items-center gap-1" v-if="engine.step === 2">
            <img
              v-if="assets[engine.state.type]"
              :src="assets[engine.state.type]"
              alt=""
              width="16"
              height="16"
              class="size-4 shrink-0"
            />
            <p class="truncate text-base font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
              {{ t(`dashboard.xRepost.types.${engine.state.type}`) }}
            </p>
          </div>
          <p
            v-else
            class="text-base font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]"
          >
            {{
              engine.step === 3
                ? t('dashboard.xRepost.newAutomation')
                : t('dashboard.xRepost.popupTitle')
            }}
          </p>
        </div>

        <button
          v-if="engine.step === 1"
          type="button"
          class="flex size-8 items-center justify-center"
          @click="closePopup"
        >
          <img
            v-if="assets.close"
            :src="assets.close"
            alt=""
            width="16"
            height="16"
            class="size-4"
          />
        </button>

        <button
          v-else-if="engine.step === 3"
          type="button"
          class="group flex h-[26px] min-w-[81px] items-center justify-center gap-1 rounded-none bg-[#FF4405] px-2 text-white hover:bg-white hover:text-[#FF4405]"
          @click="onMobileDiscardClick"
        >
          <span
            v-if="assets.discard"
            class="size-3 shrink-0 bg-white group-hover:bg-[#FF4405]"
            :style="{
              WebkitMaskImage: `url(${assets.discard})`,
              maskImage: `url(${assets.discard})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }"
          />
          <span class="text-sm font-medium leading-none">{{ t('dashboard.xRepost.postPreview.discardEdit') }}</span>
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div v-if="engine.step === 1" class="flex flex-col">
          <button
            v-for="typeItem in TYPE_OPTIONS"
            :key="typeItem.id"
            type="button"
            class="flex min-h-[52px] w-full items-center gap-2 px-4 py-3 text-left"
            :class="engine.state.type === typeItem.id ? TYPE_THEME[typeItem.id].selected : ''"
            @click="selectMobileType(typeItem.id)"
          >
            <img
              v-if="assets[typeItem.id]"
              :src="assets[typeItem.id]"
              alt=""
              width="16"
              height="16"
              class="size-4 shrink-0"
            />
            <span class="text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]">
              {{ t(`dashboard.xRepost.types.${typeItem.id}`) }}
            </span>
          </button>
        </div>

        <div v-else-if="engine.step === 2" class="flex flex-col gap-2 pl-6 pr-4 pb-4">
          <div
            v-for="metricId in mobileMetrics"
            :key="metricId"
            class="flex w-full flex-col items-start justify-center gap-1 rounded-[5px] px-4 py-4"
            :class="hoveredMobileMetric === metricId ? mobileTheme.selected : ''"
            @mouseenter="selectMobileMetric(metricId)"
            @click="selectMobileMetric(metricId)"
          >
            <div class="flex w-full items-center gap-1">
              <span class="flex min-w-0 flex-1 items-center gap-1">
                <span
                  v-if="metricIcon(metricId)"
                  class="size-4 shrink-0"
                  :style="tintedIconStyle(metricIcon(metricId), mobileTheme.icon)"
                />
                <span class="min-w-0 text-base font-medium leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ metricLabel(metricId) }}
                </span>
              </span>
              <button
                v-if="hoveredMobileMetric === metricId"
                type="button"
                class="flex shrink-0 items-center justify-center rounded-[5px] px-2 py-0.5"
                :class="mobileTheme.add"
                @click.stop="addMobileMetric(metricId)"
              >
                <span class="whitespace-nowrap text-xs font-bold leading-[18px] text-white">
                  {{ t('dashboard.xRepost.add') }}
                </span>
              </button>
            </div>
            <p class="w-full text-xs font-normal leading-[18px] text-[#667085]">
              {{ metricHelp(metricId, engine.state.type) }}
            </p>
          </div>
        </div>

        <XRepostMobileAddForm
          v-else-if="engine.step === 3"
          :rule="draftRule"
          :assets="assets"
          @patch="patchDraft"
        />
      </div>

      <div
        v-if="engine.step === 3 && canPreviewMobile"
        class="shrink-0 bg-[#0C111D]"
      >
        <button
          type="button"
          class="flex h-12 w-full items-center justify-center gap-1.5 text-[#07F468]"
          @click="previewMobileDraft"
        >
          <span
            v-if="assets.previewEye"
            class="size-4 shrink-0 bg-[#07F468]"
            :style="{
              WebkitMaskImage: `url(${assets.previewEye})`,
              maskImage: `url(${assets.previewEye})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }"
          />
          <span class="text-sm font-medium">
            {{ t('dashboard.xRepost.previewAndSave') }}
          </span>
        </button>
      </div>
    </div>
  </BasePopup>

  <XRepostLeaveConfirmPopup
    :model-value="isMobileAdd && engine.step === DISCARD_CONFIRM_STEP"
    @back="onDiscardConfirmBack"
    @discard="confirmDiscardMobileAdd"
  />
</template>
