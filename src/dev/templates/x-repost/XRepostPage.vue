<template>
  <DashboardSharedTwoColLayout no-padding lock-viewport>
    <div class="twitter-post-page relative flex h-full min-h-0 flex-col overflow-hidden">
      <div class="flex shrink-0 flex-col gap-4 p-2 md:px-5 md:pt-5 lg:px-10 lg:pt-10">
        <Heading
          tag="h1"
          theme="custom"
          no-wrap
          :text="t('dashboard.xRepost.title')"
          add-class="text-[14px] md:text-[30px]  leading-[38px] font-medium text-[#475467] dark:text-[#ACBACF]"
        />
        <Paragraph
          no-wrap
          font-size=""
          font-weight=""
          font-color=""
          :text="t('dashboard.xRepost.subtitle')"
          class="text-sm leading-5 font-normal text-[#344054] dark:text-[#bdb7af]"
        />
      </div>

      <div
        v-if="rules.length"
        class=" flex min-h-0 flex-1 flex-col"
      >
        <div class="mb-2 flex h-10 shrink-0 items-center justify-between gap-4 px-2 lg:px-10">
          <div class="x-repost-tabs flex h-10 items-center">
            <DashboardTabs
              v-model="currentTab"
              :tabs="tabList"
              tabs-only
              active-tab-class="bg-[#FFFFFF] text-[#0C111D] font-semibold"
              inactive-tab-class="bg-transparent text-[#667085] font-medium hover:bg-transparent"
            />
          </div>

          <XRepostTypeFilterDropdown
            v-model="selectedTypeFilter"
            :assets="assets"
          />
        </div>

        <div class="flex min-h-0 flex-1 flex-col">
          <div
            v-if="isMobileList"
            class="scrollbar-hide flex min-h-0 flex-1 flex-col gap-px overflow-y-auto overscroll-contain bg-[#F3F1F6] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <XRepostRuleCard
              v-for="rule in filteredRules"
              :key="rule.id"
              :rule="rule"
              :assets="assets"
              @request-delete="openDeleteConfirm"
              @preview-save="openPostPreview"
            />
          </div>

          <div v-else class="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              class="flex h-[34px] shrink-0 items-stretch border-b-[0.5px] border-b-[#D0D5DD]"
              :style="headerBarStyle"
            >
              <span class="flex w-[200px] shrink-0 items-center px-3 text-xs font-medium capitalize text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('dashboard.xRepost.columns.type') }}
              </span>
              <div class="min-w-0 flex-1 overflow-hidden">
                <div
                  class="flex h-full w-max items-stretch"
                  :style="{ transform: `translate3d(${-tableScrollLeft}px, 0, 0)` }"
                >
                  <span class="flex w-[200px] shrink-0 items-center px-3 text-xs font-medium capitalize text-[#0C111D] dark:text-[#dbd8d3]">
                    {{ t('dashboard.xRepost.columns.metric') }}
                  </span>
                  <span class="flex w-[200px] shrink-0 items-center px-3 text-xs font-medium capitalize text-[#0C111D] dark:text-[#dbd8d3]">
                    {{ t('dashboard.xRepost.columns.conditions') }}
                  </span>
                </div>
              </div>
              <div class="flex w-[188px] shrink-0 items-stretch">
                <span class="flex w-[148px] shrink-0 items-center px-3" aria-hidden="true"></span>
                <span class="flex w-10 shrink-0 items-center" aria-hidden="true"></span>
              </div>
            </div>

            <div
              ref="tableScrollEl"
              class="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-auto bg-[#F3F1F6]"
              @scroll="onTableScroll"
            >
              <div class="flex w-full min-w-max flex-col">
                <XRepostRuleRow
                  v-for="rule in filteredRules"
                  :key="rule.id"
                  :rule="rule"
                  :assets="assets"
                  :dimmed="activeDropdownRuleId !== null && activeDropdownRuleId !== rule.id"
                  :is-dropdown-active="activeDropdownRuleId === rule.id"
                  @update:rule="(next) => updateRuleById(rule.id, next)"
                  @request-delete="openDeleteConfirm"
                  @request-discard="openDiscardConfirm"
                  @dropdown-open="onRowDropdownOpen"
                  @dropdown-close="onRowDropdownClose"
                  @preview-save="openPostPreview"
                />
              </div>
            </div>
          </div>

          <div class="relative z-[1] flex shrink-0 justify-end bg-[#F3F1F6] px-2 pb-1 pt-4 md:px-6 md:pb-6">
            <div class="relative inline-flex overflow-visible" data-x-repost-add-anchor>
              <TwoPieceButton
                variant="link-x"
                tag="button"
                type="button"
                :text="t('dashboard.xRepost.addNew')"
                content-wrapper-class="flex justify-center items-center gap-2.5 px-3 h-10 min-w-[134px] bg-[#07F468] group-hover:bg-black transition-all duration-300"
                text-class="text-sm font-medium text-black group-hover:text-[#07F468] transition-colors duration-300"
                @click.stop="isMenuOpen = true"
              >
                <template #icon>
                  <img
                    src="/images/plus-green-square.png"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5 brightness-0 transition-all duration-300 group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(61%)_saturate(638%)_hue-rotate(88deg)_brightness(101%)_contrast(92%)]"
                  />
                </template>
              </TwoPieceButton>

              <XRepostAddMenuPopup
                v-model="isMenuOpen"
                :assets="assets"
                @add="addRule"
                @preview-draft="completeMobileDraft"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-auto flex shrink-0 justify-end px-5 pb-5 pt-10 lg:px-10 lg:pb-10">
        <div class="relative inline-flex" data-x-repost-add-anchor>
          <TwoPieceButton
            variant="link-x"
            tag="button"
            type="button"
            :text="t('dashboard.xRepost.addNew')"
            content-wrapper-class="flex justify-center items-center gap-2.5 px-3 h-10 min-w-[134px] bg-[#07F468] group-hover:bg-black transition-all duration-300"
            text-class="text-sm font-medium text-black group-hover:text-[#07F468] transition-colors duration-300"
            @click.stop="isMenuOpen = true"
          >
            <template #icon>
              <img
                src="/images/plus-green-square.png"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5 brightness-0 transition-all duration-300 group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(61%)_saturate(638%)_hue-rotate(88deg)_brightness(101%)_contrast(92%)]"
              />
            </template>
          </TwoPieceButton>

              <XRepostAddMenuPopup
                v-model="isMenuOpen"
                :assets="assets"
                @add="addRule"
                @preview-draft="completeMobileDraft"
              />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showSavedToast"
        class="fixed top-2 right-2 z-[9999] w-[min(24rem,calc(100vw-1rem))] pointer-events-auto"
      >
        <NotificationCard
          v-model="showSavedToast"
          variant="success-teal"
          :title="t('dashboard.xRepost.savedToast')"
        >
          <template #icon>
            <div class="relative">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10">
                <img
                  v-if="assets.toastUpload"
                  :src="assets.toastUpload"
                  alt=""
                  class="h-7 w-7 object-contain"
                />
              </div>
              <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center">
                <img
                  v-if="assets.toastSuccess"
                  :src="assets.toastSuccess"
                  alt=""
                  class="h-[22px] w-[23px] object-contain"
                />
              </div>
            </div>
          </template>
        </NotificationCard>
      </div>
    </Teleport>

    <XRepostDeleteConfirmPopup
      v-model="showDeleteConfirm"
      @confirm="confirmDeleteRule"
    />

    <XRepostLeaveConfirmPopup
      v-model="showDiscardConfirm"
      @discard="confirmDiscardRule"
    />

    <XRepostPostPreviewPopup
      v-model="showPostPreview"
      :assets="assets"
      :rule="previewRule"
      @save-draft="onSaveDraft"
      @save-post="onSavePost"
      @update-post-message="onUpdatePostMessage"
    />
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';
import XRepostAddMenuPopup from '@/dev/components/ui/popups/x-repost/XRepostAddMenuPopup.vue';
import XRepostDeleteConfirmPopup from '@/dev/components/ui/popups/x-repost/XRepostDeleteConfirmPopup.vue';
import XRepostLeaveConfirmPopup from '@/dev/components/ui/popups/x-repost/XRepostLeaveConfirmPopup.vue';
import XRepostPostPreviewPopup from '@/dev/components/ui/popups/x-repost/XRepostPostPreviewPopup.vue';
import XRepostRuleRow from '@/dev/components/x-repost/XRepostRuleRow.vue';
import XRepostRuleCard from '@/dev/components/x-repost/XRepostRuleCard.vue';
import XRepostTypeFilterDropdown from '@/dev/components/x-repost/XRepostTypeFilterDropdown.vue';
import { createRule } from '@/dev/components/x-repost/xRepostConfig.js';
import { useXRepostAssets } from '@/dev/composables/useXRepostAssets.js';

