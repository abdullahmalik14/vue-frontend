<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import RadioGroup from '@/components/forms/radio/dashboard/RadioGroup.vue';
import VueDatePicker from '@/components/forms/date-picker/VueDatePicker.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import EndPreorderPopup from '@/dev/components/ui/popups/shops/EndPreorderPopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const props = defineProps({
  /** createStepStateEngine instance for this merch listing flow */
  engine: { type: Object, required: true },
  /** Edit listing only — never on New Merch create. */
  isEditMode: { type: Boolean, default: false },
  /** Library status is currently `preorder` (live period). Not the form toggle. */
  isActivePreorder: { type: Boolean, default: false },
});

const emit = defineEmits(['end-preorder']);

const { t, locale } = useI18n();
const { assets } = usePlanAssets();
const { url: publishIconUrl } = useAssetUrl('mediaUploader.icon.publish');
const { url: scheduleIconUrl } = useAssetUrl('mediaUploader.icon.schedule');
const { url: infoIconUrl } = useAssetUrl('mediaUploader.icon.info');
const { url: preorderNoticeIconUrl } = useAssetUrl('icon.notification.infoSquare');

const SCOPE_ID = 'merchListingPublish';
const PREORDER_MIN = 0;
const PREORDER_MAX = 1000;

const openPicker = ref(null);
const publishDateFieldRef = ref(null);
const attemptedSubmit = ref(false);
const rootEl = ref(null);
const preorderBannerOpen = ref(true);
const endPreorderOpen = ref(false);

const publishSubstep = computed({
  get: () => props.engine.state.publishSubstep || 'publishImmediately',
  set: (val) => props.engine.setState('publishSubstep', val),
});

const publishDate = computed({
  get: () => props.engine.state.publishDate || '',
  set: (val) => props.engine.setState('publishDate', val ?? ''),
});

const openForPreorder = computed({
  get: () => !!props.engine.state.openForPreorder,
  set: (val) => props.engine.setState('openForPreorder', !!val),
});

const preorderPrice = computed({
  get: () => props.engine.state.preorderPrice ?? '',
  set: (val) => props.engine.setState('preorderPrice', val),
});

const afterPreorderAction = computed({
  get: () => props.engine.state.afterPreorderAction || 'keepInStore',
  set: (val) => props.engine.setState('afterPreorderAction', val),
});

/**
 * Pre-order period notice + Stop Pre-Order — edit + active period
 * (preorder / reviewing / published with openForPreorder). Not for draft after stop.
 */
const showPreorderBanner = computed(
  () => props.isEditMode && props.isActivePreorder && openForPreorder.value,
);

watch(showPreorderBanner, (show) => {
  if (show) preorderBannerOpen.value = true;
});

function openEndPreorderPopup() {
  endPreorderOpen.value = true;
}

function onEndPreorderConfirm(action) {
  afterPreorderAction.value = action;
  openForPreorder.value = false;
  emit('end-preorder', {
    action,
    productName: String(props.engine.state.productName || '').trim(),
  });
}

const publishTabs = computed(() => [
  {
    id: 'publishImmediately',
    label: t('shops.merch.listing.publish.publishImmediately'),
    icon: publishIconUrl.value,
  },
  {
    id: 'schedulePublish',
    label: t('shops.merch.listing.publish.schedulePublish'),
    icon: scheduleIconUrl.value,
  },
]);

const afterPreorderOptions = computed(() => [
  {
    value: 'keepInStore',
    label: t('shops.merch.listing.publish.keepInStore'),
  },
  {
    value: 'unpublish',
    label: t('shops.merch.listing.publish.unpublishFromStore'),
  },
]);

const datePickerConfig = computed(() => ({
  mode: 'single',
  layout: 'single',
  enableTime: true,
  format: 'MM/DD/YYYY HH:mm:ss',
  alarmIcon: assets.value.alarm || '',
  style: {
    theme: 'pink',
    rounded: 'rounded-none',
    shadow: 'shadow-[0px_4px_20px_0px_rgba(0,0,0,0.10)]',
    border: 'border-0',
  },
}));

/** Minimum schedule time: now + 2 days (local), same rule as media publish. */
function getScheduleMinDate() {
  const min = new Date();
  min.setDate(min.getDate() + 2);
  min.setSeconds(0, 0);
  return min;
}

