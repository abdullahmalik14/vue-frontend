<script setup>
/**
 * Media count row used by TierCard.
 * Icons match Figma / SubscriptionCard: play-square, image, stacked gallery.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
  /** Empty / muted styling (same as TierCard emptyState). */
  muted: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const { url: videoIconUrl } = useAssetUrl('icon.subscriptionCard.videos');
const { url: imageIconUrl } = useAssetUrl('icon.subscriptionCard.photos');
const { url: galleryIconUrl } = useAssetUrl('icon.subscriptionCard.media');

const items = computed(() => [
  {
    count: props.stats?.video ?? '—',
    icon: videoIconUrl.value,
    alt: t('subscriptionCard.icons.videos'),
  },
  {
    count: props.stats?.image ?? '—',
    icon: imageIconUrl.value,
    alt: t('subscriptionCard.icons.photos'),
  },
  {
    count: props.stats?.media ?? props.stats?.audio ?? '—',
    icon: galleryIconUrl.value,
    alt: t('subscriptionCard.icons.media'),
  },
]);
</script>

<template>
  <div class="flex items-center gap-2.5 drop-shadow-[0px_2px_12px_#000000BF]">
    <template v-for="(item, index) in items" :key="item.alt">
      <div
        v-if="index > 0"
        class="h-[0.188rem] w-[0.188rem] block rounded-full"
        :class="muted ? 'bg-[#98A2B3]' : 'bg-white'"
      />
      <div class="flex items-center gap-[0.0625rem]">
        <span
          class="text-[16px] font-regular leading-normal"
          :class="muted ? 'text-[#98A2B3]' : 'text-white dark:text-[#e8e6e3]'"
        >{{ item.count }}</span>
        <img
          :src="item.icon"
          :alt="item.alt"
          class="w-[13.6px] h-[13.6px]"
          :class="muted ? 'opacity-50' : '[filter:brightness(100%)]'"
        />
      </div>
    </template>
  </div>
</template>
