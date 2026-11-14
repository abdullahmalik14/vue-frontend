<template>
  <div data-component="media-table-row-actions" class="flex items-center">
    <div class="flex justify-center items-center px-3 py-2">
      <button
        type="button"
        class="group flex justify-center items-center cursor-pointer p-1 rounded-[5px] hover:bg-blue-600/20 focus:bg-blue-600/20 focus-visible:bg-blue-600/20"
        :aria-label="t('mediaCard.menu.editDetails')"
        @click="handleMenuSelect('edit')"
      >
        <span
          v-if="editIconUrl && isMerchTheme"
          aria-hidden="true"
          class="inline-block !h-3 !w-3 shrink-0 bg-[#344054] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] group-hover:!bg-blue-600 group-focus:!bg-blue-600"
          :style="{
            WebkitMaskImage: `url(${editIconUrl})`,
            maskImage: `url(${editIconUrl})`,
          }"
        />
        <img
          v-else-if="editIconUrl"
          :src="editIconUrl"
          alt=""
          class="!h-3 !w-3 !max-w-none shrink-0 object-contain"
          :class="iconToneClass"
        />
      </button>
    </div>

    <div class="relative flex justify-center items-center px-3 py-2">
      <div
        ref="menuAnchor"
        tabindex="0"
        class="group flex justify-center items-center cursor-pointer p-1 rounded-[5px] hover:bg-blue-600/20 focus:bg-blue-600/20 focus-visible:bg-blue-600/20"
        :class="menuOpen ? 'bg-blue-600/20' : ''"
        @click="onMenuTriggerClick"
      >
        <span
          v-if="menuDotsUrl"
          aria-hidden="true"
          class="inline-block h-4 w-4 bg-current [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] group-hover:!bg-blue-600 group-focus:!bg-blue-600"
          :class="[isMerchTheme ? 'text-black' : 'text-black dark:text-white', menuOpen ? '!bg-blue-600' : '']"
          :style="{
            WebkitMaskImage: `url(${menuDotsUrl})`,
            maskImage: `url(${menuDotsUrl})`,
          }"
        />
      </div>

      <DropdownMenu
        v-if="menuAnchor && !isMobileViewport"
        ref="menuDropdownRef"
        :anchor="menuAnchor"
        :config="menuDropdownConfig"
      >
        <div class="flex flex-col justify-center">
          <button
            v-for="option in menuOptions"
            :key="option.value"
            type="button"
            class="flex w-full items-center gap-2 hover:bg-white/50 px-2 py-3 text-left"
            :class="{ 'border-t border-dee5ec': option.divider }"
            @click="handleMenuSelect(option.value)"
          >
            <CloudArrowUpIcon
              v-if="option.value === 'publish'"
              class="w-4 h-4 shrink-0 text-text-primary"
            />
            <img
              v-else
              :src="option.icon"
              alt=""
              class="w-4 h-4 shrink-0 object-contain"
              :class="optionIconClass(option)"
            />
            <span
              class="text-xs font-medium whitespace-nowrap"
              :class="option.danger ? 'text-error' : 'text-text-primary'"
            >
              {{ option.label }}
            </span>
          </button>
        </div>
      </DropdownMenu>

      <BasePopup
        v-if="isMobileViewport"
        :modelValue="mobileMenuOpen"
        :popup-config="mobileMenuPopupConfig"
        @update:modelValue="onMobileMenuOpenChange"
      >
        <div
          class="flex w-full flex-col overflow-hidden rounded-t-[0.625rem] bg-white shadow-[0px_-8px_24px_#10182824]"
        >
          <button
            v-for="option in menuOptions"
            :key="`mobile-${option.value}`"
            type="button"
            class="flex h-[4.25rem] w-full items-center gap-3 px-4 text-left hover:bg-border-tab"
            :class="{ 'border-t border-dee5ec': option.divider }"
            @click="handleMenuSelect(option.value)"
          >
            <CloudArrowUpIcon
              v-if="option.value === 'publish'"
              class="w-6 h-6 shrink-0 text-text-primary"
            />
            <img
              v-else
              :src="option.icon"
              alt=""
              class="w-6 h-6 shrink-0 object-contain"
              :class="optionIconClass(option)"
            />
            <span
              class="text-base font-medium break-words"
              :class="option.danger ? 'text-error' : 'text-text-primary'"
            >
              {{ option.label }}
            </span>
          </button>
        </div>
      </BasePopup>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CloudArrowUpIcon } from '@heroicons/vue/24/outline';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import DropdownMenu from '@/components/ui/dropdowns/DropdownMenu.vue';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import breakpoints from '@/composables/breakpoints.js';

const props = defineProps({
  status: {
    type: String,
    default: 'draft',
  },
  /** media (default) | merch — merch uses black icons + provided edit asset */
  theme: {
    type: String,
    default: 'media',
  },
});

const emit = defineEmits(['menu-action']);