function formatPublishDateLabel(date) {
  try {
    return new Intl.DateTimeFormat(locale.value || undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

function parsePublishDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isPublishDateValid(value) {
  if (props.engine.state.publishSubstep !== 'schedulePublish') return true;
  const selected = parsePublishDate(value);
  if (!selected) return false;
  return selected.getTime() >= getScheduleMinDate().getTime();
}

const scheduleMinLabel = computed(() => formatPublishDateLabel(getScheduleMinDate()));

const publishDateFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'publishDate',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.publishDateAfter', {
          datetime: scheduleMinLabel.value,
        }),
        param: (value) => isPublishDateValid(value),
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const preorderPriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'preorderPrice',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.preorderPriceBetween', {
          min: PREORDER_MIN,
          max: PREORDER_MAX,
        }),
        param: (value) => {
          if (props.engine.state.publishSubstep !== 'schedulePublish') return true;
          if (!props.engine.state.openForPreorder) return true;
          if (value === '' || value === null || value === undefined) return true;
          const num = Number(value);
          return Number.isFinite(num) && num >= PREORDER_MIN && num <= PREORDER_MAX;
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const publishDateFieldState = computed(() =>
  interactionsEngine.getFieldState(publishDateFieldConfig.value),
);
const preorderPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(preorderPriceFieldConfig.value),
);

const isPublishDateInvalid = computed(() => {
  if (publishSubstep.value !== 'schedulePublish') return false;
  if (!attemptedSubmit.value && !String(publishDate.value || '').trim()) return false;
  if (!attemptedSubmit.value && String(publishDate.value || '').trim()) {
    return !!publishDateFieldState.value && !publishDateFieldState.value.isValid;
  }
  return !!publishDateFieldState.value && !publishDateFieldState.value.isValid;
});

const isPreorderPriceInvalid = computed(() => {
  if (publishSubstep.value !== 'schedulePublish' || !openForPreorder.value) return false;
  const raw = preorderPrice.value;
  if (raw === '' || raw === null || raw === undefined) {
    return attemptedSubmit.value
      ? !!preorderPriceFieldState.value && !preorderPriceFieldState.value.isValid
      : false;
  }
  return !!preorderPriceFieldState.value && !preorderPriceFieldState.value.isValid;
});

const publishDateErrorText = computed(
  () =>
    publishDateFieldState.value?.failedRules?.[0]?.message ||
    t('shops.merch.listing.validation.publishDateAfter', {
      datetime: scheduleMinLabel.value,
    }),
);

const preorderPriceErrorText = computed(
  () =>
    preorderPriceFieldState.value?.failedRules?.[0]?.message ||
    t('shops.merch.listing.validation.preorderPriceBetween', {
      min: PREORDER_MIN,
      max: PREORDER_MAX,
    }),
);

watch(publishDate, (val) => {
  interactionsEngine.processFieldChange(publishDateFieldConfig.value, val);
});
watch(preorderPrice, (val) => {
  interactionsEngine.processFieldChange(preorderPriceFieldConfig.value, val);
});
watch(publishSubstep, () => {
  interactionsEngine.processFieldChange(publishDateFieldConfig.value, publishDate.value);
  interactionsEngine.processFieldChange(preorderPriceFieldConfig.value, preorderPrice.value);
});
watch(openForPreorder, () => {
  interactionsEngine.processFieldChange(preorderPriceFieldConfig.value, preorderPrice.value);
});

