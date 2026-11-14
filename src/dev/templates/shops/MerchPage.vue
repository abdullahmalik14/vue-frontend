<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Bars3Icon, FunnelIcon, Squares2X2Icon } from '@heroicons/vue/24/outline';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import OrdersTableSearchInput from '@/components/ui/table/dashboard/OrdersTableSearchInput.vue';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import MerchListingPopup from '@/dev/components/ui/popups/shops/MerchListingPopup.vue';
import ProfileMerchPopup from '@/dev/components/ui/popups/profile/ProfileMerchPopup.vue';
import MerchFilterPopup from '@/dev/components/ui/popups/shops/MerchFilterPopup.vue';
import MyMediaTabs from '@/templates/media/media-creator/MyMediaTabs.vue';
import MerchLibraryCard from '@/dev/templates/shops/MerchLibraryCard.vue';
import MerchTableView from '@/dev/templates/shops/MerchTableView.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import {
  buildMerchItemFromListingState,
  useMerchLibraryEngine,
} from '@/dev/composables/useMerchLibraryEngine.js';
import { createStepStateEngine } from '@/utils/stateEngine.js';

const { t } = useI18n();
const { url: emptyCartUrl } = useAssetUrl('shops.icon.emptyCart');
const { url: newMerchPlusUrl } = useAssetUrl('plan.icon.newTierPlus');
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');
/** Edit save / keep-in-store toast — the teal check the user supplied (not the light project webp). */
const profileCheckCircleUrl = '/dev/cdn/images/merch-toast-check.png';

const {
  items: libraryItems,
  upsertItem,
  patchItem,
  removeItem,
  getItem,
  resolveItemGallery,
} = useMerchLibraryEngine();

const listingOpen = ref(false);
const listingMode = ref('create');
const listingItem = ref(null);
/** MerchListingPopup wizard step (1–4). Publish opens on Publish Settings. */
const listingInitialStep = ref(1);
const detailOpen = ref(false);
const selectedId = ref(null);
const viewMode = ref('grid');
const currentTab = ref('all');
const searchQuery = ref('');
const showFilterPopup = ref(false);
const showToast = ref(false);
const toastKind = ref('keepInStore');
const toastProductName = ref('');
const toastThumb = ref('');
let toastTimer = null;

function createDefaultMerchFilters() {
  return {
    sortKey: 'uploadDate_desc',
    preOrderOnly: false,
    subscriberOnly: false,
    onSaleOnly: false,
    tagQuery: '',
    collectionQuery: '',
    tiers: [],
  };
}

const filterAppliedEngine = createStepStateEngine({
  flowId: 'merchLibraryFilters',
  urlSync: 'none',
  persist: false,
  defaults: createDefaultMerchFilters(),
});

const appliedFilters = computed(() => filterAppliedEngine.state);

function merchHasSalePrice(item) {
  return Boolean(String(item?.discountedPrice || '').trim());
}

function merchItemTiers(item) {
  const planIds = Array.isArray(item?.subscriptionPlanIds) ? item.subscriptionPlanIds : [];
  const plans = Array.isArray(item?.subscriptionPlans) ? item.subscriptionPlans : [];
  return plans
    .filter((plan) => plan && planIds.includes(plan.id))
    .map((plan) => String(plan.label || plan.name || '').trim())
    .filter(Boolean);
}

function catalogEntryLabel(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry.trim();
  return String(entry.name || entry.label || entry.value || '').trim();
}

function itemMatchesQuery(entries, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  const list = Array.isArray(entries) ? entries : [];
  return list.some((entry) => catalogEntryLabel(entry).toLowerCase().includes(q));
}

