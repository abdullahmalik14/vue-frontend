<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[22050] flex items-center justify-center bg-black/5 p-4 backdrop-blur-[7.5px]"
      @click.self.stop
    >
      <div
        class="flex w-full flex-col gap-6 rounded-[5px] bg-[#FFFFFFE5] p-4 shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.08),0px_4px_8px_-2px_rgba(16,24,40,0.1)] backdrop-blur-[100px] dark:bg-[#181a1be5]"
        :style="{ maxWidth }"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        @click.stop
      >
        <!-- Leave -->
        <template v-if="variant === 'leave'">
          <p class="text-base font-normal leading-6 text-[#344054] dark:text-[#dbd8d3]">
            {{ t('plan.confirm.leaveMessage') }}
          </p>
          <div class="flex w-full items-center justify-start gap-2">
            <DashboardPrimaryButton
              :text="t('plan.confirm.cancel')"
              theme="planConfirmLeaveCancel"
              type="button"
              @click="handleSecondary"
            />
            <DashboardPrimaryButton
              :text="t('plan.confirm.leave')"
              theme="planConfirmLeave"
              type="button"
              @click="handlePrimary"
            />
          </div>
        </template>

        <!-- Background image error (too large / wrong format) -->
        <template v-else-if="variant === 'imageError'">
          <div class="flex flex-col gap-1">
            <p class="text-base font-semibold leading-6 text-[#344054] dark:text-[#dbd8d3]">
              {{ t('plan.confirm.cannotProcessImage') }}
            </p>
            <p class="text-base font-normal leading-6 text-[#344054] dark:text-[#dbd8d3]">
              {{ imageErrorMessage }}
            </p>
          </div>
          <div class="flex w-full items-center justify-start gap-2">
            <DashboardPrimaryButton
              :text="t('plan.confirm.back')"
              theme="planConfirmLeave"
              type="button"
              @click="handleSecondary"
            />
          </div>
        </template>

        <!-- Delete / publish / unpublish confirm — Cancel + OK -->
        <template v-else-if="variant === 'actionConfirm'">
          <p class="text-base font-normal leading-6 text-[#344054] dark:text-[#dbd8d3]">
            {{ message }}
          </p>
          <div class="flex w-full items-center justify-start gap-2">
            <DashboardPrimaryButton
              :text="t('plan.confirm.cancel')"
              theme="planConfirmLeaveCancel"
              type="button"
              @click="handleSecondary"
            />
            <DashboardPrimaryButton
              :text="t('plan.confirm.ok')"
              theme="planConfirmLeave"
              type="button"
              @click="handlePrimary"
            />
          </div>
        </template>

        <!-- Draft saved — Add Media only when tier has no media checkboxes selected -->
        <template v-else>
          <div class="flex flex-col gap-1">
            <p class="text-base font-semibold leading-6 text-[#344054] dark:text-[#dbd8d3]">
              {{ t('plan.confirm.draftSavedTitle', { name: tierName || t('plan.confirm.untitledTier') }) }}
            </p>
            <p
              v-if="showAddMedia"
              class="text-base font-normal leading-6 text-[#344054] dark:text-[#dbd8d3]"
            >
              {{ t('plan.confirm.draftSavedHint') }}
            </p>
          </div>
          <div class="flex w-full flex-wrap items-center gap-2">
            <DashboardPrimaryButton
              :text="t('plan.confirm.backToSettings')"
              :theme="showAddMedia ? 'planConfirmBack' : 'planConfirmAddMedia'"
              type="button"
              @click="handleSecondary"
            />
            <DashboardPrimaryButton
              v-if="showAddMedia"
              :text="t('plan.confirm.addMedia')"
              theme="planConfirmAddMedia"
              type="button"
              @click="handlePrimary"
            />
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** `leave` | `draftSaved` | `imageError` | `actionConfirm` */
  variant: {
    type: String,
    default: 'leave',
    validator: (value) =>
      ['leave', 'draftSaved', 'imageError', 'actionConfirm'].includes(value),
  },
  /** Tier name for draft-saved title */
  tierName: { type: String, default: '' },
  /** Dialog max-width (CSS length). Leave uses default; draftSaved can pass a wider value. */
  maxWidth: {
    type: String,
    default: '26rem',
  },
  /**
   * draftSaved only: show “must add media” hint + Add Media CTA.
   * false when Plan Detail media checkboxes are already selected.
   */
  showAddMedia: {
    type: Boolean,
    default: true,
  },
  /** imageError only: `tooLarge` | `wrongFormat` */
  imageErrorKind: {
    type: String,
    default: 'tooLarge',
    validator: (value) => ['tooLarge', 'wrongFormat'].includes(value),
  },
  /** actionConfirm only — full body copy from parent */
  message: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'primary', 'secondary']);

const { t } = useI18n();

const imageErrorMessage = computed(() =>
  props.imageErrorKind === 'wrongFormat'
    ? t('plan.confirm.wrongFormat')
    : t('plan.confirm.fileSizeTooLarge'),
);

function close() {
  emit('update:modelValue', false);
}

function handleSecondary() {
  emit('secondary');
  close();
}

function handlePrimary() {
  emit('primary');
  close();
}

function setBodyScrollLocked(locked) {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.modelValue,
  (open) => {
    setBodyScrollLocked(open);
  },
);

onBeforeUnmount(() => {
  setBodyScrollLocked(false);
});
</script>