async function togglePublishDatePicker() {
  if (openPicker.value === 'publish') {
    openPicker.value = null;
    return;
  }
  openPicker.value = 'publish';
  await nextTick();
  const field = publishDateFieldRef.value;
  field?.scrollIntoView({ block: 'start', inline: 'nearest' });
  await nextTick();
  const panel = field?.querySelector('[data-date-picker-panel]');
  panel?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function onPublishSubstepChange(id) {
  publishSubstep.value = id;
  openPicker.value = null;
}

const FIELD_ORDER = ['publishDate', 'preorderPrice'];

function scrollToField(fieldId) {
  const el = rootEl.value?.querySelector(`[data-merch-field="${fieldId}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validateStep() {
  if (publishSubstep.value !== 'schedulePublish') return true;

  attemptedSubmit.value = true;
  interactionsEngine.processFieldChange(publishDateFieldConfig.value, publishDate.value);
  interactionsEngine.processFieldChange(preorderPriceFieldConfig.value, preorderPrice.value);

  const summary = interactionsEngine.validateScope(SCOPE_ID);
  if (summary.isValid) return true;

  const firstId =
    summary.firstInvalidField?.fieldId ||
    FIELD_ORDER.find((id) => summary.invalidFields?.some((f) => f.fieldId === id));
  if (firstId) {
    void nextTick(() => scrollToField(firstId));
  }
  return false;
}

onMounted(() => {
  interactionsEngine.register(publishDateFieldConfig.value, publishDate.value, null);
  interactionsEngine.register(preorderPriceFieldConfig.value, preorderPrice.value, null);
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

defineExpose({ validateStep });
</script>

<template>
  <div
    ref="rootEl"
    data-component="merch-publish-settings-step"
    class="relative flex flex-col gap-6"
  >
    <div
      v-if="showPreorderBanner && preorderBannerOpen"
      class="absolute left-0 right-0 top-0 z-20 -mx-6 -mt-4"
    >
      <NotificationCard
        v-model="preorderBannerOpen"
        variant="notice"
        theme="merchPreorderNotice"
        :title="t('shops.merch.listing.publish.preorderPeriodBanner')"
        :icon="preorderNoticeIconUrl"
        :closable="false"
      >
        <template #title>
          <DashboardPrimaryButton
            :text="t('shops.merch.listing.publish.stopPreorderNow')"
            theme="merchStopPreorder"
            type="button"
            @click="openEndPreorderPopup"
          />
        </template>
      </NotificationCard>
    </div>

    <p
      class="text-sm font-bold leading-5 text-text-quaternary"
      :class="showPreorderBanner && preorderBannerOpen ? 'pt-16' : ''"
    >
      {{ t('shops.merch.listing.publish.whenTitle') }}
    </p>

    <MediaUploadTypeTabs
      :tabs="publishTabs"
      :model-value="publishSubstep"
      :tabs-aria-label="t('shops.merch.listing.publish.whenTitle')"
      tabs-only
      list-class="!flex w-full"
      tab-class="flex-1"
      @update:model-value="onPublishSubstepChange"
    />

    <!-- Immediate -->
    <p
      v-if="publishSubstep === 'publishImmediately'"
      class="text-base text-[#0C111D]"
    >
      {{ t('shops.merch.listing.publish.immediateHelp') }}
    </p>

    <!-- Schedule -->
    <template v-else-if="publishSubstep === 'schedulePublish'">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1.5" data-merch-field="publishDate">
          <p class="text-sm font-semibold text-[#344054]">
            {{ t('shops.merch.listing.publish.publishDate') }}
          </p>
          <div
            ref="publishDateFieldRef"
            class="relative w-full"
            :class="openPicker === 'publish' ? 'z-30' : 'z-0'"
          >
            <div
              class="h-11 flex items-center bg-white/50 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
              role="button"
              tabindex="0"
              @click="togglePublishDatePicker"
              @keydown.enter.prevent="togglePublishDatePicker"
              @keydown.space.prevent="togglePublishDatePicker"
            >
              <div class="flex items-center gap-2 px-3 w-full min-w-0">
                <img
                  v-if="assets.calendar01"
                  :src="assets.calendar01"
                  :alt="t('shops.merch.listing.publish.calendarAlt')"
                  class="w-5 h-5 shrink-0"
                />
                <span
                  class="flex-1 min-w-0 truncate text-base"
                  :class="publishDate
                    ? 'text-[#0C111D]'
                    : 'text-[#667085]'"
                >
                  {{ publishDate || t('shops.merch.listing.publish.datePlaceholder') }}
                </span>
              </div>
            </div>
            <div
              v-if="openPicker === 'publish'"
              data-date-picker-panel
              class="relative mt-1 w-full z-30"
              @click.stop
            >
              <VueDatePicker
                v-model="publishDate"
                :config="datePickerConfig"
                class="w-full block"
                @date-selected="openPicker = null"
              />
            </div>
          </div>
          <p v-if="isPublishDateInvalid" class="text-sm text-error">
            {{ publishDateErrorText }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <CheckboxSwitch
            id="merch-open-for-preorder"
            v-model="openForPreorder"
            :label="t('shops.merch.listing.publish.openForPreorder')"
            theme="linkRow"
          />
          <div class="relative group">
            <img
              v-if="infoIconUrl"
              :src="infoIconUrl"
              alt=""
              class="cursor-pointer"
            />
            <div
              class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-mediaUi-tooltip text-white text-xs px-3 py-2 shadow-lg z-50 w-[280px] rounded-[8px]"
            >
              {{ t('shops.merch.listing.publish.openForPreorderTip') }}
            </div>
          </div>
        </div>

        <div v-if="openForPreorder" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <RadioGroup
              v-model="afterPreorderAction"
              name="merch-after-preorder"
              :label="t('shops.merch.listing.publish.afterPreorder')"
              :options="afterPreorderOptions"
              theme="dashboard"
              label-class="text-sm font-semibold text-[#344054] mb-2"
              radio-label-class="text-[16px] font-[500] text-[#0C111D]"
            />
            <p class="text-sm font-normal text-[#667085]">
              {{ t('shops.merch.listing.publish.preorderHelp') }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5 w-full" data-merch-field="preorderPrice">
            <p class="text-sm font-medium text-[#667085]">
              {{ t('shops.merch.listing.publish.preorderPrice') }}
            </p>
            <DashboardTextInput
              id="merch_preorder_price"
              type="text"
              v-model="preorderPrice"
              :placeholder="t('shops.merch.listing.inventory.enterAmountPlaceholder')"
              left-span
              :left-span-text="t('mediaUploader.subscription.usd')"
              left-span-class="!text-[16px] !font-[500] !text-[#475467]"
            />
            <p v-if="isPreorderPriceInvalid" class="text-sm text-error">
              {{ preorderPriceErrorText }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <EndPreorderPopup
      v-model="endPreorderOpen"
      :initial-action="afterPreorderAction"
      @confirm="onEndPreorderConfirm"
    />
  </div>
</template>