function parseMerchDate(item) {
  const parsed = Date.parse(String(item?.createdAt || item?.publishedAt || item?.updatedAt || ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function onFilterApply(filters = {}) {
  filterAppliedEngine.setState('sortKey', filters.sortKey || 'uploadDate_desc');
  filterAppliedEngine.setState('preOrderOnly', Boolean(filters.preOrderOnly));
  filterAppliedEngine.setState('subscriberOnly', Boolean(filters.subscriberOnly));
  filterAppliedEngine.setState('onSaleOnly', Boolean(filters.onSaleOnly));
  filterAppliedEngine.setState('tagQuery', String(filters.tagQuery || ''));
  filterAppliedEngine.setState('collectionQuery', String(filters.collectionQuery || ''));
  filterAppliedEngine.setState(
    'tiers',
    Array.isArray(filters.tiers) ? [...filters.tiers] : [],
  );
}

const selectedItem = computed(() =>
  selectedId.value ? getItem(selectedId.value) : null,
);

const hasLibrary = computed(() => libraryItems.value.length > 0);

const tabList = computed(() => {
  const items = libraryItems.value;
  return [
    {
      label: t('shops.merch.library.tabs.all'),
      value: 'all',
      count: items.length,
    },
    {
      label: t('shops.merch.library.tabs.published'),
      value: 'published',
      count: items.filter((item) => item.status === 'published' || item.status === 'preorder').length,
    },
    {
      label: t('shops.merch.library.tabs.draft'),
      value: 'draft',
      count: items.filter((item) => item.status === 'draft').length,
    },
    {
      label: t('shops.merch.library.tabs.reviewing'),
      value: 'reviewing',
      count: items.filter((item) => item.status === 'reviewing').length,
    },
  ];
});

const visibleItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const filters = appliedFilters.value;
  const tierSet = new Set(filters.tiers || []);

  const items = libraryItems.value.filter((item) => {
    if (currentTab.value === 'published') {
      if (item.status !== 'published' && item.status !== 'preorder') return false;
    } else if (currentTab.value !== 'all' && item.status !== currentTab.value) {
      return false;
    }
    if (filters.preOrderOnly && !(item.openForPreorder || item.status === 'preorder')) {
      return false;
    }
    if (filters.subscriberOnly && !item.subscribersOnly) return false;
    if (filters.onSaleOnly && !merchHasSalePrice(item)) return false;
    if (!itemMatchesQuery(item.tags, filters.tagQuery)) return false;
    if (!itemMatchesQuery(item.collections, filters.collectionQuery)) return false;
    if (tierSet.size > 0) {
      const itemTiers = merchItemTiers(item);
      if (!itemTiers.some((tier) => tierSet.has(tier))) return false;
    }
    if (query && !String(item.title || '').toLowerCase().includes(query)) return false;
    return true;
  });

  return [...items].sort((a, b) => {
    if (filters.sortKey === 'mostPopular') {
      return (Number(b.itemsSold) || 0) - (Number(a.itemsSold) || 0);
    }
    const diff = parseMerchDate(a) - parseMerchDate(b);
    return filters.sortKey === 'uploadDate_asc' ? diff : -diff;
  });
});

const toastTitle = computed(() => {
  const name = toastProductName.value || t('shops.merch.library.demoProductName');
  if (toastKind.value === 'unpublishPreorder') {
    return t('shops.merch.library.toast.unpublished', { name });
  }
  if (toastKind.value === 'unpublish') {
    return t('shops.merch.library.toast.unpublishedSuccess');
  }
  if (toastKind.value === 'deleted') {
    return t('shops.merch.library.toast.deleted', { name });
  }
  if (toastKind.value === 'submitted') {
    return t('shops.merch.library.toast.submittedForApproval', { name });
  }
  return t('shops.merch.library.toast.updatedPublishSettings', { name });
});

/** Stock 0 (and not unlimited) — never leave draft for review / publish / preorder. */
function isOutOfStockListing(listing = {}) {
  if (listing?.unlimitedStock) return false;
  const stockRaw = listing?.stockAmount ?? listing?.stock;
  if (stockRaw === '' || stockRaw == null) return false;
  return Number(stockRaw) <= 0;
}

function detailVariantFor(item) {
  if (isOutOfStockListing(item)) return 'out-of-stock';
  if (item?.status === 'preorder' || item?.openForPreorder) return 'pre-order';
  return 'regular';
}

function openDetail(item) {
  if (!item?.id) return;
  selectedId.value = item.id;
  detailOpen.value = true;
}

function openListingCreate() {
  listingMode.value = 'create';
  listingItem.value = null;
  listingInitialStep.value = 1;
  listingOpen.value = true;
}

async function openListingEdit(item, step = 1) {
  if (!item?.id) return;
  const fresh = getItem(item.id) || item;
  const galleryUploaded = await resolveItemGallery(fresh);
  listingMode.value = 'edit';
  listingItem.value = { ...fresh, galleryUploaded };
  listingInitialStep.value = step;
  listingOpen.value = true;
}

function onNewMerch() {
  openListingCreate();
}

function onDetailEditDetails() {
  const item = selectedItem.value;
  if (item) openListingEdit(item);
}

function onDetailUnpublished() {
  const item = selectedItem.value;
  if (!item?.id) return;
  patchItem(item.id, { status: 'draft', openForPreorder: false });
  showSuccessToast('unpublish', item.title, item.thumbnail);
}

function onDetailPublished() {
  const item = selectedItem.value;
  if (!item?.id) return;
  // Open edit listing on Publish Settings (last step) — do not flip status here.
  openListingEdit(item, 4);
}

function onDetailDeleted() {
  const item = selectedItem.value;
  if (!item?.id) return;
  const title = item.title;
  const thumb = item.thumbnail;
  removeItem(item.id);
  detailOpen.value = false;
  selectedId.value = null;
  showSuccessToast('deleted', title, thumb);
}

function formatPublishedAt(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${months[d.getMonth()]}-${d.getDate()}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function showSuccessToast(kind, productName, thumb = '') {
  toastKind.value = kind;
  toastProductName.value = productName || t('shops.merch.library.demoProductName');
  toastThumb.value = thumb || '';
  showToast.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    showToast.value = false;
    toastTimer = null;
  }, 4500);
}

