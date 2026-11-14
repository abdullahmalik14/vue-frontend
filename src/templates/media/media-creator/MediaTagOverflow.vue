<template>
  <div
    data-component="media-tag-overflow"
    ref="rootRef"
    class="relative min-w-0 w-full"
    :class="wrap ? '' : 'overflow-hidden'"
  >
    <div
      v-if="!wrap"
      ref="measureRef"
      class="flex w-max items-center gap-2 invisible absolute left-0 top-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        v-for="(tag, index) in tagList"
        :key="`m-${index}-${tag}`"
        data-tag-measure
        class="flex shrink-0 justify-center items-center px-1.5 py-1"
      >
        <span class="text-xs leading-normal font-medium whitespace-nowrap">{{ tag }}</span>
      </div>
      <div
        ref="plusMeasureRef"
        class="flex shrink-0 justify-center items-center px-1.5 py-1"
      >
        <span class="text-xs leading-normal font-medium">+{{ tagList.length }}</span>
      </div>
    </div>

    <div
      class="flex items-center gap-2 min-w-0 w-full"
      :class="wrap ? 'flex-wrap' : ''"
    >
      <div
        v-for="(tag, index) in visibleTags"
        :key="`v-${index}-${tag}`"
        class="flex shrink-0 justify-center items-center px-1.5 py-1"
        :class="tagShellClass"
      >
        <span
          class="text-xs leading-normal font-medium whitespace-nowrap"
          :class="tagTextClass"
        >
          {{ tag }}
        </span>
      </div>
      <div
        v-if="!wrap && hiddenCount > 0"
        class="flex shrink-0 justify-center items-center px-1.5 py-1"
        :class="tagShellClass"
      >
        <span
          class="text-xs leading-normal font-medium"
          :class="tagTextClass"
        >
          +{{ hiddenCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  /** media (default) | merchMedia (white + #0C111D text) | merch (dark chip) */
  theme: {
    type: String,
    default: 'media',
  },
  /** Show every tag with wrap (no +N collapse). Merch collection column uses this. */
  wrap: {
    type: Boolean,
    default: false,
  },
});

const tagShellClass = computed(() => {
  if (props.theme === 'merch') return 'bg-[#0C111D]';
  return 'bg-white dark:bg-background-dark-app';
});
const tagTextClass = computed(() => {
  if (props.theme === 'merch') return 'text-white';
  if (props.theme === 'merchMedia') return 'text-[#0C111D]';
  return 'text-medium-text dark:text-text-dark-mutedBluish';
});

const rootRef = ref(null);
const measureRef = ref(null);
const plusMeasureRef = ref(null);
const shownCount = ref(0);
const hiddenCount = ref(0);

let observer;

function tagName(tag) {
  if (typeof tag === 'string') return tag.trim();
  return String(tag?.name || tag?.label || tag?.value || '').trim();
}

const tagList = computed(() => {
  const names = [];
  for (const tag of props.tags || []) {
    const name = tagName(tag);
    const plusMatch = name.match(/^\+(\d+)$/);
    if (plusMatch) continue;
    if (name) names.push(name);
  }
  return names;
});

const visibleTags = computed(() =>
  props.wrap ? tagList.value : tagList.value.slice(0, shownCount.value),
);

function recalc() {
  if (props.wrap) {
    shownCount.value = tagList.value.length;
    hiddenCount.value = 0;
    return;
  }

  const tags = tagList.value;
  const available = rootRef.value?.clientWidth || 0;

  if (!tags.length) {
    shownCount.value = 0;
    hiddenCount.value = 0;
    return;
  }

  if (available <= 0) {
    shownCount.value = tags.length;
    hiddenCount.value = 0;
    return;
  }

  const pills = measureRef.value
    ? Array.from(measureRef.value.querySelectorAll('[data-tag-measure]'))
    : [];
  const plusWidth = plusMeasureRef.value?.offsetWidth || 28;
  const gap = 8;
  const widths = pills.map((el) => el.offsetWidth).filter((width) => width > 0);

  if (!widths.length || widths.length < tags.length) {
    shownCount.value = tags.length;
    hiddenCount.value = 0;
    return;
  }

  let allWidth = 0;
  widths.forEach((width, index) => {
    allWidth += width + (index ? gap : 0);
  });

  if (allWidth <= available) {
    shownCount.value = tags.length;
    hiddenCount.value = 0;
    return;
  }

  let used = 0;
  let count = 0;
  for (let i = 0; i < widths.length; i += 1) {
    const next = used + (count ? gap : 0) + widths[i];
    if (next + gap + plusWidth <= available) {
      used = next;
      count += 1;
    } else {
      break;
    }
  }

  if (count === 0) count = 1;
  shownCount.value = count;
  hiddenCount.value = Math.max(tags.length - count, 0);
}

onMounted(async () => {
  await nextTick();
  recalc();
  if (props.wrap) return;
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    observer = new ResizeObserver(() => recalc());
    observer.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

watch(
  () => [tagList.value, props.tags, props.wrap],
  async () => {
    await nextTick();
    recalc();
  },
  { deep: true },
);
</script>
