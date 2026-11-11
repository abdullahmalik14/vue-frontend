<template>
  <!-- Nested over SubscriptionTierPopup slide-in: shared BasePopup overlay stays under the slide-in. -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[21999] bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
      @click.stop
    />
  </Teleport>

  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="imageCropConfig"
  >
    
      <div
        class="relative flex h-full flex-col backdrop-blur-[50px] bg-white/70 dark:bg-background-dark-app [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
        :class="
          confirmMode === 'upload'
            ? 'overflow-visible'
            : 'overflow-y-auto'
        "
      >
        <div class="flex justify-between items-center p-4">
          <h1
            class="text-xl leading-normal font-semibold opacity-70 text-[#344054] dark:text-text"
          >
            {{ t('editProfile.page.crop.title') }}
          </h1>
          <img
            @click="handleCancel"
            :src="assets.closeBtn"
            :alt="t('editProfile.page.alt.close')"
            class="w-6 h-6
            dark:[filter:brightness(0)_invert(100%)]
             [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(24%)_saturate(201%)_hue-rotate(179deg)_brightness(94%)_contrast(83%)] cursor-pointer"
          />
        </div>

        <div
          class="relative flex items-center justify-center w-full aspect-[22/19] overflow-hidden sm:aspect-[90/61]"
        >
          <img
            :src="resolvedImageSrc"
            class="w-full h-full object-cover blur-[5px] brightness-50 scale-110 pointer-events-none "
          />
          <div
            :style="cropperStyle"
            class="absolute w-[12.1875rem] aspect-square rounded-full border-[3px] border-white bg-white overflow-hidden bg-center bg-no-repeat dark:bg-[#181a1b] dark:border-[#303436] transition-all duration-200 ease-out"
          ></div>
        </div>

        <div
          class="flex flex-col gap-4 px-4 py-6"
          :class="confirmMode === 'upload' ? 'pb-16' : ''"
        >
          <div class="flex justify-center items-center gap-9">
            <img
              @click="flipHorizontal = !flipHorizontal"
              :src="assets.reflect"
              :alt="t('editProfile.page.alt.reflectHorizontal')"
              class="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity dark:[filter:brightness(0)_invert(100%)]"
              :class="{
                'opacity-50': !flipHorizontal,
                'opacity-100': flipHorizontal,
              }"
            />
            <img
              @click="flipVertical = !flipVertical"
              :src="assets.reflect"
              :alt="t('editProfile.page.alt.reflectVertical')"
              class="w-6 h-6 cursor-pointer rotate-90 hover:opacity-80 transition-opacity dark:[filter:brightness(0)_invert(100%)]"
              :class="{
                'opacity-50': !flipVertical,
                'opacity-100': flipVertical,
              }"
            />
          </div>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <h3
                class="text-xs leading-normal font-medium text-[#0C111D] dark:text-text"
              >
                {{ t('editProfile.page.crop.zoom') }}
              </h3>
              <div class="flex justify-between items-center gap-4">
                <img
                  @click="adjustZoom(-5)"
                  :src="assets.zoomOut"
                  :alt="t('editProfile.page.alt.zoomOut')"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
                <div class="w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="zoomValue"
                    :style="{ '--p': zoomPercentage + '%' }"
                    class="w-full h-2 rounded-full appearance-none outline-none cursor-pointer bg-[linear-gradient(to_right,#07F468_0%,#07F468_var(--p),#EAECF0_var(--p),#EAECF0_100%)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-[#181a1b] [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_1px_#DEE5EC,0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
                  />
                </div>
                <img
                  @click="adjustZoom(5)"
                  :src="assets.zoomIn"
                  :alt="t('editProfile.page.alt.zoomIn')"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <h3
                class="text-xs leading-normal font-medium text-[#0C111D] dark:text-text"
              >
                {{ t('editProfile.page.crop.rotate') }}
              </h3>
              <div class="flex justify-between items-center gap-4">
                <img
                  @click="adjustRotate(-5)"
                  :src="assets.refresh"
                  :alt="t('editProfile.page.alt.rotate')"
                  class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
                <div class="w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="rotateValue"
                    :style="{ '--p': rotatePercentage + '%' }"
                    class="w-full h-2 rounded-full appearance-none outline-none cursor-pointer bg-[linear-gradient(to_right,#EAECF0_0%,#EAECF0_var(--p),#EAECF0_var(--p),#EAECF0_100%)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-[#181a1b] [&::-webkit-slider-thumb]:shadow-[inset_0_0_0_1px_#DEE5EC,0px_2px_4px_-2px_rgba(16,24,40,0.06),0px_4px_8px_-2px_rgba(16,24,40,0.10)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
                  />
                </div>
                <img
                  @click="adjustRotate(5)"
                  :src="assets.refresh"
                  :alt="t('editProfile.page.alt.rotate')"
                  class="w-5 h-5 cursor-pointer scale-x-[-1] hover:scale-x-[-1] hover:scale-y-[1.1] transition-transform dark:[filter:brightness(0)_invert(100%)]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Plan detail: UPLOAD flush bottom-right. Edit profile: Cancel + Save. -->
        <div
          v-if="confirmMode === 'upload'"
          class="absolute bottom-0 right-0 z-[1] [filter:drop-shadow(4px_4px_0_#000000)]"
        >
          <DashboardPrimaryButton
            :text="t('editProfile.page.crop.upload')"
            variant="polygonLeft"
            :rightIcon="arrowRightUrl"
            rightIconClass="w-5 h-5 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]"
            textClass="text-lg font-medium uppercase text-inherit"
            customClass="!min-w-0"
            type="button"
            @click="confirmUpload"
          />
        </div>
        <div v-else class="flex justify-between items-center gap-4 p-4">
          <button
            @click="handleCancel"
            class="w-full h-10 flex justify-center items-center px-2 py-1 cursor-pointer hover:bg-gray-200 rounded transition-colors"
          >
            <span class="text-lg font-medium text-[#0C111D] dark:text-text">
              {{ t('editProfile.page.crop.cancel') }}
            </span>
          </button>

          <button
            @click="saveChanges"
            class="w-full h-10 flex justify-center items-center bg-black px-2 py-1 group/button cursor-pointer hover:bg-[#07F468] rounded transition-colors"
          >
            <span class="text-lg font-medium text-[#07F468] group-hover/button:text-black">
              {{ t('editProfile.page.crop.save') }}
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
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { useEditProfileAssets } from '@/dev/composables/useEditProfileAssets.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { assets } = useEditProfileAssets();
const { url: arrowRightUrl } = useAssetUrl('icon.arrow.right');

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
  modelValue: { type: Boolean, default: false },
  /**
   * `save` — Cancel + Save (edit profile).
   * `upload` — green polygon UPLOAD (plan detail background).
   */
  confirmMode: {
    type: String,
    default: 'save',
    validator: (v) => ['save', 'upload'].includes(v),
  },
});