function onEndPreorder({ action, productName } = {}) {
  const name = productName || t('shops.merch.library.demoProductName');
  const targetId = listingItem.value?.id || selectedId.value;
  const unpublish = action === 'unpublish';
  if (targetId) {
    const updated = patchItem(targetId, {
      status: unpublish ? 'draft' : 'published',
      title: name,
      openForPreorder: false,
      afterPreorderAction: unpublish ? 'unpublish' : 'keepInStore',
      publishedAt: unpublish
        ? ''
        : (getItem(targetId)?.publishedAt || formatPublishedAt(new Date())),
    });
    if (listingItem.value?.id === targetId) {
      listingItem.value = updated || getItem(targetId);
    }
  }
  // Pre-order stop + unpublish → refund toast (pic). Keep-in-store → publish-settings toast.
  showSuccessToast(unpublish ? 'unpublishPreorder' : 'keepInStore', name);
}

function onListingSaved(payload = {}) {
  const id = payload.id || listingItem.value?.id;
  if (!id) return;
  const existing = getItem(id) || {};
  const listing = payload.listingState || {};
  const outOfStock = isOutOfStockListing(listing);
  const preorderOn = Boolean(listing.openForPreorder);
  const unpublishAfterPreorder = preorderOn && listing.afterPreorderAction === 'unpublish';
  const keepPreorder = !outOfStock && preorderOn && !unpublishAfterPreorder;
  const currentStatus = payload.status || existing.status || 'published';
  const publishImmediately = (listing.publishSubstep || 'publishImmediately') === 'publishImmediately';
  const next = buildMerchItemFromListingState(listing, {
    id,
    status: outOfStock || unpublishAfterPreorder
      ? 'draft'
      : (keepPreorder
        ? 'preorder'
        : (currentStatus === 'draft' && publishImmediately ? 'reviewing' : currentStatus)),
    itemsSold: existing.itemsSold ?? 0,
    totalSales: existing.totalSales ?? '0',
    publishedAt: outOfStock || unpublishAfterPreorder
      ? ''
      : (existing.publishedAt || (keepPreorder ? formatPublishedAt(new Date()) : '')),
    createdAt: existing.createdAt,
  });
  if (outOfStock || unpublishAfterPreorder) {
    next.openForPreorder = false;
    next.status = 'draft';
  }
  if (keepPreorder) {
    next.openForPreorder = true;
    next.status = 'preorder';
  }
  upsertItem(next);
  if (selectedId.value === id) {
    listingItem.value = next;
  }
  // Edit SAVE never uses the new-merch "submitted for approval" toast.
  showSuccessToast(
    unpublishAfterPreorder ? 'unpublishPreorder' : 'keepInStore',
    next.title || payload.productName,
  );
}

