<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  cover: { type: String, required: true },
  thumbnails: { type: Array, required: true },
  handle: { type: String, required: true },
  title: { type: String, required: true },
  updated: { type: String, required: true },
  followers: { type: String, required: true },
  likes: { type: String, required: true },
  subscribers: { type: String, required: true },
  videoCount: { type: [String, Number], required: true },
  imageCount: { type: [String, Number], required: true },
  galleryCount: { type: [String, Number], required: true },
  audioCount: { type: [String, Number], required: true },
  bio: { type: String, required: true },
});

const emit = defineEmits(['unsubscribe', 'history']);
const { t } = useI18n();
const cardRoot = ref(null);
const menuOpen = ref(false);

const menuItems = [
  { key: 'managePlans', icon: '/dev/cdn/fan-subscription/menu-plans.svg' },
  { key: 'membershipHistory', icon: '/dev/cdn/fan-subscription/menu-history.svg' },
  { key: 'share', icon: '/dev/cdn/fan-subscription/menu-share.svg' },
  { key: 'report', icon: '/dev/cdn/fan-subscription/menu-report.svg' },
];

function toggleMenu(event) {
  event.stopPropagation();
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

function onUnsubscribe() {
  closeMenu();
  emit('unsubscribe');
}

function onMenuItem(key) {
  closeMenu();
  if (key === 'membershipHistory') emit('history');
}

function onDocumentClick(event) {
  if (!cardRoot.value?.contains(event.target)) closeMenu();
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu();
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});

const dotIcon = '/dev/cdn/fan-subscription/icon-dot.svg';
const moreIcon = '/dev/cdn/fan-subscription/icon-more.svg';
const videoIcon = '/dev/cdn/fan-subscription/icon-video.svg';
const imageIcon = '/dev/cdn/fan-subscription/icon-image.svg';
const galleryIcon = '/dev/cdn/fan-subscription/icon-gallery.svg';
const audioIcon = '/dev/cdn/fan-subscription/icon-audio.svg';
</script>

<template>
  <article ref="cardRoot" class="relative flex h-[486px] w-full flex-col overflow-hidden">
    <img
      :src="cover"
      :alt="title"
      class="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
    <div class="relative z-[1] mb-[-62px] min-h-px w-full flex-[1_0_0]">
      <button
        type="button"
        class="absolute right-2 top-2"
        :aria-label="t('fanSubscription.card.more')"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        @click="toggleMenu"
      >
        <img :src="moreIcon" alt="" />
      </button>
      <div class="absolute left-2 top-2 flex items-center gap-1">
        <img :src="dotIcon" alt="" />
        <p class="whitespace-nowrap text-center text-[12px] font-normal leading-[18px] text-white">
          {{ updated }}
        </p>
      </div>
    </div>

    <div
      class="relative z-[1] flex min-h-px w-full flex-[1_0_0] flex-col justify-end gap-2 bg-[#000000B2] px-2 pb-2 backdrop-blur-[50px] [clip-path:polygon(0_0,100%_62px,100%_100%,0_100%)]"
    >
        <div class="flex w-full min-w-0 flex-col gap-1 drop-shadow-[0px_0px_7.5px_rgba(0,0,0,0.4)]">
          <p
            class="whitespace-nowrap text-[12px] font-medium leading-[18px] text-white [text-shadow:0px_8px_8px_rgba(16,24,40,0.03),0px_20px_24px_rgba(16,24,40,0.08)]"
          >
            {{ handle }}
          </p>
          <p class="w-full truncate text-[24px] font-semibold leading-8 text-white">
            {{ title }}
          </p>
          <div class="flex w-full items-start justify-between whitespace-nowrap text-[#07F468]">
            <div class="flex items-center gap-1">
              <span class="text-[12px] font-normal leading-[18px]">{{ t('fanSubscription.card.followers') }}</span>
              <span class="text-[14px] font-normal leading-5">{{ followers }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] font-normal leading-[18px]">{{ t('fanSubscription.card.likes') }}</span>
              <span class="text-[14px] font-normal leading-5">{{ likes }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[12px] font-normal leading-[18px]">{{ t('fanSubscription.card.subscribers') }}</span>
              <span class="text-[14px] font-normal leading-5">{{ subscribers }}</span>
            </div>
          </div>
          <div class="flex w-full items-center gap-4 py-1">
            <div class="flex items-center gap-1">
              <img :src="videoIcon" :alt="t('fanSubscription.card.videos')" />
              <span class="text-[12px] font-normal tracking-[0.06px] text-[#EAECF0]">{{ videoCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <img :src="imageIcon" :alt="t('fanSubscription.card.photos')" />
              <span class="text-[12px] font-normal tracking-[0.06px] text-[#EAECF0]">{{ imageCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <img :src="galleryIcon" :alt="t('fanSubscription.card.gallery')" />
              <span class="text-[12px] font-normal tracking-[0.06px] text-[#EAECF0]">{{ galleryCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <img :src="audioIcon" :alt="t('fanSubscription.card.audio')" />
              <span class="text-[12px] font-normal tracking-[0.06px] text-[#EAECF0]">{{ audioCount }}</span>
            </div>
          </div>
          <p class="line-clamp-2 w-full text-[14px] font-normal leading-5 text-[#D0D5DD]">
            {{ bio }}
          </p>
        </div>

        <div class="flex w-full items-center gap-0.5 overflow-hidden">
          <div
            v-for="(thumb, index) in thumbnails"
            :key="index"
            class="relative h-[68px] min-w-0 flex-1 overflow-hidden bg-white"
          >
            <img
              :src="thumb.src"
              alt=""
              class="absolute max-w-none"
              :class="thumb.style ? '' : 'inset-0 h-full w-full object-cover'"
              :style="thumb.style"
            />
          </div>
        </div>
    </div>

    <div
      v-if="menuOpen"
      role="menu"
      class="absolute right-2 top-10 z-20 w-[240px] overflow-hidden rounded-[10px] bg-[rgba(255,255,255,0.9)] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] backdrop-blur-[50px]"
    >
      <div class="flex flex-col py-1">
        <button
          v-for="item in menuItems"
          :key="item.key"
          type="button"
          role="menuitem"
          class="flex h-14 items-center px-1.5 py-px"
          @click="onMenuItem(item.key)"
        >
          <span class="flex w-[228px] items-center gap-6 rounded-md px-2.5 py-[9px]">
            <img :src="item.icon" alt="" />
            <span class="text-[14px] font-medium leading-5 text-[#0C111D]">
              {{ t(`fanSubscription.card.${item.key}`) }}
            </span>
          </span>
        </button>
      </div>
      <button
        type="button"
        role="menuitem"
        class="flex h-14 w-full items-center border-t border-[#EAECF0] px-1.5 py-px"
        @click="onUnsubscribe"
      >
        <span class="flex w-[228px] items-center gap-6 rounded-md px-2.5 py-[9px]">
          <img src="/dev/cdn/fan-subscription/menu-unsubscribe.svg" alt="" />
          <span class="text-[14px] font-medium leading-5 text-[#FF4405]">
            {{ t('fanSubscription.card.unsubscribe') }}
          </span>
        </span>
      </button>
    </div>
  </article>
</template>