const resolvedImageSrc = computed(() => props.imageSrc || assets.value.featuredMediaBg);

const emit = defineEmits(['update:modelValue', 'save', 'upload', 'cancel']);

const zoomValue = ref(25);
const rotateValue = ref(50);
const flipHorizontal = ref(false);
const flipVertical = ref(false);

const zoomPercentage = computed(() => (zoomValue.value / 100) * 100);
const rotatePercentage = computed(() => (rotateValue.value / 100) * 100);

const calculatedZoom = computed(() => {
  const minZoom = 100;
  const maxZoom = 500;
  const range = maxZoom - minZoom;
  return minZoom + range * (zoomValue.value / 100);
});

const calculatedRotation = computed(() => (rotateValue.value - 50) * 3.6);

const cropperStyle = computed(() => {
  return {
    backgroundImage: `url('${resolvedImageSrc.value}')`,
    backgroundSize: `${calculatedZoom.value}%`,
    transform: `rotate(${calculatedRotation.value}deg) scaleX(${
      flipHorizontal.value ? -1 : 1
    }) scaleY(${flipVertical.value ? -1 : 1})`,
  };
});

const adjustZoom = (amount) => {
  let newValue = zoomValue.value + amount;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;
  zoomValue.value = newValue;
};

const adjustRotate = (amount) => {
  let newValue = rotateValue.value + amount;
  if (newValue < 0) newValue = 0;
  if (newValue > 100) newValue = 100;
  rotateValue.value = newValue;
};

const handleCancel = () => {
  emit('cancel');
  // Plan upload flow closes via v-model; edit-profile may keep open for confirm dialog.
  if (props.confirmMode === 'upload') {
    closeModal();
  }
};

// CHANGE 2: Helper function to close modal
const closeModal = () => {
  emit("update:modelValue", false);
};

function buildCropPayload() {
  return {
    zoom: zoomValue.value,
    rotate: calculatedRotation.value,
    flipH: flipHorizontal.value,
    flipV: flipVertical.value,
    imageSrc: resolvedImageSrc.value,
  };
}

const saveChanges = () => {
  emit('save', buildCropPayload());
  closeModal();
};

const confirmUpload = () => {
  emit('upload', buildCropPayload());
  closeModal();
};

const imageCropConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'scale',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  // Overlay via Teleport above — slide-in sits above shared BasePopup overlay.
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: false,
  forceZIndex: 22000,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '360px', '<768': '100%' },
  height: { default: '90%', '<768': '100%' },
  scrollable: true,
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
</script>
