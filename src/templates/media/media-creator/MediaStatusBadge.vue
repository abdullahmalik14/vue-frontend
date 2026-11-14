<template>
  <div data-component="media-status-badge" class="flex">
    <span
      class="flex justify-center items-center py-[3px] px-[6px]"
      :class="iconWrapClass"
    >
      <img
        v-if="iconUrl"
        :src="iconUrl"
        alt=""
        class="w-4 h-4 object-contain"
        :class="iconImgClass"
      />
    </span>
    <span
      class="flex justify-center items-center text-xs font-medium leading-[1.125rem] py-[3px] px-[6px] bg-black"
      :class="labelClass"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  status: {
    type: String,
    default: 'reviewing',
  },
  /** i18n prefix for status labels — media default, merch can override */
  statusI18nPrefix: {
    type: String,
    default: 'mediaUploader.library.status',
  },
});

const { t } = useI18n();
const { url: mediaReviewingIconUrl } = useAssetUrl('mediaUploader.icon.reviewing');
const { url: merchReviewingIconUrl } = useAssetUrl('shops.merch.icon.reviewing');
const { url: publishedIconUrl } = useAssetUrl('icon.media.upload');
const { url: draftIconUrl } = useAssetUrl('mediaUploader.icon.draft');
const { url: preorderIconUrl } = useAssetUrl('shops.merch.icon.preorder');

const isMerchStatus = computed(() =>
  String(props.statusI18nPrefix || '').startsWith('shops.merch'),
);

const normalized = computed(() => {
  if (props.status === 'published') return 'published';
  if (props.status === 'draft') return 'draft';
  if (props.status === 'preorder' || props.status === 'pre-order') return 'preorder';
  return 'reviewing';
});

const label = computed(() => t(`${props.statusI18nPrefix}.${normalized.value}`));

const iconUrl = computed(() => {
  if (normalized.value === 'published') return publishedIconUrl.value;
  if (normalized.value === 'draft') return draftIconUrl.value;
  if (normalized.value === 'preorder') return preorderIconUrl.value;
  if (isMerchStatus.value) return merchReviewingIconUrl.value;
  return mediaReviewingIconUrl.value;
});

const iconWrapClass = computed(() => {
  if (normalized.value === 'published') return 'bg-success';
  if (normalized.value === 'draft') return 'bg-border-light';
  if (normalized.value === 'preorder') return 'bg-[#FDB022]';
  return 'bg-status';
});

const labelClass = computed(() => {
  if (normalized.value === 'published') return 'text-success';
  if (normalized.value === 'draft') return 'text-border-light';
  if (normalized.value === 'preorder') return 'text-[#FDB022]';
  return 'text-status';
});

const iconImgClass = computed(() => {
  if (normalized.value === 'published') {
    return 'dark:[filter:brightness(0)_saturate(100%)_invert(100%)]';
  }
  // Merch preorder/reviewing icons stay black (as provided)
  if (normalized.value === 'preorder' || (normalized.value === 'reviewing' && isMerchStatus.value)) {
    return '[filter:brightness(0)]';
  }
  return '';
});
</script>
