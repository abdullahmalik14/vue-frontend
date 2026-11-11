<template>
  <Teleport data-component="create-new-tag-popup" to="body">
    <div
      v-if="modelValue"
      data-base-popup-portaled
      class="fixed flex items-center justify-center px-4"
      :style="overlayStyle"
      @mousedown.stop
      @click.stop
    >
      <div
        class="absolute inset-0 bg-black/5 backdrop-blur-[7.5px] cursor-pointer"
        @click="close"
      />
      <div
        ref="panelRef"
        class="relative z-10 w-full max-w-[28rem] rounded-lg border border-mediaUi-borderSoft bg-white p-6 shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)]"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-lg font-semibold leading-7 text-text-primary">
            {{ t(`${i18nPrefix}.title`) }}
          </h2>
          <button
            type="button"
            class="p-1 shrink-0"
            :aria-label="t(`${i18nPrefix}.closeAlt`)"
            @click="close"
          >
            <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 1L1 17M1 1L17 17" stroke="#98A2B3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="mt-6 flex flex-col gap-5">
          <div>
            <RadioGroup
              v-model="scope"
              :name="scopeGroupName"
              :options="personalOption"
              theme="createTag"
            />
            <p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
              {{ t(`${i18nPrefix}.personalHint`, hintParams) }}
            </p>
          </div>

          <div>
            <RadioGroup
              v-model="scope"
              :name="scopeGroupName"
              :options="globalOption"
              theme="createTag"
            />
            <p class="pl-8 mt-1 text-xs leading-[1.125rem] text-text-quaternary">
              {{ t(`${i18nPrefix}.globalHint`, hintParams) }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-6 inline-flex items-center justify-center px-4 py-2 text-base font-medium text-white"
          :class="isPersonal ? 'bg-mediaUi-cyanAlt' : 'bg-border-notification-info-light'"
          @click="confirm"
        >
          {{ isPersonal ? t(`${i18nPrefix}.createButton`) : t(`${i18nPrefix}.nextButton`) }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tagName: { type: String, default: '' },
  /** tag = media tags; collection = merch collection create (same personal/global flow) */
  entity: {
    type: String,
    default: 'tag',
    validator: (v) => ['tag', 'collection'].includes(v),
  },
});

const emit = defineEmits(['update:modelValue', 'created']);

const { t } = useI18n();
const isCollection = computed(() => props.entity === 'collection');
const i18nPrefix = computed(() =>
  isCollection.value
    ? 'shops.merch.listing.createCollectionPopup'
    : 'mediaUploader.createTag',
);
const scopeGroupName = computed(() =>
  isCollection.value ? 'create-collection-scope' : 'create-tag-scope',
);
const hintParams = computed(() =>
  isCollection.value
    ? { collection: props.tagName }
    : { tag: props.tagName },
);

const SCOPE_ID =
  props.entity === 'collection' ? 'merchCreateCollection' : 'mediaUploaderCreateTag';
const {
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);
const scopeConfig = fieldConfig('tagScope');
const scopeState = ref('personal');
const scope = computed({
  get: () => scopeState.value,
  set: (val) => {
    scopeState.value = val;
    changeField(scopeConfig, val);
  },
});
const panelRef = ref(null);
let outsideClickTimer = null;

/** Fixed box matching the visible slide-in / popup panel (not tall scroll content). */
const overlayStyle = ref({
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100dvh',
  zIndex: '10050',
});

const personalOption = computed(() => [
  { value: 'personal', label: t(`${i18nPrefix.value}.personalLabel`) },
]);

const globalOption = computed(() => [
  { value: 'global', label: t(`${i18nPrefix.value}.globalLabel`) },
]);

const isPersonal = computed(() => scope.value === 'personal');

function resolveAnchorEl() {
  const content =
    document.querySelector('[data-upload-media-popup]') ||
    document.querySelector('[data-merch-listing-popup]');
  if (!content) return null;
  // BasePopup panel is the visible scrollport; content can be taller than the viewport.
  return content.closest('[role="dialog"]') || content;
}

function syncOverlayBox() {
  const anchor = resolveAnchorEl();
  if (!anchor) {
    overlayStyle.value = {
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
  overlayStyle.value = {
    top: `${Math.round(rect.top)}px`,
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    zIndex,
  };
}

function bindOverlayListeners() {
  window.addEventListener('resize', syncOverlayBox);
  window.addEventListener('scroll', syncOverlayBox, true);
}

function unbindOverlayListeners() {
  window.removeEventListener('resize', syncOverlayBox);
  window.removeEventListener('scroll', syncOverlayBox, true);
}

function clearOutsideClickTimer() {
  if (outsideClickTimer != null) {
    clearTimeout(outsideClickTimer);
    outsideClickTimer = null;
  }
}

onMounted(() => {
  registerField(scopeConfig, scopeState.value);
});

watch(
  () => props.modelValue,
  async (open) => {
    clearOutsideClickTimer();
    if (open) {
      scope.value = 'personal';
      await nextTick();
      syncOverlayBox();
      // Second frame: layout/scrollport settled after dropdown close.
      requestAnimationFrame(() => {
        syncOverlayBox();
      });
      bindOverlayListeners();
      window.addEventListener('keydown', onEscape);
      // Skip the opening click so the popup is not instantly dismissed.
      outsideClickTimer = setTimeout(() => {
        outsideClickTimer = null;
        window.addEventListener('mousedown', onOutsideClick);
      }, 0);
    } else {
      unbindOverlayListeners();
      window.removeEventListener('keydown', onEscape);
      window.removeEventListener('mousedown', onOutsideClick);
    }
  },
);

onUnmounted(() => {
  clearOutsideClickTimer();
  unbindOverlayListeners();
  window.removeEventListener('keydown', onEscape);
  window.removeEventListener('mousedown', onOutsideClick);
});

onBeforeUnmount(() => {
  clearInteractions();
});

function onEscape(event) {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  close();
}

function onOutsideClick(event) {
  // Only dismiss this create dialog — never the parent BasePopup.
  if (panelRef.value && !panelRef.value.contains(event.target)) {
    event.stopPropagation();
    close();
  }
}

function close() {
  emit('update:modelValue', false);
}

function confirm() {
  emit('created', {
    name: props.tagName,
    status: isPersonal.value ? 'personal' : 'pending',
  });
  close();
}
</script>
