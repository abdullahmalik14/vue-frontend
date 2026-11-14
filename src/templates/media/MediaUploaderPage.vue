<template>
  <DashboardSharedTwoColLayout no-padding>
    <div
      data-component="media-uploader-page"
      class="relative flex flex-col gap-6 min-w-0 max-w-full min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-5rem)] py-5 lg:py-10"
    >
      <div class="flex items-center justify-between gap-4 px-5 lg:px-10">
        <Heading
          :text="t('mediaUploader.empty.title')"
          tag="h1"
          theme="custom"
          no-wrap
          add-class="shrink-0 text-[1.875rem] leading-normal font-medium text-dark-gray dark:text-beige-text"
        />
        <DashboardPrimaryButton
          v-if="hasLibrary"
          data-action="open-new-upload"
          :text="t('mediaUploader.empty.uploadCta')"
          theme="mediaUploadCta"
          type="button"
          :leftIcon="plusIconUrl"
          @click="openNewUpload"
        />
      </div>

      <template v-if="loading">
        <div class="flex flex-col gap-2 px-5 lg:px-10 md:flex-row md:items-center md:gap-4">
          <div class="flex items-center gap-4 shrink-0">
            <div class="hidden md:flex w-[104px] h-[48px] rounded-[48px] bg-mediaUi-skeleton animate-skeleton-loading" />
            <div class="w-full flex items-start h-[48px] rounded-[48px] bg-mediaUi-skeleton animate-skeleton-loading md:w-[20.125rem]" />
          </div>
          <div class="flex justify-between items-center w-full md:flex-1 md:min-w-0">
            <OrdersTableSearchInput
              v-model="searchQuery"
              input-id="media-library-search"
              search-placeholder-key="mediaUploader.library.searchPlaceholder"
              search-alt-key="mediaUploader.library.searchAlt"
            />
            <div class="flex justify-center items-center gap-1 p-2 md:ml-auto md:gap-2 md:px-4">
              <FunnelIcon class="w-4 h-4 text-secondary-text md:w-5 md:h-5 md:text-medium-text dark:text-text-dark-mutedBluish" />
              <span class="text-xs leading-normal font-medium text-secondary-text md:text-sm md:text-medium-text">
                {{ t('mediaUploader.library.filter') }}
              </span>
              <span class="inline-block h-2 w-2 min-h-2 min-w-2 shrink-0 grow-0 self-center rounded-full bg-primary-pink aspect-square" />
            </div>
          </div>
        </div>
        <div :class="viewMode === 'grid' ? 'px-5 lg:px-10' : ''">
          <MediaPlaceholder :view-mode="viewMode" />
        </div>
      </template>

      <template v-else-if="hasLibrary">
        <div class="flex flex-col gap-2 px-5 lg:px-10 lg:flex-row lg:items-center lg:gap-4">
          <div class="flex items-center gap-4 shrink-0">
            <div
              class="hidden md:inline-flex shrink-0 items-center overflow-hidden rounded-[5px] bg-gray-50/50 outline outline-1 outline-gray-300"
            >
              <button
                type="button"
                class="min-h-10 px-4 py-2 border-r border-gray-300 flex justify-center items-center gap-2 cursor-pointer outline-none"
                :class="viewMode === 'grid' ? 'bg-gray-900' : 'bg-transparent'"
                :aria-label="t('mediaUploader.library.gridView')"
                @click="viewMode = 'grid'"
              >
                <Squares2X2Icon
                  class="w-5 h-5"
                  :class="viewMode === 'grid' ? 'text-white' : 'text-gray-400'"
                />
              </button>
              <button
                type="button"
                class="min-h-10 px-4 py-2 border-r border-gray-300 flex justify-center items-center gap-2 cursor-pointer outline-none"
                :class="viewMode === 'table' ? 'bg-gray-900' : 'bg-transparent'"
                :aria-label="t('mediaUploader.library.listView')"
                @click="viewMode = 'table'"
              >
                <Bars3Icon
                  class="w-5 h-5"
                  :class="viewMode === 'table' ? 'text-white' : 'text-gray-400'"
                />
              </button>
            </div>

            <MyMediaTabs v-model="currentTab" :tabs="tabList" />
          </div>

          <div class="flex justify-between items-center w-full md:flex-1 md:min-w-0">
            <OrdersTableSearchInput
              v-model="searchQuery"
              input-id="media-library-search-ready"
              search-placeholder-key="mediaUploader.library.searchPlaceholder"
              search-alt-key="mediaUploader.library.searchAlt"
            />

            <button
              type="button"
              data-action="open-media-filter"
              class="inline-flex items-center gap-1 p-2 md:ml-auto md:gap-2 md:px-4 leading-none cursor-pointer"
              @click="showFilterPopup = true"
            >
              <FunnelIcon
                class="w-4 h-4 shrink-0 block text-secondary-text md:w-5 md:h-5 md:text-medium-text dark:text-text-dark-mutedBluish"
              />
              <span
                class="text-xs leading-normal font-medium text-secondary-text dark:text-text-dark-mutedBluish md:text-sm md:text-medium-text"
              >
                {{ t('mediaUploader.library.filter') }}
              </span>
              <span class="inline-block h-2 w-2 min-h-2 min-w-2 shrink-0 grow-0 self-center rounded-full bg-primary-pink aspect-square" />
            </button>
          </div>
        </div>

        <div
          v-if="viewMode === 'grid'"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-5 lg:px-10"
        >
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="w-full min-w-0"
          >
            <MyMediaCard
              :item="item"
              @menu-action="onCardMenuAction"
              @last-tier-blocked="onLastTierBlocked"
            />
          </div>
        </div>

        <MediaTableView v-else class="min-w-0" :items="visibleItems" @menu-action="onTableMenuAction" />
      </template>

      <div v-else class="flex flex-1 flex-col items-center justify-center gap-4 px-5 lg:px-10">
        <img
          :src="emptyIconUrl"
          :alt="t('mediaUploader.empty.iconAlt')"
          class="w-32 h-28 object-contain [filter:brightness(0)_saturate(100%)_invert(49%)_sepia(8%)_saturate(906%)_hue-rotate(182deg)_brightness(94%)_contrast(87%)]"
        />

        <Paragraph
          :text="t('mediaUploader.empty.description')"
          theme="custom"
          no-wrap
          add-class="text-base font-normal text-center text-dark-gray dark:text-beige-text"
        />

        <DashboardPrimaryButton
          :text="t('mediaUploader.empty.uploadCta')"
          theme="mediaUploadCta"
          type="button"
          :leftIcon="plusIconUrl"
          @click="openNewUpload"
        />

        <a
          href="#"
          class="text-sm font-medium uppercase underline text-dark-gray hover:opacity-80 dark:text-beige-text"
          @click.prevent="onMediaFaq"
        >
          {{ t('mediaUploader.empty.faq') }}
        </a>
      </div>
    </div>

    <UploadMediaPopup
      v-model="showUploadMediaPopup"
      @file-selected="onUploadFileSelected"
      @submitted="onSubmitted"
      
      @save-draft="onSaveDraft"
    />

    <MediaFilterPopup
      v-model="showFilterPopup"
      :applied-filters="appliedFilters"
      @apply="onFilterApply"
    />

    <LastTierMediaPopup
      v-model="showLastTierPopup"
      :tier-name="lastTierName"
    />

    <Teleport to="body">
      <div
        v-if="showSubmittedToast"
        class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto animate-in fade-in slide-in-from-top duration-300 sm:left-auto sm:right-2 sm:top-2 sm:w-[min(24rem,calc(100vw-1rem))] sm:slide-in-from-right"
      >
        <NotificationCard
          v-model="showSubmittedToast"
          variant="success-teal"
          :title="submittedToastTitle"
          :closable="false"
        >
          <template #icon>
            <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
              <img
                v-if="successTickUrl"
                :src="successTickUrl"
                alt=""
                class="w-7 h-7 object-contain"
              />
            </div>
          </template>
        </NotificationCard>
      </div>
    </Teleport>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Bars3Icon, FunnelIcon, Squares2X2Icon } from '@heroicons/vue/24/outline';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import OrdersTableSearchInput from '@/components/ui/table/dashboard/OrdersTableSearchInput.vue';
