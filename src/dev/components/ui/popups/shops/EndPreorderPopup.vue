<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Initial radio: keepInStore | unpublish */
  initialAction: { type: String, default: 'keepInStore' },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const { t } = useI18n();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');

const endAction = ref('keepInStore');
const containOverlayStyle = ref({
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100dvh',
  zIndex: '10050',
});

const keepOption = computed(() => [
  {
    value: 'keepInStore',
    label: t('shops.merch.listing.publish.endPreorder.keepInStore'),
  },
]);

const unpublishOption = computed(() => [
  {
    value: 'unpublish',
    label: t('shops.merch.listing.publish.endPreorder.unpublishFromStore'),
  },
]);

function resolveContainAnchor() {
  const content =
    document.querySelector('[data-merch-listing-popup]') ||
    document.querySelector('[data-upload-media-popup]');
  if (!content) return null;
  return content.closest('[role="dialog"]') || content;
}

function syncContainOverlayBox() {
  const anchor = resolveContainAnchor();
  if (!anchor) {
    containOverlayStyle.value = {
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100dvh',
      zIndex: '10050',
    };
    return;
  }
  const rect = anchor.getBoundingClientRect();
  const hostZ = Number(window.getComputedStyle(anchor).zIndex);
  const zIndex = Number.isFinite(hostZ) && hostZ > 0 ? String(hostZ + 50) : '10050';
  containOverlayStyle.value = {
    top: `${Math.round(rect.top)}px`,
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    zIndex,
  };
}

function bindContainListeners() {
  window.addEventListener('resize', syncContainOverlayBox);
  window.addEventListener('scroll', syncContainOverlayBox, true);
}

function unbindContainListeners() {
  window.removeEventListener('resize', syncContainOverlayBox);
  window.removeEventListener('scroll', syncContainOverlayBox, true);
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      endAction.value =
        props.initialAction === 'unpublish' ? 'unpublish' : 'keepInStore';
      await nextTick();
      syncContainOverlayBox();
      requestAnimationFrame(() => syncContainOverlayBox());
      bindContainListeners();
    } else {
      unbindContainListeners();
    }
  },
);

onUnmounted(() => {
  unbindContainListeners();
});

function close() {
  emit('update:modelValue', false);
}

function onConfirm() {
  emit('confirm', endAction.value);
  close();
}
</script>

<template>
  <!-- Nested contain: center inside merch listing panel (same pattern as CancelUploadPopup) -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      data-base-popup-portaled
      class="fixed flex items-center justify-center bg-black/5 px-4 py-6 backdrop-blur-[7.5px]"
      :style="containOverlayStyle"
      @mousedown.stop
      @click.stop.self="close"
    >
      <div
        data-component="end-preorder-popup"
        class="flex w-full max-w-[28rem] flex-col gap-4 bg-white p-4 shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="flex items-center justify-between gap-4">
          <Heading
            :text="t('shops.merch.listing.publish.endPreorder.title')"
            tag="h3"
            theme="custom"
            no-wrap
            add-class="text-base font-semibold text-[#0C111D]"
          />
          <button
            type="button"
            class="cursor-pointer p-1 hover:opacity-80"
            :aria-label="t('shops.merch.listing.closeAlt')"
            @click="close"
          >
            <img
              v-if="closeIconUrl"
              :src="closeIconUrl"
              :alt="t('shops.merch.listing.closeAlt')"
              class="h-4 w-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
            />
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <RadioGroup
              v-model="endAction"
              name="end-preorder-action"
              :options="keepOption"
              theme="dashboard"
              radio-label-class="text-[16px] font-semibold text-[#0C111D]"
            />
            <p class="pl-8 text-sm font-normal text-[#344054]">
              {{ t('shops.merch.listing.publish.endPreorder.keepInStoreHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <RadioGroup
              v-model="endAction"
              name="end-preorder-action"
              :options="unpublishOption"
              theme="dashboard"
              radio-label-class="text-[16px] font-semibold text-[#0C111D]"
            />
            <p class="pl-8 text-sm font-normal text-[#344054]">
              {{ t('shops.merch.listing.publish.endPreorder.unpublishHint') }}
            </p>
          </div>
        </div>

        <DashboardPrimaryButton
          :text="t('shops.merch.listing.publish.endPreorder.updateButton')"
          theme="merchEndPreorderUpdate"
          type="button"
          @click="onConfirm"
        />
      </div>
    </div>
  </Teleport>
</template>
