<template>
  <div
    :class="resolvedWrapperClass"
    data-component="thumbnail-uploader"
  >
    <div :class="resolvedInnerWrapperClass">
      <div class="flex flex-col items-center justify-center gap-3 relative">
        <!-- Full-area file hit target (plan / custom) -->
        <input
          v-if="fullAreaClick"
          ref="fileInputRef"
          type="file"
          class="appearance-none z-[5] opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          :accept="accept"
          :multiple="multiple"
          @change="handleFileChange"
        />

        <!-- Icon: green badge (media default) or plain slot (plan / custom) -->
        <div
          v-if="iconVariant === 'badge'"
          :class="resolvedIconOuterClass"
        >
          <input
            v-if="!fullAreaClick"
            ref="fileInputRef"
            type="file"
            class="appearance-none z-[5] opacity-0 absolute w-full h-full cursor-pointer"
            :accept="accept"
            :multiple="multiple"
            @change="handleFileChange"
          />
          <span :class="resolvedIconBadgeClass">
            <slot name="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="w-5 h-5 cursor-pointer">
                <g id="upload-cloud-02">
                  <path
                    d="M6.6665 13.3333L9.99984 10M9.99984 10L13.3332 13.3333M9.99984 10V17.5M16.6665 13.9524C17.6844 13.1117 18.3332 11.8399 18.3332 10.4167C18.3332 7.88536 16.2811 5.83333 13.7498 5.83333C13.5677 5.83333 13.3974 5.73833 13.3049 5.58145C12.2182 3.73736 10.2119 2.5 7.9165 2.5C4.46472 2.5 1.6665 5.29822 1.6665 8.75C1.6665 10.4718 2.36271 12.0309 3.48896 13.1613"
                    stroke="black"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="group-hover:stroke-success"
                  />
                </g>
              </svg>
            </slot>
          </span>
        </div>

        <div v-else class="relative flex justify-center items-center">
          <input
            v-if="!fullAreaClick"
            ref="fileInputRef"
            type="file"
            class="appearance-none z-[5] opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            :accept="accept"
            :multiple="multiple"
            @change="handleFileChange"
          />
          <slot name="icon" />
        </div>

        <h4 :class="resolvedTitleClass">
          <span :class="resolvedTitleHighlightClass">{{ resolvedTitle }}</span>
          <span v-if="resolvedSubtitle">&nbsp;{{ resolvedSubtitle }}</span>
        </h4>
      </div>

      <div v-if="showSelectedName && fileName">
        <Paragraph theme="custom" no-wrap add-class="text-success text-xs text-center font-semibold mt-2" :text="t('mediaUploader.thumbnailUploader.selected', { name: fileName })" />
      </div>

      <div>
        <Paragraph theme="custom" no-wrap :add-class="resolvedFileInfoClass" :text="resolvedFileInfo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { fileToDataUrl, fileMeta, isBlobUrl, revokeIfBlobUrl } from '@/utils/fileToDataUrl.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const fileInputRef = ref(null);

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  fileInfo: { type: String, default: '' },
  accept: { type: String, default: 'image/png, image/jpeg' },
  stateUrlKey: { type: String, default: 'thumbnailUrl' },
  stateFileKey: { type: String, default: 'uploadedThumbnailFile' },
  /** When false, only emits — does not write media uploader store */
  useMediaStore: { type: Boolean, default: true },
  /** Show selected filename under dropzone (media default) */
  showSelectedName: { type: Boolean, default: true },
  /** badge = green cloud chrome; plain = only #icon slot */
  iconVariant: { type: String, default: 'badge' },
  /** Underline the title span (plan background image UI) */
  underlineTitle: { type: Boolean, default: false },
  /** File input covers entire dropzone */
  fullAreaClick: { type: Boolean, default: false },
  /** Allow selecting multiple files (emits `files-selected`) */
  multiple: { type: Boolean, default: false },
  /** Max file size in bytes; 0 = no limit. Over → emit `file-rejected` reason `size`. */
  maxSize: { type: Number, default: 0 },
  wrapperClass: { type: String, default: '' },
  innerWrapperClass: { type: String, default: '' },
  iconOuterClass: { type: String, default: '' },
  iconBadgeClass: { type: String, default: '' },
  titleClass: { type: String, default: '' },
  titleHighlightClass: { type: String, default: '' },
  fileInfoClass: { type: String, default: '' },
});