import UploadMediaPopup from '@/components/ui/popups/media/UploadMediaPopup.vue';
import MediaFilterPopup from '@/components/ui/popups/media/MediaFilterPopup.vue';
import LastTierMediaPopup from '@/components/ui/popups/media/LastTierMediaPopup.vue';
import MyMediaTabs from '@/templates/media/media-creator/MyMediaTabs.vue';
import MyMediaCard from '@/templates/media/media-creator/MyMediaCard.vue';
import MediaTableView from '@/templates/media/media-creator/MediaTableView.vue';
import MediaPlaceholder from '@/templates/media/media-creator/MediaPlaceholder.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaUploaderAssets } from '@/composables/useMediaUploaderAssets.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { buildMediaUploaderCatalog } from '@/services/media/mediaUploaderCatalogBuilder.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();
const { url: emptyIconUrl } = useAssetUrl('mediaUploader.icon.emptyState');
const { url: plusIconUrl } = useAssetUrl('mediaUploader.icon.addTier');
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');

const MEDIA_TYPE_IDS = ['video', 'singleImage', 'imageGallery', 'audio'];

const showUploadMediaPopup = ref(false);
const showFilterPopup = ref(false);
const showLastTierPopup = ref(false);
const lastTierName = ref('');
const loading = ref(true);
const viewMode = ref('grid');
const currentTab = ref('all');
const searchQuery = ref('');
const appliedFilters = ref(createDefaultFilters());
const showSubmittedToast = ref(false);
const submittedToastTitle = ref('');
let toastTimer = null;
let loadingTimer = null;

