<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import XRepostPreviewMediaSection from '@/dev/components/ui/popups/x-repost/XRepostPreviewMediaSection.vue';
import { createDashboardSidebarSlideInConfig } from '@/systems/dashboard/createDashboardSidebarSlideInConfig.js';
import { getRowFlow } from '@/dev/components/x-repost/xRepostConfig.js';

const POST_CHAR_MAX = 280;
const TOKEN_PATTERN = /(\((?:Custom Goal|Percentage|Current number)\))/g;

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  assets: {
    type: Object,
    required: true,
  },
  rule: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'save-draft', 'save-post', 'update-post-message']);

const { t } = useI18n();
const previewStage = ref('whenGoal');
const isBodyHovered = ref(false);
const isEditingBody = ref(false);
const postTemplate = ref('');
const draftTemplate = ref('');
const bodyTextareaRef = ref(null);

const popupConfig = createDashboardSidebarSlideInConfig({
  from: 'right',
  offset: '0px',
  width: { default: '638px', '<1009': '90%', '<768': '100%' },
  height: '100%',
  scrollable: true,
  shouldShowOverlay: false,
  shouldLockBodyScroll: true,
  shouldCloseOnOutsideClick: false,
  shouldCloseOnEscape: true,
  forceZIndex: 10200,
  containerClass: 'flex flex-col h-full',
});

const stageOptions = computed(() => [
  {
    value: 'beforeGoal',
    label: t('dashboard.xRepost.postPreview.stages.beforeGoal'),
    description: t('dashboard.xRepost.postPreview.stages.beforeGoalHelp'),
  },
  {
    value: 'whenGoal',
    label: t('dashboard.xRepost.postPreview.stages.whenGoal'),
    description: t('dashboard.xRepost.postPreview.stages.whenGoalHelp'),
  },
]);

const mediaImages = [
  '/images/x-repost-preview-media-2.png',
  '/images/x-repost-preview-media-1.png',
  '/images/x-repost-preview-media-3.png',
  '/images/x-repost-preview-media-2.png',
];

const engagementStats = computed(() => [
  {
    icon: props.assets.previewComment,
    value: t('dashboard.xRepost.postPreview.stats.count'),
  },
  {
    icon: props.assets.previewRepost,
    value: t('dashboard.xRepost.postPreview.stats.count'),
  },
  {
    icon: props.assets.previewLike,
    value: t('dashboard.xRepost.postPreview.stats.count'),
  },
  {
    icon: props.assets.previewAnalytics,
    value: t('dashboard.xRepost.postPreview.stats.count'),
  },
]);

const rowFlow = computed(() => {
  if (!props.rule?.type || !props.rule?.metric || !props.rule?.condition) return null;
  return getRowFlow(props.rule.type, props.rule.metric, props.rule.condition);
});

const salesGoal = computed(() => {
  const raw = String(props.rule?.targetValue ?? '').trim();
  return raw || '0';
});

const progressCurrent = computed(() => {
  const goal = Number(salesGoal.value) || 0;
  const current = Number(props.rule?.progressCurrent ?? 0) || 0;
  if (goal <= 0) return 0;
  return Math.min(Math.max(current, 0), goal);
});

const progressPercent = computed(() => {
  const goal = Number(salesGoal.value) || 0;
  if (goal <= 0) return 0;
  return Math.round((progressCurrent.value / goal) * 100);
});

