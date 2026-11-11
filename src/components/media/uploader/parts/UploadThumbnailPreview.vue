<script setup>
import { onMounted, onBeforeUnmount, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { preloadIcons } from "@/utils/preload.js";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();

// Props
const props = defineProps({
  bgImage: { type: String, default: "" }, // background image
  deleteIcon: { type: String, default: "" }, // delete button icon
  expandIcon: { type: String, default: "" }, // expand button icon
  showLabel: { type: Boolean, default: true }, // show/hide "Thumbnail" label
  labelText: { type: String, default: "" },
  showBlurToggle: { type: Boolean, default: true }, // toggle visibility
  preloadImages: { type: Array, default: () => [] }, // preload images
});

const injected = inject('mediaPreviewInteractions', null);
const blurIx = injected || useMediaInteractions('mediaUploaderUploadThumb');
const ownsBlurScope = !injected;
const blurConfig = blurIx.fieldConfig('blurThumbnail');

const resolvedLabelText = computed(() => props.labelText || t('mediaUploader.thumbnail.label'));
const blurToggleLabel = computed(() => t('mediaUploader.thumbnail.blurToggle'));

/** Only show an uploaded thumbnail — never fall back to a demo/slide image */
const previewUrl = computed(() => uploaderStore.form.thumbnailUrl || '');

const blurModel = computed({
  get: () => uploaderStore.form.blurThumbnail || false,
  set: (val) => {
    uploaderStore.updateFormField('blurThumbnail', val);
    blurIx.changeField(blurConfig, val, 'blurControls');
  },
});

const previewBlurStyle = computed(() => {
  if (!blurModel.value) return {};
  return {
    filter: 'blur(8px)',
    '-webkit-filter': 'blur(8px)',
  };
});

function clearThumbnail() {
  const url = uploaderStore.form.thumbnailUrl;
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
  uploaderStore.updateFormField('thumbnailUrl', '');
  uploaderStore.updateFormField('uploadedThumbnailFile', null);
}

onMounted(() => {
  if (props.preloadImages.length > 0) {
    preloadIcons(props.preloadImages);
  }
  blurIx.registerField(blurConfig, blurModel.value, 'blurControls');
});

onBeforeUnmount(() => {
  if (ownsBlurScope) blurIx.clear();
});
</script>

<template>
  <div data-component="media-upload-thumbnail-preview"
    v-if="previewUrl"
    class="w-full flex flex-col md:flex-row gap-4 md:items-stretch"
  >
    <div class="relative w-full md:w-1/2 overflow-hidden rounded bg-light-bg dark:bg-dark-gray-bg-2">
      <img
        :src="previewUrl"
        alt=""
        class="w-full aspect-[16/9] object-cover transition-all duration-300"
        :style="previewBlurStyle"
      />

      <button
        v-if="props.deleteIcon"
        type="button"
        class="absolute top-0 right-0 z-10 flex items-center justify-center h-6 w-6 cursor-pointer bg-error hover:bg-error-light"
        @click.stop="clearThumbnail"
      >
        <img :src="props.deleteIcon" :alt="t('mediaUploader.a11y.deleteIcon')" class="w-5 h-5" />
      </button>

      <span
        v-if="props.expandIcon"
        class="absolute bottom-0 left-0 flex items-center justify-center h-6 w-6 cursor-pointer"
      >
        <img :src="props.expandIcon" :alt="t('mediaUploader.a11y.expandIcon')" class="w-8 h-8 object-contain" />
      </span>

      <div
        v-if="props.showLabel"
        class="bg-black text-[12px] font-[600] text-white py-[4px] px-[4px] absolute bottom-0 right-0"
      >
        {{ resolvedLabelText }}
      </div>
    </div>

    <div
      v-if="props.showBlurToggle"
      class="w-full md:w-1/2 flex flex-col justify-end"
    >
      <CheckboxSwitch
        :label="blurToggleLabel"
        showWrapperLabel
        id="upload-thumbnail-blur-toggle"
        v-model="blurModel"
      />
    </div>
  </div>
</template>