const hasLibrary = computed(() => (uploaderStore.libraryItems || []).length > 0);

const tabList = computed(() => {
  const items = uploaderStore.libraryItems || [];
  return [
    { label: t('mediaUploader.library.tabs.all'), value: 'all', count: items.length },
    {
      label: t('mediaUploader.library.tabs.published'),
      value: 'published',
      count: items.filter((item) => item.status === 'published').length,
    },
    {
      label: t('mediaUploader.library.tabs.notPublished'),
      value: 'not_published',
      count: items.filter((item) => item.status === 'draft').length,
    },
    {
      label: t('mediaUploader.library.tabs.reviewing'),
      value: 'reviewing',
      count: items.filter((item) => item.status === 'reviewing').length,
    },
  ];
});

function createDefaultFilters() {
  return {
    sortBy: 'uploadDate',
    sortDir: 'desc',
    payToViewOnly: false,
    mediaTypes: [...MEDIA_TYPE_IDS],
    tiers: [],
  };
}

function itemKind(item) {
  if (item.mediaKind) return item.mediaKind;
  if (item.type === 'image') return 'singleImage';
  if (item.type === 'gallery') return 'imageGallery';
  if (item.type === 'audio') return 'audio';
  return 'video';
}

function hasPayToView(item) {
  return Boolean(String(item.price || '').trim());
}

function parseUploadDate(item) {
  const parsed = Date.parse(String(item?.date || ''));
  if (!Number.isNaN(parsed)) return parsed;
  const match = String(item?.id || '').match(/^media_(\d+)_/);
  return match ? Number(match[1]) : 0;
}

function matchesTab(item) {
  if (currentTab.value === 'all') return true;
  if (currentTab.value === 'not_published') return item.status === 'draft';
  return item.status === currentTab.value;
}

const visibleItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const filters = appliedFilters.value;
  const typeSet = new Set(filters.mediaTypes || []);
  const tierSet = new Set(filters.tiers || []);

  const items = (uploaderStore.libraryItems || []).filter((item) => {
    if (!matchesTab(item)) return false;
    if (!typeSet.has(itemKind(item))) return false;
    if (filters.payToViewOnly && !hasPayToView(item)) return false;
    if (tierSet.size > 0) {
      const itemTiers = Array.isArray(item.tiers) ? item.tiers : [];
      if (!itemTiers.some((tier) => tierSet.has(tier))) return false;
    }
    if (query && !String(item.title || '').toLowerCase().includes(query)) return false;
    return true;
  });

  return [...items].sort((a, b) => {
    const diff = parseUploadDate(a) - parseUploadDate(b);
    return filters.sortDir === 'asc' ? diff : -diff;
  });
});

function onFilterApply(filters) {
  appliedFilters.value = {
    sortBy: filters.sortBy || 'uploadDate',
    sortDir: filters.sortDir === 'asc' ? 'asc' : 'desc',
    payToViewOnly: Boolean(filters.payToViewOnly),
    mediaTypes: Array.isArray(filters.mediaTypes) ? [...filters.mediaTypes] : [...MEDIA_TYPE_IDS],
    tiers: Array.isArray(filters.tiers) ? [...filters.tiers] : [],
  };
}

function truncateTitle(title, max = 68) {
  const value = String(title || '').trim();
  if (value.length <= max) return value;
  return value.slice(0, max).trim();
}

function showToastForItem(item) {
  const kind = t(`mediaUploader.library.kind.${item.mediaKind || 'video'}`);
  const title = truncateTitle(item.title || t('mediaUploader.empty.title'));
  submittedToastTitle.value = t('mediaUploader.library.submittedToast', { kind, title });
  showSubmittedToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showSubmittedToast.value = false;
    toastTimer = null;
  }, 4500);
}

async function onSubmitted() {
  const item = await uploaderStore.saveLibraryItemFromForm(
    uploaderStore.editingItemId ? {} : { status: 'reviewing' },
  );
  uploaderStore.$persist?.();
  if (item) showToastForItem(item);
  currentTab.value = item?.status === 'draft'
    ? 'not_published'
    : item?.status === 'published'
      ? 'published'
      : 'reviewing';
}

async function onSaveDraft() {
  await uploaderStore.saveLibraryItemFromForm({ status: 'draft' });
  uploaderStore.$persist?.();
  currentTab.value = 'not_published';
}

function openNewUpload() {
  uploaderStore.clearEditingItem();
  uploaderStore.resetForm();
  showUploadMediaPopup.value = true;
}

function openEditItem(item) {
  if (!item?.id) return;
  uploaderStore.loadLibraryItemForEdit(item.id);
  showUploadMediaPopup.value = true;
}

function onLastTierBlocked(tierLabel) {
  lastTierName.value = String(tierLabel || '');
  window.setTimeout(() => {
    showLastTierPopup.value = true;
  }, 50);
}

function onCardMenuAction({ item, action }) {
  if (!item?.id) return;
  if (action === 'edit') {
    openEditItem(item);
    return;
  }
  if (action === 'delete') {
    uploaderStore.removeLibraryItem(item.id);
    return;
  }
  if (action === 'unpublish') {
    uploaderStore.updateLibraryItemStatus(item.id, 'draft');
    return;
  }
  if (action === 'publish') {
    uploaderStore.updateLibraryItemStatus(item.id, 'published');
  }
}

function onTableMenuAction({ item, action }) {
  onCardMenuAction({ item, action });
}

function onUploadFileSelected(payload) {
  void payload;
}

function onMediaFaq() {
  if (typeof window !== 'undefined') {
    window.open('https://fansocial.app/help/media-faq', '_blank', 'noopener,noreferrer');
  }
}

function hydrateUploaderCatalogs() {
  const catalog = buildMediaUploaderCatalog({ t, assets: assets.value });
  uploaderStore.setUploaderCatalogs(catalog);
  uploaderStore.restoreLibraryItemTags(catalog.tagCatalog);
}

onMounted(() => {
  hydrateUploaderCatalogs();
  loadingTimer = setTimeout(() => {
    loading.value = false;
    loadingTimer = null;
  }, 2000);
});

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
  if (loadingTimer) clearTimeout(loadingTimer);
});
</script>