const valueSuffixLabel = computed(() => {
  const flow = rowFlow.value;
  if (!flow) return t('dashboard.xRepost.labels.itemsSold');
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

const defaultBodyTemplate = computed(() => t('dashboard.xRepost.postPreview.bodyTemplate'));

function resolveBodyTemplate(source = '') {
  const raw = String(source || '').trim();
  return raw || defaultBodyTemplate.value;
}

function interpolateTemplate(template) {
  return String(template || '')
    .replaceAll('(Custom Goal)', String(salesGoal.value))
    .replaceAll('(Percentage)', `${progressPercent.value}%`)
    .replaceAll('(Current number)', String(progressCurrent.value));
}

const previewBody = computed(() => interpolateTemplate(postTemplate.value));

const draftCharCount = computed(() => String(draftTemplate.value || '').length);

const charactersLabel = computed(() =>
  t('dashboard.xRepost.postPreview.charactersCount', {
    used: draftCharCount.value,
    max: POST_CHAR_MAX,
  }),
);

const showBodyChrome = computed(() => isBodyHovered.value || isEditingBody.value);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const highlightedDraftHtml = computed(() => {
  const escaped = escapeHtml(draftTemplate.value);
  return escaped.replace(TOKEN_PATTERN, '<span class="text-[#2E90FA] break-all">$1</span>');
});

const targetDisplay = computed(() =>
  t('dashboard.xRepost.postPreview.legend.targetValue', {
    current: progressCurrent.value,
    goal: salesGoal.value,
    suffix: valueSuffixLabel.value,
  }),
);

function resetBodyEditorState() {
  isBodyHovered.value = false;
  isEditingBody.value = false;
  draftTemplate.value = postTemplate.value;
}

function syncFromRule() {
  previewStage.value = 'whenGoal';
  postTemplate.value = resolveBodyTemplate(props.rule?.postMessage);
  resetBodyEditorState();
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) syncFromRule();
    else resetBodyEditorState();
  },
);

watch(
  () => props.rule?.id,
  () => {
    if (props.modelValue) syncFromRule();
  },
);

function close() {
  emit('update:modelValue', false);
}

function ruleWithPostMessage() {
  if (!props.rule) return null;
  return { ...props.rule, postMessage: postTemplate.value };
}

function onSaveDraft() {
  emit('save-draft', ruleWithPostMessage());
  close();
}

function onSavePost() {
  emit('save-post', ruleWithPostMessage());
  close();
}

async function startBodyEdit() {
  draftTemplate.value = postTemplate.value;
  isEditingBody.value = true;
  isBodyHovered.value = false;
  await nextTick();
  bodyTextareaRef.value?.focus();
}

function discardBodyEdit() {
  draftTemplate.value = postTemplate.value;
  isEditingBody.value = false;
}

function saveBodyEdit() {
  const next = String(draftTemplate.value || '').slice(0, POST_CHAR_MAX);
  postTemplate.value = next;
  draftTemplate.value = next;
  isEditingBody.value = false;
  if (props.rule?.id != null) {
    emit('update-post-message', { id: props.rule.id, postMessage: next });
  }
}

