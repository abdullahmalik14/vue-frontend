<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { filterMerchItems, merchItemById } from './xRepostMerchItems.js';

const PANEL_WIDTH = 280;
const SEARCH_HEADER_HEIGHT = 56;
const PANEL_MIN_HEIGHT = 120;
const LIST_MIN_HEIGHT = 64;

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  chevronIcon: {
    type: String,
    default: '',
  },
  widthClass: {
    type: String,
    default: 'w-[200px]',
  },
  forceOpenAbove: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const { t } = useI18n();

const isOpen = ref(false);
const dropdownRef = ref(null);
const panelRef = ref(null);
const panelStyle = ref({});
const listStyle = ref({});
const searchQuery = ref('');
const hoveredId = ref(null);

const selectedItem = computed(() => merchItemById(props.modelValue));
const filteredItems = computed(() => filterMerchItems(searchQuery.value));

function updatePanelPosition() {
  const trigger = dropdownRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const viewportPadding = 16;
  const panelWidth = props.forceOpenAbove ? Math.max(rect.width, PANEL_WIDTH) : PANEL_WIDTH;
  let left = rect.left;
  const overflowRight = left + panelWidth - (window.innerWidth - viewportPadding);
  if (overflowRight > 0) left = Math.max(viewportPadding, left - overflowRight);

  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
  const spaceAbove = rect.top - viewportPadding;
  const openAbove =
    props.forceOpenAbove || (spaceBelow < 180 && spaceAbove > spaceBelow);
  const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, PANEL_MIN_HEIGHT);
  const listMaxHeight = Math.max(availableSpace - SEARCH_HEADER_HEIGHT, LIST_MIN_HEIGHT);

  if (props.forceOpenAbove) {
    const maxHeight = Math.min(Math.max(availableSpace, PANEL_MIN_HEIGHT), window.innerHeight * 0.7);
    panelStyle.value = {
      bottom: '0px',
      left: '0px',
      width: '100%',
      maxHeight: `${maxHeight}px`,
    };
    listStyle.value = {
      maxHeight: `${Math.max(maxHeight - SEARCH_HEADER_HEIGHT, LIST_MIN_HEIGHT)}px`,
    };
    return;
  }

  if (openAbove) {
    panelStyle.value = {
      bottom: `${window.innerHeight - rect.top}px`,
      left: `${left}px`,
      width: `${panelWidth}px`,
      maxHeight: `${availableSpace}px`,
    };
    listStyle.value = {
      maxHeight: `${listMaxHeight}px`,
    };
    return;
  }

  panelStyle.value = {
    top: `${rect.bottom}px`,
    left: `${left}px`,
    width: `${panelWidth}px`,
    maxHeight: `${availableSpace}px`,
  };
  listStyle.value = {
    maxHeight: `${listMaxHeight}px`,
  };
}

async function toggleDropdown() {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }

  searchQuery.value = '';
  isOpen.value = true;
  await nextTick();
  updatePanelPosition();
}

function selectItem(id) {
  emit('update:modelValue', id);
  isOpen.value = false;
}

function handleDocumentClick(event) {
  if (!isOpen.value) return;
  const trigger = dropdownRef.value;
  const panel = panelRef.value;
  const target = event.target;
  if (target instanceof Node && (trigger?.contains(target) || panel?.contains(target))) return;
  isOpen.value = false;
}

function handleReposition() {
  if (!isOpen.value) return;
  updatePanelPosition();
}

