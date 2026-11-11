<script setup>
import { useI18n } from 'vue-i18n';
import { useEditProfileAssets } from '@/dev/composables/useEditProfileAssets.js';

defineProps({
  hasImage: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['upload-new', 'choose-avatar', 'edit']);

const { t } = useI18n();
const { assets } = useEditProfileAssets();
</script>

<template>
  <ul class="flex flex-col rounded-lg bg-white border-[#BABCCB80] shadow-[0px_0px_10px_0px_#0000001A] w-max dark:bg-[#181a1b] dark:border-[#41474980]">
    <li
      v-if="hasImage"
      @click="$emit('edit')"
      class="h-12 flex items-center gap-2.5 p-2 border-b-[#DEE5EC] cursor-pointer dark:border-b-[#2b3b4b]"
    >
      <img
        :src="assets.edit"
        :alt="t('editProfile.page.alt.edit')"
        class="w-6 h-6 [filter:brightness(0)] dark:[filter:invert(1)]"
      />
      <span class="text-base font-medium capitalize text-[#303437] dark:text-[#c8c3bb]">
        {{ t('editProfile.page.menu.edit') }}
      </span>
    </li>

    <li
      @click="$emit('upload-new')"
      class="h-12 flex items-center gap-2.5 p-2 border-b-[#DEE5EC] cursor-pointer dark:border-b-[#2b3b4b]"
    >
      <img
        :src="assets.upload"
        :alt="t('editProfile.page.alt.upload')"
        class="w-6 h-6 [filter:brightness(0)] dark:[filter:invert(1)]"
      />
      <span class="text-base font-medium capitalize text-[#303437] dark:text-[#c8c3bb]">
        {{ hasImage ? t('editProfile.page.menu.uploadNew') : t('editProfile.page.menu.upload') }}
      </span>
    </li>

    <li
      @click="$emit('choose-avatar')"
      class="h-12 flex items-center gap-2.5 p-2 border-b-[#DEE5EC] cursor-pointer dark:border-b-[#2b3b4b]"
    >
      <img
        :src="assets.galleryMenu"
        :alt="t('editProfile.page.alt.images')"
        class="w-6 h-6 [filter:brightness(0)] dark:[filter:invert(1)]"
      />
      <span class="text-base font-medium capitalize text-[#303437] dark:text-[#c8c3bb]">
        {{ t('editProfile.page.menu.chooseFromAvatars') }}
      </span>
    </li>
  </ul>
</template>
