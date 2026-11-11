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
});

const { t } = useI18n();
const { url: reviewingIconUrl } = useAssetUrl('mediaUploader.icon.reviewing');
const { url: publishedIconUrl } = useAssetUrl('icon.media.upload');
const { url: draftIconUrl } = useAssetUrl('mediaUploader.icon.draft');

const normalized = computed(() => {
  if (props.status === 'published') return 'published';
  if (props.status === 'draft') return 'draft';
  return 'reviewing';
});

const label = computed(() => t(`mediaUploader.library.status.${normalized.value}`));

const iconUrl = computed(() => {
  if (normalized.value === 'published') return publishedIconUrl.value;
  if (normalized.value === 'draft') return draftIconUrl.value;
  return reviewingIconUrl.value;
});

const iconWrapClass = computed(() => {
  if (normalized.value === 'published') return 'bg-success';
  if (normalized.value === 'draft') return 'bg-border-light';
  return 'bg-status';
});

const labelClass = computed(() => {
  if (normalized.value === 'published') return 'text-success';
  if (normalized.value === 'draft') return 'text-border-light';
  return 'text-status';
});

const iconImgClass = computed(() => {
  if (normalized.value === 'published') return 'dark:[filter:brightness(0)_saturate(100%)_invert(100%)]';
  return '';
});
</script>
