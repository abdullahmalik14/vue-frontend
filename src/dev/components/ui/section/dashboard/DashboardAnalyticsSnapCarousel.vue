<template>
  <div :class="desktopContents && !isCarousel ? 'contents' : 'w-full min-w-0 max-w-full overflow-x-hidden'">
    <div
      ref="trackRef"
      class="w-full min-w-0 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      :class="[
        isCarousel
          ? 'analytics-snap-track flex flex-nowrap gap-0 overflow-x-scroll overflow-y-hidden'
          : desktopContents
            ? 'contents'
            : 'grid gap-4 overflow-visible snap-none',
        isCarousel && heightMode === 'tallest' ? 'analytics-snap-track--tallest items-stretch' : '',
        isCarousel && heightMode !== 'tallest' ? 'items-start' : '',
        isCarousel && heightReady && heightMode !== 'tallest' ? 'motion-safe:transition-[height] motion-safe:duration-200' : '',
        trackClass,
      ]"
      @scroll.passive="onScroll"
      @touchstart.passive="onGestureStart"
      @touchend.passive="onGestureEnd"
      @touchcancel.passive="onGestureEnd"
      @pointerdown.passive="onGestureStart"
      @pointerup.passive="onGestureEnd"
      @pointercancel.passive="onGestureEnd"
    >
      <slot />
    </div>
    <div
      v-if="isCarousel && slides > 1"
      class="flex justify-center items-center gap-1 pt-3 pb-6"
      role="tablist"
    >
      <button
        v-for="index in slides"
        :key="index"
        type="button"
        class="h-2 rounded-full border-0 p-0 transition-[width,background-color] duration-200"
        :class="activeIndex === index - 1 ? 'w-6 bg-[#344054]' : 'w-2 bg-[#D0D5DD]'"
        :aria-label="`Go to slide ${index}`"
        :aria-current="activeIndex === index - 1 ? 'true' : undefined"
        @click="go(index - 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMobileMd } from '@/composables/useMobileMd.js';

const props = defineProps({
  slides: {
    type: Number,
    required: true,
  },
  trackClass: {
    type: String,
    default: '',
  },
  desktopContents: {
    type: Boolean,
    default: false,
  },
  disableDesktopGrid: {
    type: Boolean,
    default: false,
  },
  heightMode: {
    type: String,
    default: 'active',
    validator: (value) => ['active', 'tallest'].includes(value),
  },
});

const { isMobile } = useMobileMd();
const isCarousel = computed(() => isMobile.value || props.disableDesktopGrid);

const trackRef = ref(null);
const activeIndex = ref(0);
const heightReady = ref(false);

let resizeObserver = null;
let gestureActive = false;
let snapping = false;
let snapTimer = null;
let heightTimer = null;

function getSlides() {
  return trackRef.value ? Array.from(trackRef.value.children) : [];
}

function getNearestIndex() {
  const track = trackRef.value;
  if (!track || track.clientWidth <= 0) return 0;
  return Math.min(
    Math.max(Math.round(track.scrollLeft / track.clientWidth), 0),
    Math.max(props.slides - 1, 0),
  );
}

