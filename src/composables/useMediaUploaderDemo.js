import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderAssets } from '@/composables/useMediaUploaderAssets.js';
import { buildMediaUploaderCatalog } from '@/services/media/mediaUploaderCatalogBuilder.js';

/** Demo/sandbox helper — live media page seeds the Pinia store instead. */
export function useMediaUploaderDemo() {
  const { t } = useI18n();
  const { assets } = useMediaUploaderAssets();

  const catalog = computed(() => buildMediaUploaderCatalog({ t, assets: assets.value }));

  const thumbnailSelectorImages = computed(() => {
    const { slideImage, thumbA, thumbB } = assets.value;
    return [
      slideImage,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbA,
      thumbB,
      thumbB,
      thumbB,
      thumbB,
    ].filter(Boolean);
  });

  const historyTags = computed(() => catalog.value.tagHistory);
  const tagsList = computed(() => catalog.value.tagCatalog);
  const performersList = computed(() => catalog.value.performerCatalog);

  const planSharingPerformersList = computed(() => ([
    { id: 1, name: t('demo.mediaUploaderComponents.planSharing.userOne'), username: 'user1' },
    { id: 2, name: t('demo.mediaUploaderComponents.planSharing.userTwo'), username: 'user2' },
  ]));

  return {
    assets,
    thumbnailSelectorImages,
    historyTags,
    tagsList,
    performersList,
    planSharingPerformersList,
  };
}