function onListingSaveDraft(payload = {}) {
  const listing = payload.listingState || {};
  const outOfStock = isOutOfStockListing(listing);
  // Out of stock never enters review — stays draft.
  const status = !outOfStock && payload.status === 'reviewing' ? 'reviewing' : 'draft';
  let next;

  if (listingMode.value === 'edit' && (payload.id || listingItem.value?.id)) {
    const id = payload.id || listingItem.value.id;
    const existing = getItem(id) || {};
    next = buildMerchItemFromListingState(listing, {
      id,
      status,
      itemsSold: existing.itemsSold ?? 0,
      totalSales: existing.totalSales ?? '0',
      publishedAt: status === 'draft' ? '' : (existing.publishedAt || ''),
      createdAt: existing.createdAt,
    });
    if (outOfStock) next.openForPreorder = false;
    upsertItem(next);
  } else {
    next = buildMerchItemFromListingState(listing, {
      status,
      itemsSold: 0,
      totalSales: '0',
      publishedAt: '',
    });
    if (outOfStock) next.openForPreorder = false;
    upsertItem(next);
  }

  if (status === 'reviewing' && next) {
    // New merch / submit — success tick icon, not product thumbnail.
    showSuccessToast('submitted', next.title);
    detailOpen.value = false;
    selectedId.value = null;
    listingItem.value = null;
  }
}

function onMenuAction({ item, action }) {
  if (!item?.id) return;
  if (action === 'edit') {
    openListingEdit(item);
    return;
  }
  if (action === 'delete') {
    removeItem(item.id);
    if (selectedId.value === item.id) {
      detailOpen.value = false;
      selectedId.value = null;
    }
    showSuccessToast('deleted', item.title, item.thumbnail);
    return;
  }
  if (action === 'unpublish') {
    patchItem(item.id, { status: 'draft', openForPreorder: false });
    return;
  }
  if (action === 'publish') {
    if (isOutOfStockListing(item)) return;
    patchItem(item.id, {
      status: 'published',
      publishedAt: formatPublishedAt(new Date()),
    });
  }
}

