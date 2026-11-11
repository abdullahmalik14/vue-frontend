<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import BaseInput from '@/components/forms/inputs/BaseInput.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import CatalogSearchSelect from '@/dev/components/ui/search/CatalogSearchSelect.vue';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { storeToRefs } from 'pinia';

defineProps({
  hideFooterActions: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { tagCatalog, tagHistory, performerCatalog } = storeToRefs(uploaderStore);

const { url: backIconUrl } = useAssetUrl('mediaUploader.icon.back');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');

const titleModel = computed({
  get: () => uploaderStore.form.mediaTitle || '',
  set: (val) => {
    uploaderStore.updateFormField('mediaTitle', val);
  },
});

const descriptionModel = computed({
  get: () => uploaderStore.form.description || '',
  set: (val) => {
    uploaderStore.updateFormField('description', val);
  },
});

const tagsModel = computed({
  get: () => uploaderStore.form.tags || [],
  set: (val) => {
    uploaderStore.updateFormField('tags', val);
  },
});

const performersModel = computed({
  get: () => uploaderStore.form.coPerformerIds || [],
  set: (val) => {
    uploaderStore.updateFormField('coPerformerIds', val);
  },
});

const handleTagSearch = () => {};
const openManageTags = () => {};
const handlePerformerSearch = () => {};
</script>

<template>
  <div data-component="media-uploader-step-media-details" class="relative py-[16px] px-[10px] lg:px-[24px]">
    <div
      @click="uploaderStore.setStep(2)"
      class="flex gap-2 items-center cursor-pointer"
    >
      <img :src="backIconUrl" :alt="t('mediaUploader.shell.back')" />
      <button
        type="button"
        class="text-xs font-medium leading-[1.125rem] text-medium-text break-words"
      >
        {{ t('mediaUploader.shell.back') }}
      </button>
    </div>

    <div class="flex flex-col gap-6 mt-4">
      <BaseInput
        type="text"
        v-model="titleModel"
        :placeholder="t('mediaUploader.mediaDetails.titlePlaceholder')"
        inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300"
      />

      <DashboardTextInput
        id="input_g"
        type="textarea"
        show-label
        v-model="descriptionModel"
        textAreaRows="3"
        label-text=""
        :placeholder="t('mediaUploader.mediaDetails.descriptionPlaceholder')"
      />

      <CatalogSearchSelect
        :title="t('mediaUploader.mediaDetails.tagsTitle')"
        :subtitle="t('mediaUploader.mediaDetails.tagsSubtitle')"
        :placeholder="t('mediaUploader.mediaDetails.tagsPlaceholder')"
        type="tags"
        :results="tagCatalog"
        :history-tags="tagHistory"
        v-model="tagsModel"
        :max-items="10"
        :show-language-icon="true"
        @search="handleTagSearch"
        @manage-tags="openManageTags"
      />

      <CatalogSearchSelect
        :title="t('mediaUploader.mediaDetails.coPerformerTitle')"
        :subtitle="t('mediaUploader.mediaDetails.coPerformerSubtitle')"
        :placeholder="t('mediaUploader.mediaDetails.coPerformerPlaceholder')"
        type="performer"
        :results="performerCatalog"
        v-model="performersModel"
        :max-items="5"
        @search="handlePerformerSearch"
      />
    </div>

    <div v-if="!hideFooterActions" class="flex justify-end md:mt-0 mt-4">
      <DashboardPrimaryButton
        :text="t('mediaUploader.shell.next')"
        variant="polygonLeft"
        :rightIcon="nextIconUrl"
        :rightIconClass="`
          w-6 h-6 transition duration-200
          filter brightness-0 invert-0
          group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]
        `"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
        type="button"
        @click="uploaderStore.setStep(4)"
      />
    </div>
  </div>
</template>
