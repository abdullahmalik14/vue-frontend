<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MediaStatusBadge from '@/templates/media/media-creator/MediaStatusBadge.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);

const { t } = useI18n();

/** Bottom-left status — preorder shows as Published + PRE-ORDER top badge */
const status = computed(() => {
  if (props.item?.status === 'preorder') return 'published';
  return props.item?.status || 'draft';
});

const promoBadges = computed(() => {
  const item = props.item;
  const badges = [];
  if (item?.subscribersOnly) {
    badges.push({
      key: 'subscriberOnly',
      label: t('shops.merch.library.badges.subscriberOnly'),
      className: 'text-[#07F468]',
    });
  }
  if (item?.status === 'preorder' || item?.openForPreorder) {
    badges.push({
      key: 'preOrder',
      label: t('shops.merch.library.badges.preOrder'),
      className: 'text-[#67E3F9]',
    });
  }
  const original = Number(item?.originalPrice ?? item?.price);
  const discounted = Number(item?.discountedPrice ?? item?.finalPrice);
  if (
    Number.isFinite(original)
    && Number.isFinite(discounted)
    && discounted > 0
    && discounted < original
  ) {
    badges.push({
      key: 'sale',
      label: t('shops.merch.library.badges.sale'),
      className: 'text-[#F093FB]',
    });
  }
  return badges;
});
</script>

<template>
  <button
    type="button"
    class="relative w-80 h-44 max-w-96 min-w-80 overflow-hidden bg-black cursor-pointer text-left"
    @click="$emit('click', item)"
  >
    <img
      v-if="item.thumbnail"
      :src="item.thumbnail"
      alt=""
      class="object-cover w-full h-full"
    />

    <div
      v-if="promoBadges.length"
      class="absolute top-0 right-0 z-[1] flex flex-wrap justify-end gap-[1px]"
    >
      <span
        v-for="badge in promoBadges"
        :key="badge.key"
        class="bg-black px-1 pt-0.5 text-xs font-normal leading-normal"
        :class="badge.className"
      >
        {{ badge.label }}
      </span>
    </div>

    <div class="absolute bottom-0 left-0 z-[1]">
      <MediaStatusBadge
        :status="status"
        status-i18n-prefix="shops.merch.library.status"
      />
    </div>
  </button>
</template>
