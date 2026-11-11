<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/forms/inputs/BaseInput.vue';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  postMessage: { type: String, default: '' },
  socialThumbnailMode: { type: String, default: 'none' },
  attachMediaOptions: { type: Array, required: true },
  radioName: { type: String, default: 'social-post-mode' },
  postMessageLabel: { type: String, default: '' },
  postMessagePlaceholder: { type: String, default: '' },
  attachMediaLabel: { type: String, default: '' },
  postPreviewLabel: { type: String, default: '' },
  charactersCountLabel: { type: String, default: '' },
  maxChars: { type: Number, default: 72 },
  /** When set, overrides live character count from postMessage */
  charactersUsed: { type: Number, default: null },
  previewBody: { type: String, default: '' },
  previewLink: { type: String, default: '' },
  previewLinkHref: { type: String, default: '' },
  /** PlanSharing always shows thumbs; LuckyDraw only when mode is useCustom */
  showMediaAlways: { type: Boolean, default: false },
  wrapperClass: { type: String, default: '' },
  previewCardClass: {
    type: String,
    default:
      'flex gap-2 px-2 py-4 rounded-[0.3125rem] bg-white/70 w-full dark:bg-[#181a1bb3] sm:max-w-[17.625rem] sm:self-end',
  },
});

const emit = defineEmits(['update:postMessage', 'update:socialThumbnailMode']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const postMessageModel = computed({
  get: () => props.postMessage,
  set: (val) => emit('update:postMessage', val),
});

const socialThumbnailModeModel = computed({
  get: () => props.socialThumbnailMode,
  set: (val) => emit('update:socialThumbnailMode', val),
});

const resolvedPostMessageLabel = computed(
  () => props.postMessageLabel || t('mediaUploader.publish.postMessageLabel'),
);
const resolvedPlaceholder = computed(
  () => props.postMessagePlaceholder || t('mediaUploader.publish.postMessagePlaceholder'),
);
const resolvedAttachMediaLabel = computed(
  () => props.attachMediaLabel || t('mediaUploader.publish.attachMedia'),
);
const resolvedPostPreviewLabel = computed(
  () => props.postPreviewLabel || t('plan.sharing.postPreview'),
);

const usedChars = computed(() =>
  props.charactersUsed != null
    ? props.charactersUsed
    : String(props.postMessage ?? '').length,
);

const charactersCountText = computed(() => {
  if (props.charactersCountLabel) return props.charactersCountLabel;
  return t('mediaUploader.publish.charactersCount', {
    used: usedChars.value,
    max: props.maxChars,
  });
});

const showMediaThumbs = computed(
  () => props.showMediaAlways || props.socialThumbnailMode === 'useCustom',
);

const resolvedPreviewLinkHref = computed(() => {
  if (props.previewLinkHref) return props.previewLinkHref;
  if (props.previewLink) return `https://${props.previewLink}`;
  return '';
});

const inputClass =
  'w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent outline-none min-w-0 text-[#0C111D] placeholder:text-[#667085] dark:text-[#dbd8d3] dark:placeholder:text-[#9e9689]';
</script>

<template>
  <div
    class="flex flex-col gap-4 sm:justify-between sm:gap-6 min-[615px]:flex-row"
    :class="wrapperClass"
  >
    <div class="flex flex-col gap-4 md:grow min-w-0">
      <section class="flex flex-col gap-1.5">
        <h3 class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
          {{ resolvedPostMessageLabel }}
        </h3>
        <BaseInput
          type="text"
          v-model="postMessageModel"
          :placeholder="resolvedPlaceholder"
          :inputClass="inputClass"
        />
        <span class="text-sm text-[#475467] dark:text-[#b1aba0]">
          {{ charactersCountText }}
        </span>
      </section>

      <section class="flex flex-col gap-2">
        <RadioGroup
          v-model="socialThumbnailModeModel"
          :name="radioName"
          :label="resolvedAttachMediaLabel"
          labelClass="font-[600]"
          :options="attachMediaOptions"
          theme="plan"
        />
      </section>
    </div>

    <div class="flex flex-col gap-2 shrink-0 sm:min-w-[17.625rem]">
      <h3 class="text-xs leading-normal text-right text-[#667085] dark:text-[#9e9689]">
        {{ resolvedPostPreviewLabel }}
      </h3>
      <div :class="previewCardClass">
        <div class="w-6 h-6 rounded-md overflow-hidden min-w-[1.5rem]">
          <img :src="assets.featuredMediaBg" alt="" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-2 min-w-0">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex items-center gap-1">
                <h4
                  class="text-xs leading-normal font-semibold text-[#0C111D] truncate dark:text-[#dbd8d3]"
                >
                  {{ t('plan.sharing.mock.displayName') }}
                </h4>
                <img
                  v-if="assets.verifiedTick"
                  :src="assets.verifiedTick"
                  :alt="t('plan.sharing.alt.verified')"
                  class="w-3 h-3"
                />
              </div>
              <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">
                {{ t('plan.sharing.mock.handle') }}
              </span>
              <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9689]">
                {{ t('plan.sharing.mock.date') }}
              </span>
            </div>
            <p class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">
              {{ previewBody || t('plan.sharing.mock.body') }}
              <a
                v-if="previewLink"
                :href="resolvedPreviewLinkHref"
                class="underline"
              >
                {{ previewLink }}
              </a>
            </p>
            <a
              v-if="!previewLink"
              :href="t('plan.sharing.mock.mediaLink')"
              class="max-w-full text-xs leading-normal font-medium line-clamp-1 break-all underline text-[#0C111D] dark:text-[#dbd8d3]"
            >
              {{ t('plan.sharing.mock.mediaLink') }}
            </a>
          </div>

          <div
            v-if="showMediaThumbs"
            class="flex gap-0.5 rounded-[0.625rem] overflow-hidden"
          >
            <div class="flex justify-center items-center w-full aspect-[1.63636373/1] relative">
              <img :src="assets.checkoutHeader" alt="" class="w-full h-full object-cover" />
              <div
                class="absolute flex justify-center items-center p-1.5 w-[1.875rem] aspect-square rounded-full bg-black/60 cursor-pointer dark:bg-[#181a1b]/60"
              >
                <img
                  v-if="assets.playIcon"
                  :src="assets.playIcon"
                  :alt="t('plan.sharing.alt.play')"
                  class="w-full h-full"
                />
              </div>
            </div>
            <div class="flex justify-center items-center w-full aspect-[1.63636373/1] relative">
              <img :src="assets.checkoutHeader" alt="" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