watch(selectedItem, (item) => {
  if (detailOpen.value && listingItem.value?.id && item?.id === listingItem.value.id) {
    listingItem.value = item;
  }
});

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<template>
  <DashboardSharedTwoColLayout no-padding>
    <div
      data-component="shops-merch-page"
      class="relative flex flex-col gap-6 min-w-0 max-w-full min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-5rem)] py-5 lg:py-10"
    >
      <div class="flex items-center justify-between gap-4 px-5 lg:px-10">
        <Heading
          tag="h1"
          theme="custom"
          no-wrap
          add-class="shrink-0 text-[1.875rem] leading-normal font-medium text-dark-gray dark:text-beige-text"
          :text="t('shops.merch.title')"
        />
        <DashboardPrimaryButton
          v-if="hasLibrary"
          :text="t('shops.merch.newMerch')"
          theme="merchNewCta"
          type="button"
          :leftIcon="newMerchPlusUrl"
          @click="onNewMerch"
        />
      </div>

      <template v-if="hasLibrary">
        <div class="flex flex-col gap-2 px-5 lg:px-10 lg:flex-row lg:items-center lg:gap-4">
          <div class="flex items-center gap-4 shrink-0">
            <div
              class="hidden md:inline-flex shrink-0 items-center overflow-hidden rounded-[5px] bg-gray-50/50 outline outline-1 outline-gray-300"
            >
              <button
                type="button"
                class="min-h-10 px-4 py-2 border-r border-gray-300 flex justify-center items-center gap-2 cursor-pointer outline-none"
                :class="viewMode === 'grid' ? 'bg-gray-900' : 'bg-transparent'"
                :aria-label="t('shops.merch.library.gridView')"
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
                :aria-label="t('shops.merch.library.listView')"
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
              input-id="merch-library-search"
              search-placeholder-key="shops.merch.library.searchPlaceholder"
              search-alt-key="shops.merch.library.searchAlt"
            />

            <button
              type="button"
              data-action="open-merch-filter"
              class="inline-flex items-center gap-1 p-2 md:ml-auto md:gap-2 md:px-4 leading-none cursor-pointer"
              @click="showFilterPopup = true"
            >
              <FunnelIcon
                class="w-4 h-4 shrink-0 block text-secondary-text md:w-5 md:h-5 md:text-medium-text dark:text-text-dark-mutedBluish"
              />
              <span
                class="text-xs leading-normal font-medium text-secondary-text dark:text-text-dark-mutedBluish md:text-sm md:text-medium-text"
              >
                {{ t('shops.merch.library.filter') }}
              </span>
              <span class="inline-block h-2 w-2 min-h-2 min-w-2 shrink-0 grow-0 self-center rounded-full bg-primary-pink aspect-square" />
            </button>
          </div>
        </div>

        <div
          v-if="viewMode === 'grid'"
          class="flex flex-wrap gap-4 px-5 lg:px-10"
        >
          <MerchLibraryCard
            v-for="item in visibleItems"
            :key="item.id"
            :item="item"
            @click="openDetail"
          />
        </div>

        <MerchTableView
          v-else
          class="min-w-0"
          :items="visibleItems"
          @menu-action="onMenuAction"
        />
      </template>

      <div
        v-else
        class="flex flex-1 flex-col items-center justify-center gap-4 px-5 lg:px-10"
      >
        <img
          v-if="emptyCartUrl"
          :src="emptyCartUrl"
          :alt="t('shops.merch.alt.emptyCart')"
          class="h-[106px] w-[106px] object-contain"
        />
        <Paragraph
          theme="custom"
          no-wrap
          add-class="text-center text-[16px] font-normal leading-5 text-[#344054] dark:text-[#98a2b3]"
          :text="t('shops.merch.emptyMessage')"
        />
        <DashboardPrimaryButton
          :text="t('shops.merch.newMerch')"
          theme="merchNewCta"
          type="button"
          :leftIcon="newMerchPlusUrl"
          @click="onNewMerch"
        />
        <button
          type="button"
          class="text-[16px] font-normal leading-5 text-[#344054] underline underline-offset-2 transition-colors hover:text-[#344054] dark:text-[#98a2b3] dark:hover:text-[#bdb8af]"
        >
          {{ t('shops.merch.faq') }}
        </button>
      </div>
    </div>

    <ProfileMerchPopup
      v-model="detailOpen"
      :merch="selectedItem"
      :variant="detailVariantFor(selectedItem)"
      show-owner-actions
      :suppress-dismiss="listingOpen"
      @edit-details="onDetailEditDetails"
      @unpublished="onDetailUnpublished"
      @published="onDetailPublished"
      @deleted="onDetailDeleted"
    />

    <MerchListingPopup
      v-model="listingOpen"
      :mode="listingMode"
      :initial-item="listingItem"
      :initial-step="listingInitialStep"
      @end-preorder="onEndPreorder"
      @saved="onListingSaved"
      @save-draft="onListingSaveDraft"
    />

    <MerchFilterPopup
      v-model="showFilterPopup"
      :items="libraryItems"
      :applied-filters="appliedFilters"
      @apply="onFilterApply"
    />

    <Teleport to="body">
      <div
        v-if="showToast"
        class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto animate-in fade-in slide-in-from-top duration-300 sm:left-auto sm:right-2 sm:top-2 sm:w-[min(30rem,calc(100vw-1rem))] sm:slide-in-from-right"
      >
        <NotificationCard
          v-model="showToast"
          variant="success-teal"
          theme="planTierToast"
          :title="toastTitle"
          :closable="toastKind !== 'keepInStore' && toastKind !== 'unpublishPreorder'"
        >
          <template #icon>
            <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
              <!-- Edit Keep-in-store: profile check-circle -->
              <img
                v-if="(toastKind === 'keepInStore' || toastKind === 'unpublishPreorder') && profileCheckCircleUrl"
                :src="profileCheckCircleUrl"
                alt=""
                class="h-7 w-7 object-contain"
              >
              <img
                v-else-if="toastThumb"
                :src="toastThumb"
                alt=""
                class="w-full h-full object-cover"
              >
              <!-- New merch submitted / other: success tick (not product thumb) -->
              <img
                v-else-if="successTickUrl"
                :src="successTickUrl"
                alt=""
                class="w-7 h-7 object-contain"
              >
            </div>
          </template>
          <template v-if="toastKind === 'keepInStore'" #actions>
            <div class="flex w-full items-end justify-end gap-2 pt-1">
              <DashboardPrimaryButton
                :text="t('shops.merch.library.toast.viewInStore')"
                theme="merchToastViewInStore"
                type="button"
              >
                <template #rightIcon>
                  <svg
                    class="h-4 w-4 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 11.5 11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </template>
              </DashboardPrimaryButton>
            </div>
          </template>
        </NotificationCard>
      </div>
    </Teleport>
  </DashboardSharedTwoColLayout>
</template>