const { t } = useI18n();
const { assets } = useXRepostAssets();

const MOBILE_MAX_WIDTH = 767;
const isMobileList = ref(typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH);

function syncMobileList() {
  isMobileList.value = typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH;
}

const tableScrollEl = ref(null);
const tableScrollLeft = ref(0);
const headerBarWidth = ref(0);
let headerWidthObserver = null;

const headerBarStyle = computed(() => ({
  width: headerBarWidth.value ? `${headerBarWidth.value}px` : '100%',
}));

function onTableScroll() {
  tableScrollLeft.value = tableScrollEl.value?.scrollLeft ?? 0;
}

function syncHeaderBarWidth() {
  headerBarWidth.value = tableScrollEl.value?.clientWidth ?? 0;
}

onMounted(() => {
  syncMobileList();
  window.addEventListener('resize', syncMobileList);
  syncHeaderBarWidth();
  if (typeof ResizeObserver === 'undefined' || !tableScrollEl.value) return;
  headerWidthObserver = new ResizeObserver(() => {
    syncHeaderBarWidth();
  });
  headerWidthObserver.observe(tableScrollEl.value);
});

const isMenuOpen = ref(false);
const rules = ref([]);
const currentTab = ref('all');
const selectedTypeFilter = ref('all');
const activeDropdownRuleId = ref(null);
const showSavedToast = ref(false);
const showDeleteConfirm = ref(false);
const pendingDeleteRuleId = ref(null);
const showDiscardConfirm = ref(false);
const pendingDiscardRuleId = ref(null);
const showPostPreview = ref(false);
const previewRule = ref(null);
let savedToastTimer = null;

