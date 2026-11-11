<template>
  <div
    data-component="media-uploader"
    class="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
  >
    <!-- head (standalone page only) -->
    <div v-if="!embedded" class="flex justify-between items-center px-[24px] py-[16px]">
      <Heading
        tag="h3"
        theme="custom"
        no-wrap
        add-class="text-sm font-semibold leading-5 text-primary-text dark:text-text"
        :text="t('mediaUploader.shell.uploadMedia')"
      />
      <img
        class="w-4 h-4 [pointer-events:none]"
        :src="closeIconUrl"
        :alt="t('mediaUploader.shell.closeAlt')"
      />
    </div>

    <!-- Step Header Navigation — edge-to-edge (no L/R padding) -->
    <DashboardWizardSteps
      :model-value="uploaderStore.step"
      :steps="steps"
      action-attr="select-uploader-step"
      @update:model-value="uploaderStore.setStep"
    />

    <!-- Step Content -->
    <div>
      <MediaUploaderStepPreviewSettings
        v-if="uploaderStore.step === 1"
        :hide-footer-actions="embedded"
        @back="onWizardBack"
      />
      <MediaUploaderStepSubscriptionP2v
        v-else-if="uploaderStore.step === 2"
        :hide-footer-actions="embedded"
      />
      <MediaUploaderStepMediaDetails
        v-else-if="uploaderStore.step === 3"
        :hide-footer-actions="embedded"
      />
      <MediaUploaderStepPublishAndSharing
        v-else-if="uploaderStore.step === 4"
        :hide-footer-actions="embedded"
      />
      <MediaUploaderStepSubmit
        v-else-if="uploaderStore.step === 5"
        ref="submitStepRef"
        :hide-footer-actions="embedded"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardWizardSteps from '@/components/ui/navigation/DashboardWizardSteps.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';

import MediaUploaderStepPreviewSettings from './MediaUploaderStepPreviewSettings.vue';
import MediaUploaderStepSubscriptionP2v from './MediaUploaderStepSubscriptionP2v.vue';
import MediaUploaderStepMediaDetails from './MediaUploaderStepMediaDetails.vue';
import MediaUploaderStepPublishAndSharing from './MediaUploaderStepPublishAndSharing.vue';
import MediaUploaderStepSubmit from './MediaUploaderStepSubmit.vue';

const emit = defineEmits(['back']);

const props = defineProps({
  /** When true, hides standalone page chrome (title/close) for popup embed */
  embedded: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const submitStepRef = ref(null);

const steps = computed(() => [
  { id: 1, labelKey: 'mediaUploader.shell.steps.previewSettings' },
  { id: 2, labelKey: 'mediaUploader.shell.steps.subscriptionP2v' },
  { id: 3, labelKey: 'mediaUploader.shell.steps.mediaDetails' },
  { id: 4, labelKey: 'mediaUploader.shell.steps.publishSharing' },
  { id: 5, labelKey: 'mediaUploader.shell.steps.submit' },
]);

function onWizardBack() {
  emit('back');
}

async function submitFromPopup() {
  return submitStepRef.value?.submit?.() ?? false;
}

defineExpose({
  submitFromPopup,
});

onMounted(() => {
  if (props.embedded) {
    if (uploaderStore.step < 1 || uploaderStore.step > 5) {
      uploaderStore.setStep(1);
    }
    return;
  }
  uploaderStore.initializeFromUrl();
});
</script>