function onDraftInput(event) {
  const value = String(event?.target?.value ?? '').slice(0, POST_CHAR_MAX);
  draftTemplate.value = value;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[10199] bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
      @click="close"
    />
  </Teleport>

  <BasePopup
    :model-value="modelValue"
    :popup-config="popupConfig"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div class="relative flex min-h-full w-full flex-col bg-[#F9FAFBE5] font-sans dark:bg-[#1b1d1e]/90">
      <div class="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
        <h2 class="text-base font-semibold leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
          {{ t('dashboard.xRepost.postPreview.title') }}
        </h2>
        <button
          type="button"
          class="flex size-6 cursor-pointer items-center justify-center"
          @click="close"
        >
          <span
            v-if="assets.previewClose || assets.close"
            class="size-2.5 shrink-0 bg-[#98A2B3]"
            :style="{
              WebkitMaskImage: `url(${assets.previewClose || assets.close})`,
              maskImage: `url(${assets.previewClose || assets.close})`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="flex flex-1 flex-col gap-4 pb-4">
        <BasePlanDropdown
          v-model="previewStage"
          unstyled
          width-class="w-full"
          :options="stageOptions"
        >
          <template #trigger="{ isOpen, selectedLabel }">
            <div
              class="mx-4 flex h-[52px] cursor-pointer items-center justify-between gap-2 bg-white px-3 md:mx-5"
            >
              <span class="min-w-0 flex-1 truncate text-sm font-[500] leading-5 text-[#0C111D]">
                {{ selectedLabel }}
              </span>
              <span
                v-if="assets.chevron"
                class="w-[6px] h-[6px] shrink-0 bg-[#0C111D] transition-transform"
                :class="isOpen ? 'rotate-180' : ''"
                :style="{
                  WebkitMaskImage: `url(${assets.chevron})`,
                  maskImage: `url(${assets.chevron})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }"
                aria-hidden="true"
              />
            </div>
          </template>

          <template #options-container="{ options, selectOption, isOpen, modelValue }">
            <div
              v-show="isOpen"
              class="absolute left-4 right-4 top-full z-30 overflow-hidden bg-[#FFFFFF] shadow-[0_3px_6px_0_#00000033] md:left-5 md:right-5"
            >
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                class="flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors"
                :class="modelValue === option.value ? 'bg-[#EEEEEE]' : 'bg-[#F2F4F7] hover:bg-[#EEEEEE]'"
                @click.stop="selectOption(option)"
              >
                <span class="text-sm font-[500] leading-5 text-[#0C111D]">
                  {{ option.label }}
                </span>
                <span
                  v-if="option.description"
                  class="text-xs font-normal leading-4 text-[#667085]"
                >
                  {{ option.description }}
                </span>
              </button>
            </div>
          </template>
        </BasePlanDropdown>

        <div class="px-0 md:px-5">
          <article class="w-full overflow-hidden rounded-[5px] bg-white shadow-[0px_10px_10px_0px_rgba(0,0,0,0.2)]">
            <div class="flex items-start gap-2 p-4">
            <img
              :src="assets.previewAvatar || '/images/checkout-header.webp'"
              alt=""
              class="size-10 shrink-0 rounded-full object-cover"
            />

            <div class="flex min-w-0 flex-1 flex-col gap-3">
              <div class="flex min-w-0 items-center gap-1.5">
                <span class="truncate text-sm font-bold leading-5 text-[#0C111D]">
                  {{ t('dashboard.xRepost.postPreview.displayName') }}
                </span>
                <img
                  v-if="assets.verifiedTick"
                  :src="assets.verifiedTick"
                  alt=""
                  class="size-3.5 shrink-0 object-contain"
                />
                <span class="truncate text-sm font-normal leading-5 text-[#667085]">
                  {{ t('dashboard.xRepost.postPreview.handle') }}
                </span>
              </div>

              <div
                class="relative w-full min-w-0 max-w-full"
                @mouseenter="isBodyHovered = true"
                @mouseleave="isBodyHovered = false"
              >
                <div
                  v-if="!isEditingBody && isBodyHovered"
                  class="absolute bottom-full right-0 z-10"
                >
                  <DashboardPrimaryButton
                    type="button"
                    theme="xRepostPreviewEdit"
                    :text="t('dashboard.xRepost.postPreview.edit')"
                    :left-icon="assets.editDraft"
                    @click.stop="startBodyEdit"
                  />
                </div>

                <div
                  v-if="isEditingBody"
                  class="absolute bottom-full right-0 z-10 flex items-center"
                >
                  <span class="mr-2 whitespace-nowrap text-xs font-normal leading-4 text-[#667085]">
                    {{ charactersLabel }}
                  </span>
                  <div class="flex items-stretch gap-0">
                    <DashboardPrimaryButton
                      type="button"
                      theme="xRepostPreviewDiscard"
                      :text="t('dashboard.xRepost.postPreview.discardEdit')"
                      :left-icon="assets.close"
                      @click="discardBodyEdit"
                    />
                    <DashboardPrimaryButton
                      type="button"
                      theme="xRepostPreviewSave"
                      :text="t('dashboard.xRepost.postPreview.saveEdit')"
                      :left-icon="assets.savePost"
                      @click="saveBodyEdit"
                    />
                  </div>
                </div>

                <div
                  class="w-full min-w-0 max-w-full overflow-hidden rounded-[4px] transition-colors"
                  :class="showBodyChrome ? 'border border-[#2E90FA] bg-[#EFF8FF]' : 'border border-transparent'"
                >
                  <p
                    v-if="!isEditingBody"
                    class="max-w-full whitespace-pre-wrap break-all px-2 py-2 text-sm font-normal leading-5 text-[#0C111D]"
                  >
                    {{ previewBody }}
                  </p>

                  <div
                    v-else
                    class="relative grid min-h-[72px] w-full min-w-0 max-w-full overflow-hidden"
                  >
                    <div
                      class="invisible col-start-1 row-start-1 max-w-full whitespace-pre-wrap break-all px-2 py-2 text-sm font-normal leading-5"
                      aria-hidden="true"
                    >{{ draftTemplate || ' ' }}</div>
                    <div
                      class="pointer-events-none col-start-1 row-start-1 max-w-full overflow-hidden whitespace-pre-wrap break-all px-2 py-2 text-sm font-normal leading-5 text-[#0C111D]"
                      aria-hidden="true"
                      v-html="highlightedDraftHtml || '&nbsp;'"
                    />
                    <textarea
                      ref="bodyTextareaRef"
                      :value="draftTemplate"
                      maxlength="280"
                      wrap="soft"
                      class="col-start-1 row-start-1 h-full w-full min-w-0 max-w-full resize-none overflow-x-hidden whitespace-pre-wrap break-all bg-transparent px-2 py-2 text-sm font-normal leading-5 text-transparent caret-[#0C111D] outline-none"
                      @input="onDraftInput"
                    />
                  </div>
                </div>
              </div>

              <XRepostPreviewMediaSection
                :assets="assets"
                :default-images="mediaImages"
              />

              <div class="flex w-full items-center justify-between pt-1">
                <div
                  v-for="(stat, index) in engagementStats"
                  :key="index"
                  class="flex items-center gap-1.5"
                >
                  <span
                    v-if="stat.icon"
                    class="size-[18px] shrink-0 bg-[#667085]"
                    :style="{
                      WebkitMaskImage: `url(${stat.icon})`,
                      maskImage: `url(${stat.icon})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }"
                    aria-hidden="true"
                  />
                  <span class="text-xs font-normal leading-4 text-[#667085]">
                    {{ stat.value }}
                  </span>
                </div>
                <span
                  v-if="assets.previewShare"
                  class="size-[18px] shrink-0 bg-[#667085]"
                  :style="{
                    WebkitMaskImage: `url(${assets.previewShare})`,
                    maskImage: `url(${assets.previewShare})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
          </article>
        </div>

        <div class="flex flex-col gap-3 px-4 md:px-5 pb-2">
          <div class="flex items-start justify-between gap-6 text-sm leading-5">
            <span class="shrink-0 pt-0.5 text-[#667085]">
              {{ t('dashboard.xRepost.postPreview.legend.title') }}
            </span>
            <div class="flex flex-col items-end gap-3 text-right">
              <div class="flex flex-col items-end">
                <span class="font-medium text-[#2E90FA]">{'{salesGoal}'}</span>
                <span class="text-[#667085]">{{ t('dashboard.xRepost.postPreview.legend.salesGoal') }}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="font-medium text-[#2E90FA]">{'{percentage}'}</span>
                <span class="text-[#667085]">{{ t('dashboard.xRepost.postPreview.legend.percentage') }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-start justify-between gap-6 text-sm leading-5">
            <span class="shrink-0 text-[#667085]">
              {{ t('dashboard.xRepost.postPreview.legend.yourTarget') }}
            </span>
            <span class="text-right font-medium text-[#FF4405]">
              {{ targetDisplay }}
            </span>
          </div>

          <div class="flex items-start justify-between gap-6 text-sm leading-5">
            <span class="shrink-0 text-[#667085]">
              {{ t('dashboard.xRepost.postPreview.legend.nextPost') }}
            </span>
            <span class="text-right font-medium text-[#0C111D]">
              {{ t('dashboard.xRepost.postPreview.legend.nextPostValue') }}
            </span>
          </div>
        </div>
      </div>

      <div class="sticky bottom-0 z-20 mt-auto flex w-full shrink-0 items-center justify-between bg-[#F9FAFBE5] px-0 pb-0 dark:bg-[#1b1d1e]/90">
        <DashboardPrimaryButton
          type="button"
          theme="xRepostSaveDraft"
          :text="t('dashboard.xRepost.postPreview.saveDraft')"
          :left-icon="assets.uploadDraft"
          @click="onSaveDraft"
        />

        <DashboardPrimaryButton
          type="button"
          theme="xRepostSavePost"
          :text="t('dashboard.xRepost.postPreview.savePost')"
          :left-icon="assets.savePost"
          @click="onSavePost"
        />
      </div>
    </div>
  </BasePopup>
</template>
