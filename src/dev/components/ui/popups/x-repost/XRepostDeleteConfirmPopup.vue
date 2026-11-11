<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[10200] flex items-end justify-center bg-black/5 backdrop-blur-[7.5px] md:items-center md:px-4 md:py-6"
      @click.self="close"
    >
      <div
        class="flex w-full max-w-none flex-col gap-4 overflow-hidden border-t border-[#EAECF0] bg-[#FFFFFFE5] p-4 shadow-[0_0_12px_0_#00000033] md:w-[297px] md:max-w-[calc(100vw-2rem)] md:rounded-lg md:border md:border-transparent md:bg-[#FFFFFFE5] md:shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.08)] md:backdrop-blur-[50px]"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        @click.stop
      >
        <p class="text-base font-semibold leading-6 text-[#344054] dark:text-text">
          {{ t('dashboard.xRepost.deleteConfirm.message') }}
        </p>

        <div class="flex w-full items-center justify-start gap-2">
          <button
            type="button"
            class="flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center border border-[#FF4405] bg-transparent px-3 text-sm font-medium text-[#FF4405] transition-colors hover:bg-[#FF4405] hover:text-white"
            @click="close"
          >
            {{ t('dashboard.xRepost.deleteConfirm.cancel') }}
          </button>

          <button
            type="button"
            class="flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center border border-transparent bg-[#FF4405] px-4 text-sm font-medium text-white transition-colors hover:border-[#FF4405] hover:bg-transparent hover:text-[#FF4405]"
            @click="handleConfirm"
          >
            {{ t('dashboard.xRepost.deleteConfirm.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const { t } = useI18n();

function close() {
  emit('update:modelValue', false);
}

function handleConfirm() {
  emit('confirm');
  close();
}

function onEscapeKey(event) {
  if (event.key === 'Escape') close();
}

function setBodyScrollLocked(locked) {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.addEventListener('keydown', onEscapeKey);
      setBodyScrollLocked(true);
      return;
    }
    document.removeEventListener('keydown', onEscapeKey);
    setBodyScrollLocked(false);
  },
);

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onEscapeKey);
  setBodyScrollLocked(false);
});
</script>