const { t } = useI18n();
const menuAnchor = ref(null);
const menuDropdownRef = ref(null);
const mobileMenuOpen = ref(false);
const menuOpen = ref(false);
const isMobileViewport = computed(() => breakpoints.state.mobile);
const isMerchTheme = computed(() => props.theme === 'merch');

const { url: mediaEditIconUrl } = useAssetUrl('icon.media.menu.edit');
const { url: merchEditIconUrl } = useAssetUrl('shops.merch.icon.edit');
const { url: menuDotsUrl } = useAssetUrl('icon.media.threeDotsVertical');
const { url: shareIconUrl } = useAssetUrl('icon.media.menu.share');
const { url: unpublishIconUrl } = useAssetUrl('icon.media.menu.unpublish');
const { url: deleteIconUrl } = useAssetUrl('icon.media.menu.delete');

const editIconUrl = computed(() =>
  isMerchTheme.value ? merchEditIconUrl.value : mediaEditIconUrl.value,
);

const iconToneClass = computed(() =>
  isMerchTheme.value
    ? '[filter:brightness(0)]'
    : 'dark:[filter:brightness(0)_saturate(100%)_invert(100%)]',
);

const isPublished = computed(() => props.status === 'published');

const dangerIconClass =
  '[filter:brightness(0)_saturate(100%)_invert(32%)_sepia(98%)_saturate(2000%)_hue-rotate(2deg)]';

function optionIconClass(option) {
  if (option.danger) return dangerIconClass;
  if (isMerchTheme.value) return '[filter:brightness(0)]';
  return '';
}

const menuDropdownConfig = computed(() => ({
  trigger: 'click',
  align: 'right',
  width: isMerchTheme.value ? 160 : 130,
  zIndexBase: 10100,
  closeOnOutsideClick: true,
  style: {
    class: 'rounded-[0.625rem] bg-mediaUi-whiteB2 overflow-hidden shadow-lg backdrop-blur-[12px]',
  },
}));

const isReviewing = computed(() => props.status === 'reviewing');

const menuOptions = computed(() => {
  if (isMerchTheme.value) {
    const options = [
      {
        label: t('shops.merch.library.menu.edit'),
        value: 'edit',
        icon: editIconUrl.value,
      },
    ];
    // Reviewing only — draft keeps Publish CTA → edit → submit for approval flow
    if (isReviewing.value) {
      options.push({
        label: t('shops.merch.library.menu.publish'),
        value: 'publish',
        divider: true,
      });
    }
    options.push({
      label: t('shops.merch.library.menu.deleteMerch'),
      value: 'delete',
      icon: deleteIconUrl.value,
      danger: true,
      divider: true,
    });
    return options;
  }

  return [
    { label: t('mediaCard.menu.share'), value: 'share', icon: shareIconUrl.value },
    isPublished.value
      ? {
          label: t('mediaCard.menu.unpublish'),
          value: 'unpublish',
          icon: unpublishIconUrl.value,
          danger: true,
          divider: true,
        }
      : {
          label: t('mediaCard.menu.publish'),
          value: 'publish',
          divider: true,
        },
    {
      label: t('mediaCard.menu.deleteMedia'),
      value: 'delete',
      icon: deleteIconUrl.value,
      danger: true,
    },
  ];
});

const mobileMenuPopupConfig = {
  actionType: 'slideIn',
  from: 'bottom',
  position: 'center',
  offset: '0px',
  speed: '300ms',
  effect: 'ease-in-out',
  closeSpeed: '300ms',
  closeEffect: 'ease-in-out',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldCloseOnEscape: true,
  shouldLockBodyScroll: true,
  zIndex: 20000,
  forceZIndex: 20000,
  width: '100%',
  height: 'auto',
  scrollable: false,
};

function syncMenuOpenFromDropdown() {
  const open = typeof menuDropdownRef.value?.isOpen === 'function'
    ? menuDropdownRef.value.isOpen()
    : false;
  menuOpen.value = !!open;
}

function onMenuTriggerClick() {
  if (!isMobileViewport.value) {
    requestAnimationFrame(syncMenuOpenFromDropdown);
    setTimeout(syncMenuOpenFromDropdown, 0);
    return;
  }
  mobileMenuOpen.value = true;
  menuOpen.value = true;
}

function onMobileMenuOpenChange(open) {
  mobileMenuOpen.value = open;
  menuOpen.value = open;
}

function handleMenuSelect(action) {
  emit('menu-action', action);
  menuDropdownRef.value?.close();
  mobileMenuOpen.value = false;
  menuOpen.value = false;
}

function onDocumentPointerDown() {
  if (isMobileViewport.value) return;
  // After outside-close, DropdownMenu clears; sync chip off on next tick
  setTimeout(syncMenuOpenFromDropdown, 0);
}

watch(isMobileViewport, (mobile) => {
  if (mobile) {
    menuDropdownRef.value?.close();
    menuOpen.value = false;
    return;
  }
  mobileMenuOpen.value = false;
  menuOpen.value = false;
});

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
});
</script>
