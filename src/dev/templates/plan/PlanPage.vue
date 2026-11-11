  <script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import TierCard from '@/components/ui/card/dashboard/TierCard.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import SubscriptionTierPopup from '@/dev/components/ui/popups/plan/SubscriptionTierPopup.vue';
import PlanConfirmPopup from '@/dev/components/ui/popups/plan/PlanConfirmPopup.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import {
  MAX_FREE_TIERS,
  MAX_PAID_TIERS,
  useSubscriptionTiersEngine,
} from '@/dev/composables/useSubscriptionTiersEngine.js';
import { mapPublishStateToTierCard } from '@/dev/utils/plan/mapPublishStateToTierCard.js';

const { t } = useI18n();
const isAddTierPopupOpen = ref(false);
/** When set, SubscriptionTierPopup hydrates this tier (edit / add media). */
const tierPopupEntry = ref(null);
const showUpgradeBanner = ref(false);
const showPublishToast = ref(false);
const publishToastWasUpdate = ref(false);
const publishToastTierName = ref('');
/** `publish` | `deleted` | `unpublished` — drives toast copy */
const statusToastKind = ref('publish');
let publishToastTimer = null;
const showActionConfirm = ref(false);
/** `delete` | `publish` | `unpublish` */
const actionConfirmKind = ref('delete');
const actionConfirmTier = ref(null);
const { assets } = usePlanAssets();
const { url: defaultTierBgUrl } = useAssetUrl('tier.demo.background');
const tiersScrollerRef = ref(null);
const upgradeBannerRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let scrollerResizeObserver = null;

/** Pink #FF0066 chevron for carousel arrows */
const scrollArrowIconClass =
  'h-5 w-5 [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(98%)_saturate(7492%)_hue-rotate(330deg)_brightness(98%)_contrast(107%)]';
const scrollArrowBtnClass =
  'pointer-events-auto absolute top-1/2 z-[40] flex h-12 w-12 -translate-y-1/2 items-center justify-center border-[1.5px] border-solid border-[#FF0066] bg-[#FFFFFFCC] backdrop-blur-[20px] disabled:opacity-40 disabled:cursor-default';


function updateScrollerArrows() {
  const el = tiersScrollerRef.value;
  if (!el) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }
  const maxScroll = el.scrollWidth - el.clientWidth;
  const overflows = maxScroll > 2;
  canScrollLeft.value = overflows && el.scrollLeft > 2;
  canScrollRight.value = overflows && el.scrollLeft < maxScroll - 2;
}

function scrollTiersBy(direction) {
  const el = tiersScrollerRef.value;
  if (!el) return;
  const step = Math.max(320, Math.floor(el.clientWidth * 0.8));
  el.scrollBy({ left: direction * step, behavior: 'smooth' });
}

function bindScrollerObserver() {
  const el = tiersScrollerRef.value;
  if (!el || typeof ResizeObserver === 'undefined') return;
  scrollerResizeObserver?.disconnect();
  scrollerResizeObserver = new ResizeObserver(() => updateScrollerArrows());
  scrollerResizeObserver.observe(el);
}

const {
  tiers,
  activeTab,
  publishedTiers,
  draftTiers,
  visibleTiers,
  atPublishLimit,
  maxPublishedSlots,
  isFreeTierEntry,
  canPublishEntry,
  upsertTier,
  removeTier,
  loadPlans,
} = useSubscriptionTiersEngine();

const hasAnyTiers = computed(
  () => publishedTiers.value.length > 0 || draftTiers.value.length > 0,
);

/** Free plan: 1 free + 3 paid — upgrade only when every slot is full. */
const isAtPublishCapacity = computed(
  () => atPublishLimit.value || publishedTiers.value.length >= maxPublishedSlots,
);

/** After all free+paid slots are used → Upgrade CTA instead of NEW TIER. */
const showUpgradeCta = computed(
  () => activeTab.value === 'published' && isAtPublishCapacity.value,
);

const showUpgradeBannerSection = computed(
  () => hasAnyTiers.value && (showUpgradeCta.value || showUpgradeBanner.value),
);

