<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[10250] flex items-end justify-center bg-black/5 backdrop-blur-[7.5px] md:items-center md:px-4 md:py-6"
      @click.self="handleBack"
    >
      <div
        class="flex w-full max-w-none flex-col gap-4 overflow-hidden border-t border-[#EAECF0] bg-[#FFFFFFE5] p-4 shadow-[0_0_12px_0_#00000033] md:w-[297px] md:max-w-[calc(100vw-2rem)] md:rounded-lg md:border md:border-transparent md:bg-[#FFFFFFE5] md:shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.08)] md:backdrop-blur-[50px]"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        @click.stop
      >
        <div class="flex flex-col gap-2">
          <p class="text-base font-semibold leading-6 text-[#344054] dark:text-text">
            {{ t('dashboard.xRepost.leaveConfirm.title') }}
          </p>
          <p class="text-sm font-normal leading-5 text-[#344054] dark:text-[#9e9589]">
            {{ t('dashboard.xRepost.leaveConfirm.message') }}
          </p>
        </div>

        <div class="flex w-full items-center justify-start gap-2">
          <button
            type="button"
            class="flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center border border-[#FF4405] bg-transparent px-3 text-sm font-medium text-[#FF4405] transition-colors hover:bg-[#FF4405] hover:text-white"
            @click="handleBack"
          >
            {{ t('dashboard.xRepost.leaveConfirm.back') }}
          </button>

          <button
            type="button"
            class="flex h-10 flex-1 shrink-0 cursor-pointer items-center justify-center border border-transparent bg-[#FF4405] px-4 text-sm font-medium text-white transition-colors hover:border-[#FF4405] hover:bg-transparent hover:text-[#FF4405]"
            @click="handleDiscard"
          >
            {{ t('dashboard.xRepost.leaveConfirm.discard') }}
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

const emit = defineEmits(['update:modelValue', 'discard', 'back']);

const { t } = useI18n();

function close() {
  emit('update:modelValue', false);
}

function handleBack() {
  emit('back');
  close();
}

function handleDiscard() {
  emit('discard');
  close();
}

function onEscapeKey(event) {
  if (event.key === 'Escape') handleBack();
}

function setBodyScrollLocked(locked) {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.modelValue,
  (open) => {
    setBodyScrollLocked(open);
    if (open) {
      document.addEventListener('keydown', onEscapeKey);
    } else {
      document.removeEventListener('keydown', onEscapeKey);
    }
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEscapeKey);
  setBodyScrollLocked(false);
});
</script>
