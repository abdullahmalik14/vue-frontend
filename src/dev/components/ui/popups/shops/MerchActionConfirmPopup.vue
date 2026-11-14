<script setup>
import { computed, nextTick, onBeforeUnmount, onUnmounted, ref, watch } from 'vue';

const OVERLAY_PRESETS = {
  default: 'bg-black/40 backdrop-blur-[6px]',
  /** Unpublish / Delete confirm — Figma frosted white scrub */
  merchDestructive: 'bg-white/40 backdrop-blur-[5px]',
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  backLabel: { type: String, default: 'Back' },
  confirmLabel: { type: String, default: 'Confirm' },
  /** Max panel width (px) — shrinks on smaller screens via w-full */
  maxWidthPx: { type: [Number, String], default: 520 },
  /**
   * Scrim behind the panel.
   * Named: `default` | `merchDestructive`
   * Or pass raw Tailwind classes.
   */
  overlayClass: { type: String, default: 'default' },
  /** Center inside the merch listing panel instead of the viewport. */
  contain: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'back']);

const panelStyle = computed(() => ({
  maxWidth: `${Number(props.maxWidthPx) || 520}px`,
}));

const resolvedOverlayClass = computed(() => {
  const key = String(props.overlayClass || 'default');
  return OVERLAY_PRESETS[key] || key;
});

function close() {
  emit('update:modelValue', false);
}

function onBack() {
  emit('back');
  close();
}

function onConfirm() {
  emit('confirm');
  close();
}

function onEscapeKey(event) {
  if (event.key === 'Escape') close();
}

const containOverlayStyle = ref({
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100dvh',
  zIndex: '10200',
});

function resolveContainAnchor() {
  const content = document.querySelector('[data-merch-listing-popup]');
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
      zIndex: '10200',
    };
    return;
  }
  const rect = anchor.getBoundingClientRect();
  const hostZ = Number(window.getComputedStyle(anchor).zIndex);
  const zIndex = Number.isFinite(hostZ) && hostZ > 0 ? String(hostZ + 50) : '10200';
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

function setBodyScrollLocked(locked) {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.modelValue,
  async (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.addEventListener('keydown', onEscapeKey);
      setBodyScrollLocked(true);
      if (props.contain) {
        await nextTick();
        syncContainOverlayBox();
        requestAnimationFrame(() => syncContainOverlayBox());
        bindContainListeners();
      }
      return;
    }
    document.removeEventListener('keydown', onEscapeKey);
    setBodyScrollLocked(false);
    unbindContainListeners();
  },
);

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onEscapeKey);
  setBodyScrollLocked(false);
});

onUnmounted(() => {
  unbindContainListeners();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed z-[10200] flex items-center justify-center px-4"
      :class="[resolvedOverlayClass, contain ? '' : 'inset-0']"
      :style="contain ? containOverlayStyle : undefined"
      @click.self="close"
    >
      <div
        class="inline-flex w-full flex-col items-start justify-start gap-6 rounded-[5px] bg-white/90 p-4 backdrop-blur-[50px]"
        :style="panelStyle"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        @click.stop
      >
        <div class="flex w-full flex-col items-start justify-start gap-2 self-stretch">
          <div class="inline-flex w-full items-start justify-between self-stretch">
            <p class="flex-1 text-base font-semibold leading-6 text-slate-700">
              {{ title }}
            </p>
          </div>
          <p class="w-full self-stretch text-base font-normal leading-6 text-slate-700">
            {{ message }}
          </p>
        </div>

        <div class="inline-flex items-center justify-start gap-2">
          <button
            type="button"
            class="inline-flex h-10 min-w-24 cursor-pointer items-center justify-center gap-2.5 px-2 py-2 text-base font-medium leading-6 text-orange-600 hover:opacity-80"
            @click="onBack"
          >
            {{ backLabel }}
          </button>
          <button
            type="button"
            class="inline-flex h-10 min-w-24 cursor-pointer items-center justify-center gap-2.5 bg-orange-600 px-2 py-2 text-base font-medium leading-6 text-white hover:opacity-90"
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