watch(isOpen, (open) => {
  if (!open) {
    hoveredId.value = null;
    searchQuery.value = '';
  }
  emit(open ? 'open' : 'close');
});

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true);
  window.addEventListener('resize', handleReposition);
  window.addEventListener('scroll', handleReposition, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true);
  window.removeEventListener('resize', handleReposition);
  window.removeEventListener('scroll', handleReposition, true);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative shrink-0 box-border"
    :class="[
      widthClass,
      forceOpenAbove ? 'min-h-[52px]' : 'h-[52px] border-r border-b border-[#D0D5DD]',
    ]"
  >
    <div
      class="relative flex w-full cursor-pointer items-center"
      :class="[
        forceOpenAbove ? 'min-h-[52px] x-repost-mobile-trigger' : 'h-full overflow-hidden',
        isOpen && !forceOpenAbove ? 'border-b-[1.5px] border-b-black bg-white dark:bg-white' : '',
        selectedItem ? 'gap-0 pr-3' : 'gap-2 px-3 bg-[#F4F5F3]',
      ]"
      @click.stop="toggleDropdown"
    >
      <template v-if="selectedItem">
        <img
          :src="selectedItem.thumbnail"
          alt=""
          class="h-full w-12 shrink-0 object-cover"
        />
        <span class="min-w-0 flex-1 truncate px-2 text-sm font-normal leading-6 text-[#0C111D] dark:text-[#dbd8d3]">
          {{ selectedItem.title }}
        </span>
      </template>

      <template v-else>
        <img src="/images/plus-grey-square.png" alt="" srcset="" class="w-3 h-3">
        <span class="min-w-0 flex-1 truncate text-sm font-normal leading-6 text-[#0C111D]">
          {{ t('dashboard.xRepost.merch.addMerchCollection') }}
        </span>
      </template>

      <img
        v-if="chevronIcon"
        :src="chevronIcon"
        alt=""
        width="7"
        height="6"
        class="ml-auto h-[6px] w-[6.8px] shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen && forceOpenAbove"
        class="fixed inset-0 z-[11999] bg-black/5 backdrop-blur-[7.5px]"
        @click="isOpen = false"
      />
      <div
        v-if="isOpen"
        ref="panelRef"
        class="fixed"
        :class="forceOpenAbove ? 'z-[12000]' : 'z-[4000]'"
        :style="panelStyle"
        @click.stop
      >
        <div
          class="flex max-h-full flex-col overflow-hidden bg-[#FFFFFFE5] dark:bg-[#FFFFFFE5]"
          :class="forceOpenAbove
            ? 'rounded-none border border-[#EAECF0] shadow-[0_0_12px_0_#00000033]'
            : 'rounded-[2px] shadow-[0_3px_6px_0_rgba(0,0,0,0.12)]'"
        >
          <div
            class="flex items-center gap-1 border-b p-4"
            :class="forceOpenAbove ? 'border-[#EAECF0]' : 'border-[#D0D5DD]'"
          >
            <svg
                class="size-4 shrink-0 text-[#667085]"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                  stroke="currentColor"
                  stroke-width="1.333"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                class="min-w-0 flex-1 bg-transparent text-sm font-normal leading-5 text-[#0C111D] outline-none placeholder:text-[#667085]"
                :placeholder="t('dashboard.xRepost.merch.search')"
                @click.stop
              />
          </div>

          <div
            class="overflow-y-auto overscroll-contain scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            :style="listStyle"
          >
            <button
              v-for="item in filteredItems"
              :key="item.id"
              type="button"
              class="flex w-full cursor-pointer items-stretch overflow-hidden border-b p-0 text-left transition-colors last:border-b-0"
              :class="[
                forceOpenAbove ? 'border-[#EAECF0]' : 'border-[#D0D5DD]',
                modelValue === item.id || hoveredId === item.id ? 'bg-[#ECFDFF] dark:bg-[#0c3a44]' : '',
              ]"
              @mouseenter="hoveredId = item.id"
              @mouseleave="hoveredId = null"
              @click="selectItem(item.id)"
            >
              <div class="w-12 shrink-0 self-stretch overflow-hidden">
                <img
                  :src="item.thumbnail"
                  alt=""
                  class="size-full object-cover"
                />
              </div>
              <span class="flex min-w-0 flex-1 items-center px-3 py-3 text-xs font-normal leading-[18px] text-[#0C111D] dark:text-[#dbd8d3]">
                {{ item.title }}
              </span>
            </button>

            <p
              v-if="!filteredItems.length"
              class="p-[8px] text-start text-xs font-normal leading-5 text-[#0C111D]"
            >
              {{ t('dashboard.xRepost.merch.noResults') }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.x-repost-mobile-trigger {
  border-top: 1px solid #d0d5dd !important;
  border-bottom: 1px solid #d0d5dd !important;
  box-sizing: border-box;
  background-clip: padding-box;
}
</style>