async function revealUpgradeWarning() {
  activeTab.value = 'published';
  showUpgradeBanner.value = true;
  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  upgradeBannerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function onUpgradeCtaClick() {
  void revealUpgradeWarning();
}

const statusTabs = computed(() => [
  {
    id: 'published',
    label: t('plan.page.tabPublished', { count: publishedTiers.value.length }),
  },
  {
    id: 'draft',
    label: t('plan.page.tabDraft', { count: draftTiers.value.length }),
  },
]);

/** List Publish enabled only when Plan Detail media checkboxes are selected. */
function resolveEntryHasMedia(entry) {
  const selected = entry?.formValues?.selectedMediaOptions;
  return Array.isArray(selected) && selected.length > 0;
}

function rebuildCard(entry, patch = {}) {
  const next = { ...entry, ...patch };
  const hasMedia = resolveEntryHasMedia(next);
  const card = mapPublishStateToTierCard({
    state: next.formValues || {},
    t,
    defaultBgUrl: defaultTierBgUrl.value,
    status: next.status,
    id: next.id,
    followers: next.followers || 0,
    hasMedia,
    listMode: true,
  });
  return { ...next, hasMedia, card, isFreeTier: card.isFreeTier };
}

const listCards = computed(() =>
  visibleTiers.value.map((entry) => {
    const hasMedia = resolveEntryHasMedia(entry);
    const base =
      entry.card?.settingsList
        ? { ...entry.card, hasMedia }
        : mapPublishStateToTierCard({
            state: entry.formValues || {},
            t,
            defaultBgUrl: defaultTierBgUrl.value,
            status: entry.status,
            id: entry.id,
            followers: entry.followers || 0,
            hasMedia,
            listMode: true,
          });
    return {
      ...base,
      id: entry.id,
      status: entry.status,
      followers: entry.followers || 0,
      hasMedia,
      canPublishSlot: canPublishEntry(entry),
      isFeatured: Boolean(entry.formValues?.isFeaturedTier ?? base.isFeatured),
    };
  }),
);

function findTierEntry(tier) {
  return (tiers.value || []).find((item) => item.id === tier?.id) || null;
}

function openTierPopup(entry = null) {
  // Snapshot so popup always shows this tier’s values (not a live shared ref).
  tierPopupEntry.value = entry
    ? {
        ...entry,
        formValues: entry.formValues
          ? JSON.parse(JSON.stringify(entry.formValues))
          : {},
      }
    : null;
  isAddTierPopupOpen.value = true;
}

function openNewTier() {
  if (showUpgradeCta.value) return;
  openTierPopup(null);
}

function onSettingsEdit(tier) {
  const entry = findTierEntry(tier);
  if (!entry) return;
  openTierPopup(entry);
}

function onSettingsAddMedia(tier) {
  const entry = findTierEntry(tier);
  if (!entry) return;
  openTierPopup(entry);
}

function resolveToastTierName(entryOrTier) {
  const raw = String(
    entryOrTier?.formValues?.tierName
      || entryOrTier?.card?.title
      || entryOrTier?.title
      || '',
  ).trim() || t('plan.confirm.untitledTier');
  const featured = Boolean(
    entryOrTier?.formValues?.isFeaturedTier
      ?? entryOrTier?.isFeatured
      ?? entryOrTier?.card?.isFeatured,
  );
  return featured ? t('plan.toast.featuredName', { name: raw }) : raw;
}

function openStatusToast({ entry, kind = 'publish', wasUpdate = false } = {}) {
  statusToastKind.value = kind;
  publishToastWasUpdate.value = Boolean(wasUpdate);
  publishToastTierName.value = resolveToastTierName(entry);
  showPublishToast.value = true;
  if (publishToastTimer) clearTimeout(publishToastTimer);
  publishToastTimer = setTimeout(() => {
    showPublishToast.value = false;
    publishToastTimer = null;
  }, 6000);
}

const statusToastTitle = computed(() => {
  if (statusToastKind.value === 'deleted') return t('plan.toast.deletedTitle');
  if (statusToastKind.value === 'unpublished') return t('plan.toast.unpublishedTitle');
  return t('plan.toast.detailsUpdated');
});

const statusToastDescription = computed(() => {
  const name = publishToastTierName.value;
  if (statusToastKind.value === 'deleted') return t('plan.toast.deleted', { name });
  if (statusToastKind.value === 'unpublished') return t('plan.toast.unpublished', { name });
  return publishToastWasUpdate.value
    ? t('plan.toast.updatedAndPublished', { name })
    : t('plan.toast.published', { name });
});

const actionConfirmHasFollowers = computed(
  () => Number(actionConfirmTier.value?.followers) > 0,
);

const actionConfirmMessage = computed(() => {
  if (actionConfirmKind.value === 'unpublish') return t('plan.confirm.unpublishMessage');
  if (actionConfirmKind.value === 'publish') return t('plan.confirm.publishMessage');
  return actionConfirmHasFollowers.value
    ? t('plan.confirm.deleteWithUndo')
    : t('plan.confirm.deleteQuestion');
});

function openActionConfirm(kind, tier) {
  const entry = findTierEntry(tier) || tier;
  if (!entry?.id) return;
  actionConfirmKind.value = kind;
  actionConfirmTier.value = entry;
  showActionConfirm.value = true;
}

function onActionConfirmCancel() {
  showActionConfirm.value = false;
  actionConfirmTier.value = null;
}

function onActionConfirmOk() {
  const entry = actionConfirmTier.value;
  const kind = actionConfirmKind.value;
  showActionConfirm.value = false;
  actionConfirmTier.value = null;
  if (!entry?.id) return;

  if (kind === 'delete') {
    // Followers on published tier — confirm only (no delete).
    if (entry.status === 'published' && Number(entry.followers) > 0) return;
    removeTier(entry.id);
    openStatusToast({ entry, kind: 'deleted' });
    return;
  }

  if (kind === 'unpublish') {
    upsertTier(rebuildCard(entry, { status: 'draft' }));
    activeTab.value = 'draft';
    openStatusToast({ entry, kind: 'unpublished' });
    return;
  }

  if (kind === 'publish') {
    if (!resolveEntryHasMedia(entry) || !canPublishEntry(entry)) {
      if (!canPublishEntry(entry)) void revealUpgradeWarning();
      return;
    }
    const wasUpdate = entry.status === 'published';
    const next = rebuildCard(entry, { status: 'published' });
    upsertTier(next);
    activeTab.value = 'published';
    openStatusToast({ entry: next, kind: 'publish', wasUpdate });
    if (isAtPublishCapacity.value) void revealUpgradeWarning();
  }
}

function onTierPublished({ entry, wasUpdate = false } = {}) {
  // Safety: if popup somehow published past 1 free / 3 paid, demote to draft.
  if (!wasUpdate && entry?.id) {
    const live = publishedTiers.value;
    const freeCount = live.filter((tier) => isFreeTierEntry(tier)).length;
    const paidCount = live.length - freeCount;
    const overLimit =
      live.length > maxPublishedSlots
      || freeCount > MAX_FREE_TIERS
      || paidCount > MAX_PAID_TIERS;
    if (overLimit) {
      upsertTier(rebuildCard(entry, { status: 'draft' }));
      activeTab.value = 'draft';
      void revealUpgradeWarning();
      return;
    }
  }
  activeTab.value = 'published';
  openStatusToast({ entry, kind: 'publish', wasUpdate });
  if (isAtPublishCapacity.value) void revealUpgradeWarning();
}

function onPublishBlocked({ entry } = {}) {
  if (entry?.id) {
    upsertTier(rebuildCard(entry, { status: 'draft' }));
    activeTab.value = 'draft';
  }
  void revealUpgradeWarning();
}

function onSettingsPublish(tier) {
  const entry = findTierEntry(tier);
  if (!entry || !resolveEntryHasMedia(entry)) return;
  if (!canPublishEntry(entry)) {
    void revealUpgradeWarning();
    return;
  }
  openActionConfirm('publish', entry);
}

function onSettingsUnpublish(tier) {
  const entry = findTierEntry(tier);
  if (!entry) return;
  openActionConfirm('unpublish', entry);
}

function onSettingsDelete(tier) {
  if (!tier?.id) return;
  openActionConfirm('delete', tier);
}

function onSettingsFeature(tier, featured) {
  const entry = visibleTiers.value.find((item) => item.id === tier?.id);
  if (!entry) return;
  const formValues = {
    ...(entry.formValues || {}),
    isFeaturedTier: featured,
  };
  upsertTier(rebuildCard(entry, { formValues }));
}

watch(
  listCards,
  async () => {
    await nextTick();
    bindScrollerObserver();
    updateScrollerArrows();
  },
  { deep: true },
);

onMounted(async () => {
  // GET /plans — restore persisted tiers (do not wipe on refresh).
  await loadPlans();
  await nextTick();
  bindScrollerObserver();
  updateScrollerArrows();
  window.addEventListener('resize', updateScrollerArrows);
});

onBeforeUnmount(() => {
  scrollerResizeObserver?.disconnect();
  scrollerResizeObserver = null;
  window.removeEventListener('resize', updateScrollerArrows);
  if (publishToastTimer) clearTimeout(publishToastTimer);
});
</script>

<template>
  <DashboardSharedTwoColLayout>
    <div
      data-component="plan-page"
      class="relative flex min-h-screen flex-col"
    >
      <div class="relative z-[1] flex flex-1 flex-col px-5 py-6 md:px-10 md:py-8">
      <header class="relative z-[1] shrink-0">
        <Heading
          tag="h1"
          theme="custom"
          no-wrap
          add-class="text-[30px] font-medium leading-normal text-[#475467] md:text-[1.75rem] dark:text-[#bdb8af]"
          :text="t('plan.page.settingsTitle')"
        />
        <Paragraph
          theme="custom"
          no-wrap
          add-class="mt-2 text-sm font-normal leading-5 text-[#344054] dark:text-[#98a2b3]"
          :text="t('plan.page.settingsDescription')"
        />
      </header>

      <div
        v-if="!hasAnyTiers"
        class="relative z-[1] flex flex-1 flex-col gap-2 items-center justify-center py-16"
      >
        <div class="relative">
          <img
            v-if="assets.emptyKeyhole"
            :src="assets.emptyKeyhole"
            :alt="t('plan.page.alt.emptyKeyhole')"
            class="h-[146.67px] w-[146.67px] mb-1 object-contain md:h-36 md:w-36"
          />
        </div>

        <Paragraph
          theme="custom"
          no-wrap
          add-class="text-center text-[16px] font-normal leading-5 text-[#667085] dark:text-[#98a2b3]"
          :text="t('plan.page.emptyMessage')"
        />

        <DashboardPrimaryButton
          :text="t('plan.page.newTier')"
          variant="mediaBtn"
          :leftIcon="assets.newTierPlus"
          leftIconClass="!w-[14px] !h-[14px] object-contain group-hover:brightness-0"
          textClass="!text-[18px] !font-medium !leading-normal"
          customClass="!min-w-0 !gap-1 !px-3 uppercase"
          type="button"
          @click="openNewTier"
        />

        <button
          type="button"
          class="text-sm font-medium leading-5 text-[#667085] underline underline-offset-2 transition-colors hover:text-[#344054] dark:text-[#98a2b3] dark:hover:text-[#bdb8af]"
        >
          {{ t('plan.page.faq') }}
        </button>
      </div>

      <div v-else class="relative z-[1] mt-6 flex flex-1 flex-col gap-6 min-h-0">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <MediaUploadTypeTabs
            v-model="activeTab"
            :tabs="statusTabs"
            tabs-only
            :tabs-aria-label="t('plan.page.settingsTitle')"
            list-class="!inline-flex !w-auto border-[#D0D5DD] bg-[#F9FAFB80] dark:border-[#303436] dark:bg-[#1e2022]"
            active-class="bg-white text-[#0C111D] font-medium dark:bg-[#181a1b] dark:text-[#dbd8d3]"
            inactive-class="bg-transparent text-[#667085] font-medium dark:text-[#9e9689]"
            tab-class="!flex-none"
          />

          <DashboardPrimaryButton
            v-if="showUpgradeCta"
            :text="t('plan.page.upgradeToAddMore')"
            variant="none"
            :leftIcon="assets.newTierPlus"
            leftIconClass="!w-[14px] !h-[14px] object-contain brightness-0 transition-[filter] duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]"
            textClass="!text-[18px] !font-medium !leading-normal text-inherit"
            customClass="group !min-w-0 !h-10 !gap-1 !px-3 uppercase !bg-[#07F468] !text-[#0C111D] enabled:hover:!bg-[#0C111D] enabled:hover:!text-[#07F468]"
            type="button"
            @click="onUpgradeCtaClick"
          />
          <DashboardPrimaryButton
            v-else
            :text="t('plan.page.newTier')"
            variant="mediaBtn"
            :leftIcon="assets.newTierPlus"
            leftIconClass="!w-[14px] !h-[14px] object-contain group-hover:brightness-0"
            textClass="!text-[18px] !font-medium !leading-normal"
            customClass="!min-w-0 !gap-1 !px-3 uppercase"
            type="button"
            @click="openNewTier"
          />
        </div>

        <div class="relative w-full overflow-visible">
          <div
            ref="tiersScrollerRef"
            class="flex w-full gap-4 overflow-x-auto overflow-y-visible pb-16 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            @scroll.passive="updateScrollerArrows"
          >
            <div
              v-for="card in listCards"
              :key="card.id"
              class="snap-start shrink-0"
            >
              <TierCard
                :tier="card"
                @settings-edit="onSettingsEdit"
                @settings-add-media="onSettingsAddMedia"
                @settings-publish="onSettingsPublish"
                @settings-unpublish="onSettingsUnpublish"
                @settings-delete="onSettingsDelete"
                @settings-feature="onSettingsFeature($event, true)"
                @settings-unfeature="onSettingsFeature($event, false)"
              />
            </div>
          </div>

          <!-- Both arrows always visible when the row overflows -->
          <template v-if="canScrollLeft || canScrollRight">
            <button
              type="button"
              :class="[scrollArrowBtnClass, 'left-0']"
              :aria-label="t('plan.page.alt.scrollTiersLeft')"
              :disabled="!canScrollLeft"
              @click="scrollTiersBy(-1)"
            >
              <img
                :src="assets.chevronLeft"
                alt=""
                :class="scrollArrowIconClass"
              />
            </button>
            <button
              type="button"
              :class="[scrollArrowBtnClass, 'right-0']"
              :aria-label="t('plan.page.alt.scrollTiersRight')"
              :disabled="!canScrollRight"
              @click="scrollTiersBy(1)"
            >
              <img
                :src="assets.chevronLeft"
                alt=""
                :class="[scrollArrowIconClass, 'rotate-180']"
              />
            </button>
          </template>
        </div>

      </div>
            </div>

      <div
        v-if="showUpgradeBannerSection"
        ref="upgradeBannerRef"
        class="mt-auto w-full shrink-0"
      >
        <NotificationCard
          v-model="showUpgradeBanner"
          variant="alert"
          theme="planUpgrade"
          :title="t('plan.page.upgradeBannerTitle')"
          :description="t('plan.page.upgradeBannerDescription')"
        >
          <template #actions>
            <div class="flex flex-wrap items-center gap-4">
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-[#344054] underline-offset-2 hover:underline dark:text-[#bdb8af]"
              >
                {{ t('plan.page.learnMore') }}
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
                </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs font-medium text-[#B54708] underline-offset-2 hover:underline"
              >
                {{ t('plan.page.upgradeNow') }}
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
              </button>
            </div>
          </template>
        </NotificationCard>
                  </div>

      <SubscriptionTierPopup
        v-model="isAddTierPopupOpen"
        :edit-entry="tierPopupEntry"
        @published="onTierPublished"
        @publish-blocked="onPublishBlocked"
      />

      <PlanConfirmPopup
        v-model="showActionConfirm"
        variant="actionConfirm"
        :message="actionConfirmMessage"
        max-width="26rem"
        @primary="onActionConfirmOk"
        @secondary="onActionConfirmCancel"
      />

      <Teleport to="body">
        <div
          v-if="showPublishToast"
          class="pointer-events-none fixed right-2 top-2 z-[9999] h-max w-[calc(100%-1rem)] sm:w-[30rem]"
        >
          <div class="pointer-events-auto">
            <NotificationCard
              v-model="showPublishToast"
              variant="success-teal"
              theme="planTierToast"
              :title="statusToastTitle"
              :description="statusToastDescription"
            >
              <template #icon>
                <div class="relative h-10 w-10 shrink-0">
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#2ED3B71A]">
                    <img
                      v-if="assets.toastKeyhole"
                      :src="assets.toastKeyhole"
                      alt=""
                      class="h-[15px] w-[10px] object-contain"
                    >
                  </div>
                  <div
                    class="absolute -bottom-[0.563rem] -right-[0.563rem] flex h-[1.375rem] w-[1.375rem] items-center justify-center overflow-hidden rounded-full bg-[#2ed3b7]"
                  >
                    <img
                      v-if="assets.toastUploadCloud"
                      :src="assets.toastUploadCloud"
                      alt=""
                      class="h-3.5 w-3.5 object-contain mix-blend-screen"
                    >
                  </div>
                </div>
              </template>
              <template #actions>
                <div class="flex w-full items-end justify-between gap-2 pt-1">
                  <span class="text-xs leading-[1.125rem] text-[#98A2B3]">
                    {{ t('plan.toast.justNow') }}
                  </span>
                <button
                    type="button"
                    class="group inline-flex items-center gap-0.5 text-xs font-medium leading-[1.125rem] text-teal-400"
                  >
                    {{ t('plan.toast.viewInProfile') }}
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
                </button>
              </div>
              </template>
            </NotificationCard>
          </div>
        </div>
      </Teleport>
    </div>
  </DashboardSharedTwoColLayout>
</template>
