<template>
  <MediaCardV1 data-component="my-media-card"
    v-if="variant !== 'table'"
    ref="cardRef"
    :media="cardMedia"
    :subscription-tiers="uploaderStore.availableSubscriptionTiers"
    variant="default"
    @menu-action="(action) => $emit('menu-action', { item, action })"
    @toggle-tier="onToggleTier"
  />

  <div
    v-else
    class="video-container relative cursor-pointer overflow-hidden bg-black w-full h-full"
  >
    <div class="w-full h-full overflow-hidden relative">
      <div class="w-full h-full flex justify-center items-center">
        <video
          v-if="tableShowsVideo"
          ref="tableVideoRef"
          :poster="imagePoster || undefined"
          class="object-cover w-full h-full"
          muted
          loop
          playsinline
          preload="metadata"
          :style="thumbnailBlurStyle"
          @loadedmetadata="onTableVideoLoadedMetadata"
        >
          <source :src="item.videoUrl" type="video/mp4">
        </video>
        <img
          v-else-if="displayPoster"
          :src="displayPoster"
          alt=""
          class="object-cover w-full h-full"
          :style="thumbnailBlurStyle"
        />
      </div>
    </div>

    <div
      class="absolute top-0 left-0 z-[1] flex justify-center items-center gap-[0.188rem] px-1 py-0.5 rounded bg-mediaUi-almostBlackB2 drop-shadow-[0_0_20px_rgba(0,0,0,0.25)]"
    >
      <span class="text-xs text-white leading-normal tracking-[0.008rem]">{{ typeLabel }}</span>
      <img
        v-if="typeIconUrl"
        :src="typeIconUrl"
        alt=""
        class="w-4 h-4"
      />
    </div>

    <div
      v-if="showBlurBadge"
      class="absolute top-0 right-0 z-[1] flex justify-center items-center gap-1 px-1 py-0.5 rounded bg-mediaUi-whiteCC"
    >
      <img
        v-if="blurIconUrl"
        :src="blurIconUrl"
        alt=""
        class="w-4 h-4"
      />
      <span class="text-xs leading-normal font-medium text-darker-text">{{ item.blurThumbnailLevel }}</span>
    </div>

    <div class="flex justify-center items-center bg-black w-8 h-8 absolute bottom-0 left-0">
      <img
        v-if="playIconUrl"
        :src="playIconUrl"
        alt=""
        class="w-5 h-5"
      />
    </div>

    <div
      v-if="item.hasTrailer"
      class="flex justify-center items-center bg-black h-[1.375rem] px-1 absolute bottom-0 right-0"
    >
      <span class="text-xs leading-normal font-semibold text-white">
        {{ t('mediaUploader.library.trailer') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import MediaCardV1 from '@/components/ui/media/media-cards/MediaCardV1.vue';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'grid',
  },
});

const emit = defineEmits(['menu-action', 'last-tier-blocked']);
const cardRef = ref(null);
const tableVideoRef = ref(null);

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { url: videoIconUrl } = useAssetUrl('icon.media.video');
const { url: imageIconUrl } = useAssetUrl('icon.media.image');
const { url: playIconUrl } = useAssetUrl('icon.media.play');
const { url: blurIconUrl } = useAssetUrl('mediaUploader.icon.blur');

const BLUR_PREVIEW_MAP = {
  '20px': '8px',
  '50px': '20px',
  '100px': '40px',
};

function isImagePosterUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('data:')) return false;
  if (url.startsWith('blob:')) return false;
  if (url.startsWith('idb-media://')) return false;
  return true;
}

const typeKey = computed(() => {
  const kind = props.item.mediaKind || props.item.type;
  if (kind === 'singleImage' || props.item.type === 'image') return 'singleImage';
  if (kind === 'imageGallery' || props.item.type === 'gallery') return 'imageGallery';
  if (kind === 'audio') return 'audio';
  return 'video';
});

const typeLabel = computed(() => t(`mediaUploader.library.kind.${typeKey.value}`));

const imagePoster = computed(() => {
  const poster = props.item.poster || '';
  return isImagePosterUrl(poster) ? poster : '';
});

const tableShowsVideo = computed(() => (
  typeKey.value === 'video' && Boolean(props.item.videoUrl)
));

const displayPoster = computed(() => {
  const poster = props.item.poster || '';
  const uploaded = props.item.videoUrl || '';
  const isDemoPoster = /media-uploader-thumb-(slide|a|b)\.webp/i.test(poster);
  if (
    uploaded &&
    (typeKey.value === 'singleImage' || typeKey.value === 'imageGallery') &&
    (!poster || isDemoPoster || !isImagePosterUrl(poster))
  ) {
    return uploaded;
  }
  if (typeKey.value === 'video') return imagePoster.value;
  return isImagePosterUrl(poster) ? poster : (uploaded || poster);
});

function onTableVideoLoadedMetadata() {
  const video = tableVideoRef.value;
  if (!video) return;
  try {
    const duration = Number(video.duration);
    const seekTo = Number.isFinite(duration) && duration > 0
      ? Math.min(0.1, duration * 0.05)
      : 0.1;
    if (video.currentTime !== seekTo) video.currentTime = seekTo;
  } catch {
    /* ignore seek errors before ready */
  }
}

const cardType = computed(() => {
  if (typeKey.value === 'singleImage') return 'image';
  if (typeKey.value === 'imageGallery') return 'gallery';
  if (typeKey.value === 'audio') return 'image';
  return 'video';
});

const cardMedia = computed(() => {
  const item = props.item;
  return {
    ...item,
    type: cardType.value,
    poster: displayPoster.value,
    videoUrl: item.videoUrl || '',
    title: item.title || '',
    description: item.description || '',
    duration: item.duration || '',
    timeAgo: formatTimeAgo(item.date),
    likes: formatCount(item.likes),
    views: formatCount(item.views),
    status: item.status || 'reviewing',
    blurThumbnail: Boolean(item.blurThumbnail),
    blurThumbnailLevel: item.blurThumbnailLevel || '20px',
  };
});

const typeIconUrl = computed(() => {
  if (typeKey.value === 'singleImage' || typeKey.value === 'imageGallery') return imageIconUrl.value;
  return videoIconUrl.value;
});

const showBlurBadge = computed(() => Boolean(props.item.blurThumbnail && props.item.blurThumbnailLevel));

const thumbnailBlurStyle = computed(() => {
  if (!props.item.blurThumbnail) return {};
  const blurValue = BLUR_PREVIEW_MAP[props.item.blurThumbnailLevel] || '8px';
  return {
    filter: `blur(${blurValue})`,
    WebkitFilter: `blur(${blurValue})`,
    transform: 'scale(1.12)',
  };
});

function onToggleTier(plan) {
  const result = uploaderStore.toggleLibraryItemTier(props.item.id, plan);
  if (result?.blocked) {
    cardRef.value?.closeMenu?.();
    emit('last-tier-blocked', result.tierLabel || plan?.label || plan);
  }
}

function formatCount(value) {
  const num = Number(value) || 0;
  if (num >= 1000) {
    const compact = Math.round(num / 100) / 10;
    return `${String(compact).replace(/\.0$/, '')}k`;
  }
  return String(num);
}

function formatTimeAgo(dateStr) {
  const parsed = Date.parse(String(dateStr || ''));
  if (Number.isNaN(parsed)) return dateStr || '';
  const days = Math.max(0, Math.floor((Date.now() - parsed) / 86400000));
  if (days < 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
</script>