const tabList = computed(() => [
  {
    id: 'all',
    labelKey: 'dashboard.xRepost.filters.tabs.all',
    count: rules.value.length,
  },
  {
    id: 'published',
    labelKey: 'dashboard.xRepost.filters.tabs.published',
    count: rules.value.filter((rule) => rule.status === 'published').length,
  },
  {
    id: 'draft',
    labelKey: 'dashboard.xRepost.filters.tabs.draft',
    count: rules.value.filter((rule) => rule.status === 'draft').length,
  },
]);

const filteredRules = computed(() => {
  let list = rules.value;

  if (currentTab.value === 'published') {
    list = list.filter((rule) => rule.status === 'published');
  } else if (currentTab.value === 'draft') {
    list = list.filter((rule) => rule.status === 'draft');
  }

  if (selectedTypeFilter.value !== 'all') {
    list = list.filter((rule) => rule.type === selectedTypeFilter.value);
  }

  return list;
});

function clearSavedToastTimer() {
  if (savedToastTimer != null) {
    clearTimeout(savedToastTimer);
    savedToastTimer = null;
  }
}

function showSavedToastNotification() {
  clearSavedToastTimer();
  showSavedToast.value = true;
  savedToastTimer = setTimeout(() => {
    showSavedToast.value = false;
    savedToastTimer = null;
  }, 5000);
}

onBeforeUnmount(() => {
  clearSavedToastTimer();
  window.removeEventListener('resize', syncMobileList);
  headerWidthObserver?.disconnect();
  headerWidthObserver = null;
});