function syncActiveSlideHeight() {
  const track = trackRef.value;
  if (!track) return;

  if (!isCarousel.value || props.heightMode === 'tallest') {
    track.style.height = '';
    heightReady.value = props.heightMode === 'tallest';
    return;
  }

const slides = getSlides();
  if (!slides.length) {
     track.style.height = '';
     return;
   }

  const { paddingTop, paddingBottom } = getComputedStyle(track);
  const paddingY = (parseFloat(paddingTop) || 0) + (parseFloat(paddingBottom) || 0);

  const slide = slides[activeIndex.value];
  if (!slide) {
    track.style.height = '';
    return;
  }

  const isStretching = (el) => {
    const a = getComputedStyle(el).alignSelf;
    return a === 'stretch' || a === 'normal';
  };

  let slideHeight;

  if (!isStretching(slide)) {
    slideHeight = slide.offsetHeight;
  } else {
    // A stretched slide's offsetHeight only echoes the track height,
    // so derive the height from slides with intrinsic (non-stretched)
    // sizing — this is the height the track converges to after
    // visiting them (e.g. the Top Contributors slide).
    const intrinsicHeights = slides
      .filter((s) => !isStretching(s))
      .map((s) => s.offsetHeight)
      .filter((h) => h > 0);

    if (intrinsicHeights.length) {
      slideHeight = Math.max(...intrinsicHeights);
    } else if (track.style.height) {
      slideHeight = parseFloat(track.style.height) - paddingY;
    } else {
      // No intrinsic reference: read the active slide's natural
      // content height by temporarily pinning it to flex-start.
      const prevAlign = slide.style.alignSelf;
      slide.style.alignSelf = 'flex-start';
      slideHeight = slide.offsetHeight;
      slide.style.alignSelf = prevAlign;
    }
  }

  if (!slideHeight) {
    track.style.height = '';
    return;
  }

  const nextHeight = `${slideHeight + paddingY}px`;
  if (track.style.height !== nextHeight) {
    track.style.height = nextHeight;
  }

  if (!heightReady.value) {
    requestAnimationFrame(() => {
      heightReady.value = true;
    });
  }
}

function observeSlides() {
  resizeObserver?.disconnect();
  if (!isCarousel.value || !trackRef.value || typeof ResizeObserver === 'undefined') return;

  resizeObserver = new ResizeObserver(() => {
    if (!gestureActive && !snapping) syncActiveSlideHeight();
  });
  getSlides().forEach((slide) => resizeObserver.observe(slide));
}

function finishSnap() {
  snapping = false;
  syncActiveSlideHeight();
}

function snapToNearest() {
  const track = trackRef.value;
  if (!track || !isCarousel.value || gestureActive) return;

  const index = getNearestIndex();
  const target = index * track.clientWidth;
  activeIndex.value = index;

  if (Math.abs(track.scrollLeft - target) <= 1) {
    finishSnap();
    return;
  }

  snapping = true;
  track.scrollTo({ left: target, behavior: 'smooth' });
  clearTimeout(heightTimer);
  heightTimer = window.setTimeout(finishSnap, 350);
}

function scheduleSnap() {
  if (!isCarousel.value) return;
  clearTimeout(snapTimer);
  snapTimer = window.setTimeout(snapToNearest, 80);
}

function onGestureStart() {
  if (!isCarousel.value) return;
  gestureActive = true;
  snapping = false;
  clearTimeout(snapTimer);
}

function onGestureEnd() {
  if (!isCarousel.value) return;
  gestureActive = false;
  scheduleSnap();
}

function onScroll() {
  const track = trackRef.value;
  if (!track || track.clientWidth <= 0) return;
  activeIndex.value = getNearestIndex();
  if (!gestureActive && !snapping) {
    scheduleSnap();
  }
}

function onScrollEnd() {
  clearTimeout(heightTimer);
  finishSnap();
}

function go(index) {
  const track = trackRef.value;
  if (!track) return;
  activeIndex.value = index;
  syncActiveSlideHeight();
  snapping = true;
  track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  clearTimeout(heightTimer);
  heightTimer = window.setTimeout(finishSnap, 350);
}

function onResize() {
  const track = trackRef.value;
  if (!track || !isCarousel.value) return;
  track.scrollTo({ left: activeIndex.value * track.clientWidth, behavior: 'auto' });
  syncActiveSlideHeight();
}

watch([isCarousel, () => props.slides, () => props.heightMode], async () => {
  await nextTick();
  observeSlides();
  syncActiveSlideHeight();
});

onMounted(() => {
  window.addEventListener('resize', onResize);
  trackRef.value?.addEventListener('scrollend', onScrollEnd);
  nextTick(() => {
    observeSlides();
    syncActiveSlideHeight();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  trackRef.value?.removeEventListener('scrollend', onScrollEnd);
  clearTimeout(snapTimer);
  clearTimeout(heightTimer);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.analytics-snap-track {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x pan-y;
}

.analytics-snap-track > * {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  box-sizing: border-box;
  flex: 0 0 100%;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
}

.analytics-snap-track--tallest > * {
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.analytics-snap-track--tallest > * > * {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
}
</style>
