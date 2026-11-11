<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  showActiveDot: {
    type: Boolean,
    default: true,
  },
});

const { t } = useI18n();
const { url: placeholderAvatarUrl } = useAssetUrl('profileSettings.placeholderAvatar');
</script>

<template>
  <div class="relative rounded-full w-[7.5rem] h-[7.5rem]">
    <div
      class="w-full h-full relative overflow-hidden border-[0.75px] border-[#00000014] rounded-full dark:border-[#363b3d14]"
    >
      <img
        :src="props.src || placeholderAvatarUrl"
        :alt="props.alt || t('profileSettings.icons.avatar')"
        class="w-full h-full object-cover rounded-full"
      />
    </div>

    <div
      v-if="showActiveDot"
      class="absolute block rounded-full w-4 h-4 top-[7.125rem] left-[7.125rem] bg-[#07F468] dark:bg-[#06c353]"
    />
  </div>
</template>