watch(isMobileList, async (mobile) => {
  if (mobile) {
    headerWidthObserver?.disconnect();
    headerWidthObserver = null;
    return;
  }
  await nextTick();
  syncHeaderBarWidth();
  if (typeof ResizeObserver === 'undefined' || !tableScrollEl.value || headerWidthObserver) return;
  headerWidthObserver = new ResizeObserver(() => {
    syncHeaderBarWidth();
  });
  headerWidthObserver.observe(tableScrollEl.value);
});

watch(showDeleteConfirm, (open) => {
  if (!open) pendingDeleteRuleId.value = null;
});

watch(showDiscardConfirm, (open) => {
  if (!open) pendingDiscardRuleId.value = null;
});

function onRowDropdownOpen(ruleId) {
  activeDropdownRuleId.value = ruleId;
}

function onRowDropdownClose(ruleId) {
  if (activeDropdownRuleId.value === ruleId) {
    activeDropdownRuleId.value = null;
  }
}

function openDeleteConfirm(ruleId) {
  pendingDeleteRuleId.value = ruleId;
  nextTick(() => {
    showDeleteConfirm.value = true;
  });
}

function openDiscardConfirm(ruleId) {
  pendingDiscardRuleId.value = ruleId;
  nextTick(() => {
    showDiscardConfirm.value = true;
  });
}

function openPostPreview(rule) {
  previewRule.value = rule;
  nextTick(() => {
    showPostPreview.value = true;
  });
}

function upsertSavedRule(rule, status) {
  if (!rule) return;
  const next = { ...rule, status };
  const current = next.id != null
    ? rules.value.find((item) => item.id === next.id)
    : null;
  if (current) {
    updateRuleById(current.id, { ...current, ...next });
    return;
  }
  rules.value.push(next.id ? next : { ...createRule({ type: next.type, metric: next.metric }), ...next });
}

function onSaveDraft(rule) {
  upsertSavedRule(rule, 'draft');
  showSavedToastNotification();
}

function onSavePost(rule) {
  upsertSavedRule(rule, 'published');
  showSavedToastNotification();
}

function onUpdatePostMessage({ id, postMessage }) {
  if (id == null) return;
  if (previewRule.value?.id === id) {
    previewRule.value = { ...previewRule.value, postMessage };
  }
  const current = rules.value.find((item) => item.id === id);
  if (!current) return;
  updateRuleById(id, { ...current, postMessage });
}

function confirmDeleteRule() {
  if (pendingDeleteRuleId.value != null) {
    removeRule(pendingDeleteRuleId.value);
  }
}

function confirmDiscardRule() {
  if (pendingDiscardRuleId.value != null) {
    removeRule(pendingDiscardRuleId.value);
  }
}

function addRule({ type, metric }) {
  rules.value.push(createRule({ type, metric }));
  showSavedToastNotification();
}

function completeMobileDraft(payload) {
  const rule = {
    ...createRule({ type: payload.type, metric: payload.metric }),
    ...payload,
    status: 'unsaved',
  };
  openPostPreview(rule);
}

function updateRuleById(ruleId, next) {
  const index = rules.value.findIndex((rule) => rule.id === ruleId);
  if (index !== -1) {
    rules.value.splice(index, 1, next);
  }
}

function removeRule(ruleId) {
  rules.value = rules.value.filter((rule) => rule.id !== ruleId);
}
</script>

<style scoped>
.x-repost-tabs :deep(> div) {
  display: flex;
  align-items: center;
  height: 40px;
}

.x-repost-tabs :deep(> div > div:first-child) {
  background: #f9fafb80 !important;
  border: 1px solid #d0d5dd;
  border-radius: 5px;
  padding: 0;
  overflow: hidden;
  height: 40px;
  align-items: stretch;
}

.x-repost-tabs :deep(> div > div:first-child > div) {
  border-radius: 0 !important;
  min-height: 40px;
  padding-inline: 16px;
}

.x-repost-tabs :deep(> div > div:first-child > div:not(:last-child)) {
  border-right: 1px solid #d0d5dd;
}
</style>
