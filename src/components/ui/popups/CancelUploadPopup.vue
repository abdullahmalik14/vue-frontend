<template>
  <!-- Nested + contain: fixed to visible parent panel (handles tall scroll content) -->
  <Teleport v-if="nested && contain" to="body">
    <div
      v-if="modelValue"
      data-base-popup-portaled
      class="fixed flex items-end justify-center bg-black/5 backdrop-blur-[7.5px] sm:items-center sm:px-4 sm:py-6"
      :style="containOverlayStyle"
      @mousedown.stop
      @click.stop.self="dismiss"
    >
      <div
        :class="panelClass"
        @click.stop
      >
        <button
          v-if="showCloseButton"
          type="button"
          class="absolute top-4 right-4 z-[1] cursor-pointer p-1 hover:opacity-80"
          :aria-label="t('mediaUploader.uploadPopup.closeAlt')"
          @click="dismiss"
        >
          <img
            v-if="closeIconUrl"
            :src="closeIconUrl"
            alt=""
            class="h-4 w-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
          >
        </button>

        <div class="flex flex-col gap-6 p-4">
          <div :class="['flex flex-col gap-2', showCloseButton ? 'pr-6' : '']">
            <p
              v-if="resolvedTitle"
              class="text-base font-semibold text-[#344054] dark:text-text"
            >
              {{ resolvedTitle }}
            </p>
            <p
              :class="
                resolvedTitle
                  ? 'text-sm font-normal text-[#667085] dark:text-[#9e9589]'
                  : 'text-base font-semibold text-[#344054] dark:text-text'
              "
            >
              {{ resolvedMessage }}
            </p>
          </div>

          <div :class="actionsRowClass">
            <button
              type="button"
              :class="secondaryBtnClass"
              @click="handleSecondary"
            >
              <span class="text-base font-medium">{{ resolvedCancelLabel }}</span>
            </button>

            <button
              type="button"
              :class="primaryBtnClass"
              @click="handlePrimary"
            >
              <span class="text-base font-medium">{{ resolvedConfirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Nested sidebar: overlay scoped to fixed right panel -->
  <div
    v-else-if="nested && modelValue"
    :class="nestedOverlayClass"
    @click.self="dismiss"
  >
    <div
      :class="panelClass"
      @click.stop
    >
      <button
        v-if="showCloseButton"
        type="button"
        class="absolute top-4 right-4 z-[1] cursor-pointer p-1 hover:opacity-80"
        :aria-label="t('mediaUploader.uploadPopup.closeAlt')"
        @click="dismiss"
      >
        <img
          v-if="closeIconUrl"
          :src="closeIconUrl"
          alt=""
          class="h-4 w-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
        >
      </button>

      <div class="flex flex-col gap-6 p-4">
        <div :class="['flex flex-col gap-2', showCloseButton ? 'pr-6' : '']">
          <p
            v-if="resolvedTitle"
            class="text-base font-semibold text-[#344054] dark:text-text"
          >
            {{ resolvedTitle }}
          </p>
          <p
            :class="
              resolvedTitle
                ? 'text-sm font-normal text-[#667085] dark:text-[#9e9589]'
                : 'text-base font-semibold text-[#344054] dark:text-text'
            "
          >
            {{ resolvedMessage }}
          </p>
        </div>

        <div :class="actionsRowClass">
          <button
            type="button"
            :class="secondaryBtnClass"
            @click="handleSecondary"
          >
            <span class="text-base font-medium">{{ resolvedCancelLabel }}</span>
          </button>

          <button
            type="button"
            :class="primaryBtnClass"
            @click="handlePrimary"
          >
            <span class="text-base font-medium">{{ resolvedConfirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Default: full-page centered popup -->
  <BasePopup
    v-else-if="!nested"
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="uploadCancelConfig"
  >
    <div
      :class="panelClass"
    >
      <button
        v-if="showCloseButton"
        type="button"
        class="absolute top-4 right-4 z-[1] cursor-pointer p-1 hover:opacity-80"
        :aria-label="t('mediaUploader.uploadPopup.closeAlt')"
        @click="dismiss"
      >
        <img
          v-if="closeIconUrl"
          :src="closeIconUrl"
          alt=""
          class="h-4 w-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
        >
      </button>

      <div class="flex flex-col gap-6 p-4">
        <div :class="['flex flex-col gap-2', showCloseButton ? 'pr-6' : '']">
          <p
            v-if="resolvedTitle"
            class="text-base font-semibold text-[#344054] dark:text-text"
          >
            {{ resolvedTitle }}
          </p>
          <p
            :class="
              resolvedTitle
                ? 'text-sm font-normal text-[#667085] dark:text-[#9e9589]'
                : 'text-base font-semibold text-[#344054] dark:text-text'
            "
          >
            {{ resolvedMessage }}
          </p>
        </div>

        <div :class="actionsRowClass">
          <button
            type="button"
            :class="secondaryBtnClass"
            @click="handleSecondary"
          >
            <span class="text-base font-medium">{{ resolvedCancelLabel }}</span>
          </button>

          <button
            type="button"
            :class="primaryBtnClass"
            @click="handlePrimary"
          >
            <span class="text-base font-medium">{{ resolvedConfirmLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, ref, watch, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from './BasePopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Optional title above the message (leave-confirm style). */
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  cancelLabel: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: '',
  },
  /**
   * When true, confirm dialog stays over a parent panel instead of the full page.
   * Use with `contain` for Upload Media (absolute inset), or default for order-details sidebar.
   */
  nested: {
    type: Boolean,
    default: false,
  },
  /** When nested, overlay fills the relative parent instead of the fixed right sidebar. */
  contain: {
    type: Boolean,
    default: false,
  },
  /** 'confirm' | 'leave' | 'tabChange' */
  mode: {
    type: String,
    default: 'confirm',
  },
});

const emit = defineEmits(['update:modelValue', 'delete', 'save-draft']);
const { t } = useI18n();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');

const isLeaveMode = computed(() => props.mode === 'leave');
const isTabChangeMode = computed(() => props.mode === 'tabChange');
/** Leave + tab-change share start-aligned compact button row */
const isLeaveLayout = computed(() => isLeaveMode.value || isTabChangeMode.value);
const showCloseButton = computed(() => isLeaveMode.value);

function dismiss() {
  emit('update:modelValue', false);
}

const resolvedTitle = computed(() => {
  if (props.title) return props.title;
  if (isLeaveMode.value || isTabChangeMode.value) {
    return t('mediaUploader.uploadPopup.leaveConfirm.title');
  }
  return '';
});
const resolvedMessage = computed(() => {
  if (props.message) return props.message;
  if (isLeaveMode.value) return t('mediaUploader.uploadPopup.leaveConfirm.description');
  if (isTabChangeMode.value) return t('mediaUploader.uploadPopup.tabChangeConfirm.message');
  return t('editProfile.page.cancelDialog.message');
});
const resolvedCancelLabel = computed(() => {
  if (props.cancelLabel) return props.cancelLabel;
  if (isLeaveMode.value) return t('mediaUploader.uploadPopup.leaveConfirm.saveDraft');
  if (isTabChangeMode.value) return t('mediaUploader.uploadPopup.tabChangeConfirm.back');
  return t('editProfile.page.cancelDialog.no');
});
const resolvedConfirmLabel = computed(() => {
  if (props.confirmLabel) return props.confirmLabel;
  if (isLeaveMode.value) return t('mediaUploader.uploadPopup.leaveConfirm.leave');
  if (isTabChangeMode.value) return t('mediaUploader.uploadPopup.tabChangeConfirm.continue');
  return t('editProfile.page.cancelDialog.confirm');
});

const nestedOverlayClass = computed(() =>
  'fixed inset-y-0 right-0 z-[2000] flex w-full items-end justify-center bg-black/5 backdrop-blur-[7.5px] sm:items-center sm:px-4 sm:py-6 md:w-[30rem]',
);

/** Visible BasePopup / slide-in panel box (not tall scroll content). */
const containOverlayStyle = ref({
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100dvh',
  zIndex: '10050',
});

function resolveContainAnchor() {
  const content =
    document.querySelector('[data-upload-media-popup]') ||
    document.querySelector('[data-merch-listing-popup]');
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
  () => props.modelValue && props.nested && props.contain,
  async (open) => {
    if (open) {
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

/** Leave / tab-change: compact width. Nested dialogs sit flush to the bottom below sm. */
const panelClass = computed(() =>
  [
    'relative bg-white/90 dark:bg-background-dark-appbu backdrop-blur-[50px] drop-shadow-[0px_-8px_10px_#0000000D] overflow-hidden sm:shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]',
    props.nested
      ? 'cancel-upload-sheet w-full rounded-t-[0.625rem] sm:rounded-lg'
      : 'rounded-lg',
    isLeaveLayout.value
      ? props.nested
        ? 'sm:w-[495px] sm:max-w-[calc(100%-2rem)]'
        : 'w-[495px] max-w-[calc(100%-2rem)]'
      : props.nested
        ? 'sm:max-w-[23.4375rem]'
        : 'w-full max-w-[23.4375rem]',
  ].join(' '),
);

const actionsRowClass = computed(() =>
  isLeaveLayout.value
    ? 'flex items-center justify-start gap-2'
    : 'flex items-center gap-2',
);

const secondaryBtnClass = computed(() =>
  isLeaveLayout.value
    ? 'h-10 px-3 flex justify-center items-center bg-transparent text-[#FF4405] transition-colors hover:bg-[#FF4405] hover:text-white cursor-pointer shrink-0 rounded-[2px]'
    : 'w-full h-10 flex justify-center items-center bg-transparent text-[#FF4405] transition-colors hover:bg-[#FF4405] hover:text-white cursor-pointer',
);

const primaryBtnClass = computed(() =>
  isLeaveLayout.value
    ? 'h-10 px-4 flex justify-center items-center bg-[#FF4405] text-white transition-colors hover:bg-white hover:text-[#FF4405] cursor-pointer shrink-0 rounded-[2px]'
    : 'w-full h-10 flex justify-center items-center bg-[#FF4405] text-white transition-colors hover:bg-white hover:text-[#FF4405] cursor-pointer',
);

function handleSecondary() {
  if (isLeaveMode.value) {
    emit('save-draft');
  }
  // tabChange Back / confirm No — just dismiss
  emit('update:modelValue', false);
}

function handlePrimary() {
  emit('delete');
  emit('update:modelValue', false);
}

const uploadCancelConfig = computed(() => ({
  actionType: 'popup',
  position: 'center',
  customEffect: 'scale',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: 'auto', '<480': '90%' },
  height: 'auto',
  scrollable: false,
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
}));
</script>

<style scoped>
@media (max-width: 479px) {
  .cancel-upload-sheet {
    animation: cancel-upload-sheet-in 300ms ease-in-out;
  }
}

@keyframes cancel-upload-sheet-in {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>
