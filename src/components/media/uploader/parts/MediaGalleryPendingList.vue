<template>
  <div
    data-component="media-gallery-pending-list"
    :class="rootClass"
  >
    <!-- Default: grows in fixed shell. Merch: grows with rows, scrolls after 240px. -->
    <div :class="listWrapClass">
      <ul class="flex w-full flex-col">
        <li
          v-for="(item, index) in files"
          :key="item.id"
          :class="[
            rowClass,
            index < files.length - 1 ? 'border-b border-handle-light' : '',
          ]"
        >
          <img
            v-if="fileIconUrl"
            :src="fileIconUrl"
            alt=""
            class="h-5 w-5 shrink-0 object-contain [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(9%)_saturate(747%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
          />
          <span class="min-w-0 flex-1 truncate text-sm font-medium text-medium-text dark:text-cosmo-darkInk">
            {{ item.name }}
          </span>
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center gap-1.5 hover:opacity-80"
            @click="emit('remove', item.id)"
          >
            <img
              v-if="removeIconUrl"
              :src="removeIconUrl"
              :alt="t('mediaUploader.uploadPopup.gallery.remove')"
              class="h-4 w-4"
            />
            <span class="text-xs font-[500] text-secondary-text dark:text-text-badge-dark">
              {{ t('mediaUploader.uploadPopup.gallery.remove') }}
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Figma: Select more + Upload inside grey box footer -->
    <div :class="footerClass">
      <button
        v-if="!hideSelectMore"
        type="button"
        class="relative inline-flex cursor-pointer items-center gap-1 py-3 text-sm font-medium text-mediaUi-linkBlue hover:opacity-80"
      >
        <img
          v-if="plusIconUrl"
          :src="plusIconUrl"
          alt=""
          class="h-3 w-3"
        />
        <span class="text-sm font-[500] text-mediaUi-linkBlue">{{ t('mediaUploader.uploadPopup.gallery.selectMore') }}</span>
        <input
          ref="moreInputRef"
          type="file"
          class="absolute inset-0 cursor-pointer opacity-0"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          multiple
          @change="onMoreFiles"
        />
      </button>
    </div>

    <button
      type="button"
      :disabled="uploadDisabled"
      :class="uploadBtnClass"
      @click="onUploadClick"
    >
      <img
        v-if="uploadIconUrl"
        :src="uploadIconUrl"
        alt=""
        :class="uploadIconClass"
      />
      <span class="relative inline-flex items-center">
        <span>{{ t('mediaUploader.uploadPopup.gallery.upload') }}</span>
        <span
          v-if="isMerch && fileCount > 0"
          class="ml-[10px] -translate-y-1.5 text-[10px] font-medium leading-none"
          :class="uploadDisabled ? 'text-[#98A2B3]' : 'text-success group-hover:text-black'"
        >
          {{ fileCount }}
        </span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  /**
   * Merch listing only: grow-with-files list (max 240px), 48px rows, 4px footer gap.
   * Media uploader keeps the default fixed-height shell.
   */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'merch'].includes(v),
  },
  /** Optional: hide “Select more files”. Merch keeps this visible when over limit. */
  hideSelectMore: {
    type: Boolean,
    default: false,
  },
  /** Merch: disable Upload when selected files exceed max. */
  uploadDisabled: {
    type: Boolean,
    default: false,
  },
  /** Merch: file count badge on Upload button. */
  fileCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['remove', 'upload', 'add-files']);
const { t } = useI18n();
const { url: removeIconUrl } = useAssetUrl('mediaUploader.icon.galleryRemove');
const { url: plusIconUrl } = useAssetUrl('mediaUploader.icon.plusBlue');
const { url: uploadIconUrl } = useAssetUrl('mediaUploader.icon.uploadBtn');
const { url: fileIconUrl } = useAssetUrl('mediaUploader.icon.tabSingleImage');
const moreInputRef = ref(null);

const isMerch = computed(() => props.variant === 'merch');

const rootClass = computed(() =>
  isMerch.value
    ? 'relative flex w-full flex-col overflow-hidden rounded-xl bg-mediaUi-black05 dark:bg-white/5'
    : 'relative flex h-[600px] md:h-72 w-full flex-col overflow-hidden rounded-xl bg-mediaUi-black05 dark:bg-white/5',
);

const listWrapClass = computed(() =>
  isMerch.value
    ? 'min-h-0 max-h-[240px] overflow-y-auto px-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-light'
    : 'min-h-0 flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-light',
);

const rowClass = computed(() =>
  isMerch.value
    ? 'flex h-12 items-center gap-3 px-2 py-1'
    : 'flex items-center gap-3 px-2 py-2',
);

const footerClass = computed(() =>
  isMerch.value
    ? 'mt-1 flex h-10 shrink-0 items-center pl-4 pr-36'
    : 'mt-5 flex h-10 shrink-0 items-center pl-4 pr-36',
);

const uploadBtnClass = computed(() => {
  if (!isMerch.value) {
    return 'group absolute bottom-0 right-0 inline-flex h-10 cursor-pointer items-center justify-center gap-[10px] bg-black pl-8 pr-4 text-sm font-medium text-success [clip-path:polygon(1rem_0,100%_0,100%_100%,0_100%)] hover:bg-success hover:text-black';
  }
  if (props.uploadDisabled) {
    return 'absolute bottom-0 right-0 inline-flex h-10 cursor-not-allowed items-center justify-center gap-[10px] bg-[#3440540D] pl-8 pr-4 text-sm font-medium text-[#98A2B3] [clip-path:polygon(1rem_0,100%_0,100%_100%,0_100%)]';
  }
  return 'group absolute bottom-0 right-0 inline-flex h-10 cursor-pointer items-center justify-center gap-[10px] bg-black pl-8 pr-4 text-sm font-medium text-success [clip-path:polygon(1rem_0,100%_0,100%_100%,0_100%)] hover:bg-success hover:text-black';
});

const uploadIconClass = computed(() => {
  if (isMerch.value && props.uploadDisabled) {
    return 'h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(8%)_saturate(281%)_hue-rotate(182deg)_brightness(91%)_contrast(88%)]';
  }
  return 'h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover:[filter:brightness(0)]';
});

function onUploadClick() {
  if (props.uploadDisabled) return;
  emit('upload');
}

function onMoreFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  emit(
    'add-files',
    files.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    })),
  );
  if (moreInputRef.value) moreInputRef.value.value = '';
}
</script>
