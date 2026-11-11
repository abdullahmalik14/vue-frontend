<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="avatarPopupConfig"
  >
    <div class="flex flex-col backdrop-blur-[50px] bg-white/70 dark:bg-background-dark-app  md:rounded-[0.3125rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full">
      <div class="flex justify-between items-center p-4">
        <h1 class="text-xl leading-normal font-semibold opacity-70 text-[#344054] dark:text-text">
          {{ t('editProfile.page.avatarPopup.title') }}
        </h1>
        <img
          @click="handleCancel"
          :src="assets.closeBtn"
          :alt="t('editProfile.page.alt.close')"
          class="w-6 h-6 cursor-pointer hover:opacity-80 dark:[filter:brightness(0)_invert(100%)]"
        />
      </div>

      <div class="flex justify-center items-center w-full h-[14.375rem] sm:mt-[-1.1rem]">
        <div
          class="w-[12.1875rem] aspect-square rounded-full relative transition-colors duration-300"
          :style="{ backgroundColor: currentBgColor }"
        >
          <img
            :src="currentAvatarSrc"
            :alt="t('editProfile.page.alt.selectedAvatar')"
            class="w-full h-full object-cover rounded-full"
          />
          <button
            type="button"
            class="absolute bottom-0 right-0 w-12 h-12 flex justify-center items-center rounded-full bg-[#07F468] group/button hover:bg-black"
          >
            <img
              :src="assets.upload"
              :alt="t('editProfile.page.alt.upload')"
              class="w-8 h-8 group-hover/button:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(43%)_saturate(4479%)_hue-rotate(92deg)_brightness(109%)_contrast(95%)]"
            />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6 pt-1 pb-6 md:gap-4 md:py-6 xl:px-4 xl:gap-6">
        <div class="flex flex-col gap-2 md:py-2 xl:px-4">
          <h3 class="text-base font-medium px-4 text-[#0C111D] dark:text-text xl:px-0">
            {{ t('editProfile.page.avatarPopup.avatar') }}
          </h3>
          <div class="w-full flex overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]">
            <div class="flex justify-center items-center gap-2 w-max md:flex-col xl:w-full">
              <AvatarSelector :avatars="avatarListRow1" v-model="selectedAvatarId" />
              <AvatarSelector :avatars="avatarListRow2" v-model="selectedAvatarId" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 md:py-2">
          <h3 class="text-base font-medium px-4 text-[#0C111D] dark:text-text">
            {{ t('editProfile.page.avatarPopup.background') }}
          </h3>
          <BackgroundSelector :backgrounds="backgroundList" v-model="selectedBgId" />
        </div>
      </div>

      <div class="flex justify-between items-center gap-4 p-4">
        <button
          type="button"
          @click="handleCancel"
          class="w-full h-10 flex justify-center items-center px-2 py-1 cursor-pointer"
        >
          <span class="text-lg font-medium text-[#0C111D] dark:text-text">
            {{ t('editProfile.page.avatarPopup.cancel') }}
          </span>
        </button>
        <button
          type="button"
          @click="saveSelection"
          class="w-full h-10 flex justify-center items-center bg-black dark:bg-background-dark-app px-2 py-1 group/button cursor-pointer hover:bg-[#07F468] dark:hover:bg-[#07F468]"
        >
          <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black">
            {{ t('editProfile.page.avatarPopup.save') }}
          </span>
        </button>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from './BasePopup.vue';
import AvatarSelector from '@/components/ui/profile/AvatarSelector.vue';
import BackgroundSelector from '@/components/ui/profile/BackgroundSelector.vue';
import { useEditProfileAssets } from '@/dev/composables/useEditProfileAssets.js';

defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const { t } = useI18n();
const { assets } = useEditProfileAssets();

const selectedAvatarId = ref(1);
const selectedBgId = ref(106);

const handleCancel = () => {
  emit('cancel');
};

const saveSelection = () => {
  emit('save', {
    src: currentAvatarSrc.value,
    bgColor: currentBgColor.value,
  });
  emit('update:modelValue', false);
};

const avatarListRow1 = computed(() => {
  const presets = [
    assets.value.avatar1,
    assets.value.avatar2,
    assets.value.avatar3,
    assets.value.avatar4,
    assets.value.avatar5,
  ];
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: presets[i % 5],
    alt: `avatar-${(i % 5) + 1}`,
  }));
});

const avatarListRow2 = computed(() => {
  const presets = [
    assets.value.avatar1,
    assets.value.avatar2,
    assets.value.avatar3,
    assets.value.avatar4,
    assets.value.avatar5,
  ];
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 11,
    src: presets[i % 5],
    alt: `avatar-${i + 11}`,
  }));
});

const backgroundList = [
  { id: 101, color: '#F72485' },
  { id: 102, color: '#680EEB' },
  { id: 103, color: '#3A0BA3' },
  { id: 104, color: '#4361EE' },
  { id: 105, color: '#55AACF' },
  { id: 106, color: '#55CFCD' },
  { id: 107, color: '#4CC9F0' },
  { id: 108, color: '#8569FA' },
  { id: 109, color: '#AE4AEF' },
  { id: 110, color: '#FF76DD' },
  { id: 111, color: '#89FAD3' },
  { id: 112, color: '#78F0F5' },
];

const allAvatars = computed(() => [...avatarListRow1.value, ...avatarListRow2.value]);

const currentAvatarSrc = computed(() => {
  const found = allAvatars.value.find((a) => a.id === selectedAvatarId.value);
  return found ? found.src : allAvatars.value[0]?.src || '';
});

const currentBgColor = computed(() => {
  const found = backgroundList.find((b) => b.id === selectedBgId.value);
  return found ? found.color : '#FFFFFF';
});

const avatarPopupConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'scale',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  showOverlay: false,
  closeOnOutside: false,
  lockScroll: false,
  escToClose: true,
  width: { default: '90%', '<768': '100%' },
  height: { default: '90%', '<768': '100%' },
  scrollable: true,
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
</script>
