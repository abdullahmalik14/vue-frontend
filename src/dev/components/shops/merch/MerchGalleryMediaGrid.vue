<template>
  <div
    data-component="merch-gallery-media-grid"
    class="w-full"
  >
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <div
        v-for="(item, index) in files"
        :key="item.id"
        draggable="true"
        class="relative w-full aspect-[204/115] overflow-hidden rounded-[2px] bg-primary-bg cursor-grab active:cursor-grabbing select-none"
        :class="dragIndex === index ? 'opacity-60' : ''"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
        <img
          :src="item.objectUrl"
          :alt="item.name"
          class="pointer-events-none block h-full w-full object-cover"
          draggable="false"
        />

        <button
          type="button"
          class="absolute top-0 right-0 z-10 flex h-8 w-8 items-center justify-center bg-error cursor-pointer transition-opacity hover:opacity-80"
          :aria-label="t('shops.merch.listing.gallery.removeImageAlt')"
          @click.stop="emit('remove', item.id)"
          @mousedown.stop
        >
          <img
            v-if="crossIconUrl"
            :src="crossIconUrl"
            :alt="t('shops.merch.listing.gallery.removeImageAlt')"
            class="h-3.5 w-3.5"
          />
        </button>

        <div
          class="pointer-events-none absolute bottom-0 left-0 z-10 flex items-center gap-1 bg-[#18223080] px-1 py-0.5"
        >
          <img
            v-if="imageIconUrl"
            :src="imageIconUrl"
            alt=""
            class="h-4 w-4"
          />
          <span class="text-xs font-medium leading-normal tracking-[0.0075rem] text-white">
            {{ t('shops.merch.listing.gallery.imageLabel') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

defineProps({
  files: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['remove', 'reorder']);
const { t } = useI18n();
const { url: crossIconUrl } = useAssetUrl('mediaUploader.icon.crossWhite');
const { url: imageIconUrl } = useAssetUrl('icon.media.image');

const dragIndex = ref(-1);

function onDragStart(index, event) {
  dragIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onDragOver(index) {
  if (dragIndex.value < 0 || dragIndex.value === index) return;
}

function onDrop(index) {
  const from = dragIndex.value;
  dragIndex.value = -1;
  if (from < 0 || from === index) return;
  emit('reorder', { from, to: index });
}

function onDragEnd() {
  dragIndex.value = -1;
}
</script>
