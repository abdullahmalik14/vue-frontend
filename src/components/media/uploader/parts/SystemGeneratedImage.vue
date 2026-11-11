<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMediaUploaderAssets } from "@/composables/useMediaUploaderAssets.js";

const { t } = useI18n();
const { assets } = useMediaUploaderAssets();

const backgroundStyle = computed(() => ({
  backgroundImage: assets.value.slideImage ? `url('${assets.value.slideImage}')` : undefined,
}));
</script>

<template>
  <div data-component="media-system-generated-image" class="relative w-full">
    <div class="flex overflow-hidden">
      <input
        type="checkbox"
        class="relative appearance-none w-3 h-3 border border-mediaUi-grayMuted rounded-[2px] hidden"
      />
      <div
        class="aspect-[16/9] w-full bg-no-repeat bg-center bg-cover rounded-[2px]"
        :style="backgroundStyle"
      ></div>
    </div>

    <div
      class="bg-black w-8 h-8 absolute bottom-0 left-0 flex justify-center items-center rounded-bl-sm cursor-pointer z-20 transition-all active:scale-95"
    >
      <img
        :src="assets.videoIcon"
        :alt="t('mediaUploader.a11y.video')"
        class="w-4 h-4"
      />
    </div>
  </div>
</template>