const emit = defineEmits(['file-selected', 'files-selected', 'change', 'file-rejected']);

const DEFAULT_WRAPPER =
  'cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-60 flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative';
const DEFAULT_INNER =
  'gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent';
const DEFAULT_ICON_OUTER =
  'shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] rounded-lg h-10 w-10 relative flex justify-center items-center';
const DEFAULT_ICON_BADGE =
  'cursor-pointer shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] bg-success rounded-lg h-10 w-10 flex justify-center items-center group-hover:bg-black';
const DEFAULT_TITLE = 'text-dark-gray text-sm leading-5 text-center font-normal';
const DEFAULT_TITLE_HIGHLIGHT = 'text-dark-text font-semibold';
const DEFAULT_FILE_INFO = 'text-dark-gray text-xs leading-[1.125rem] text-center mb-0';

const resolvedWrapperClass = computed(() => props.wrapperClass || DEFAULT_WRAPPER);
const resolvedInnerWrapperClass = computed(() => props.innerWrapperClass || DEFAULT_INNER);
const resolvedIconOuterClass = computed(() => props.iconOuterClass || DEFAULT_ICON_OUTER);
const resolvedIconBadgeClass = computed(() => props.iconBadgeClass || DEFAULT_ICON_BADGE);
const resolvedTitleClass = computed(() => props.titleClass || DEFAULT_TITLE);
const resolvedTitleHighlightClass = computed(() => {
  if (props.titleHighlightClass) return props.titleHighlightClass;
  if (props.underlineTitle) {
    return 'text-sm font-semibold underline text-text-primary dark:text-timberwolf';
  }
  return DEFAULT_TITLE_HIGHLIGHT;
});
const resolvedFileInfoClass = computed(() => props.fileInfoClass || DEFAULT_FILE_INFO);

const fileName = computed(() => {
  if (!props.useMediaStore) return null;
  const fileData = uploaderStore.form[props.stateFileKey];
  return fileData ? fileData.name : null;
});

const resolvedTitle = computed(() => props.title || t('mediaUploader.thumbnailUploader.title'));
const resolvedSubtitle = computed(() =>
  props.subtitle === '' ? '' : props.subtitle || t('mediaUploader.thumbnailUploader.subtitle'),
);
const resolvedFileInfo = computed(() => props.fileInfo || t('mediaUploader.thumbnailUploader.fileInfo'));

function fileMatchesAccept(file) {
  const accept = (props.accept || '').trim();
  if (!accept) return true;
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return accept.split(',').some((raw) => {
    const token = raw.trim().toLowerCase();
    if (!token) return false;
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    if (token.startsWith('.')) return name.endsWith(token);
    return type === token;
  });
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const accepted = files.filter((file) => fileMatchesAccept(file));
  if (!accepted.length) {
    emit('file-rejected', { reason: 'format', file: files[0] || null });
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  if (props.multiple) {
    const payloads = accepted.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
    }));
    emit('files-selected', payloads);
    emit('file-selected', payloads[0]);
    emit('change', event);
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  const file = accepted[0];
  if (props.maxSize > 0 && Number(file.size) > props.maxSize) {
    emit('file-rejected', { reason: 'size', file });
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  emit('file-selected', { file, objectUrl });
  emit('change', event);

  if (!props.useMediaStore) return;

  uploaderStore.updateFormField(props.stateFileKey, fileMeta(file));
  uploaderStore.updateFormField(props.stateUrlKey, objectUrl);

  fileToDataUrl(file)
    .then((dataUrl) => {
      if (!dataUrl) return;
      if (isBlobUrl(objectUrl)) revokeIfBlobUrl(objectUrl);
      uploaderStore.updateFormField(props.stateUrlKey, dataUrl);
    })
    .catch((error) => {
      console.warn('[ThumbnailUploader] data URL persist failed', error);
    });
};

defineExpose({
  open: () => fileInputRef.value?.click(),
  reset: () => {
    if (fileInputRef.value) fileInputRef.value.value = '';
  },
});
</script>
