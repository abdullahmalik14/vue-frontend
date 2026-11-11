<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SubscriptionVariations from './parts/SubscriptionVariations.vue';
import LuckyDrawSection from './parts/LuckyDrawSection.vue';
import SubscriptionPlanVariationsPopup from '@/dev/components/ui/popups/plan/SubscriptionPlanVariationsPopup.vue';
import LuckyDrawEventPopup from '@/dev/components/ui/popups/plan/LuckyDrawEventPopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  publishFlow: {
    type: Object,
    required: false,
  },
});

const { t } = useI18n();
const { assets } = usePlanAssets();
const showVariationsPopup = ref(false);
const variationsEditValues = ref(null);
const showLuckyDrawPopup = ref(false);
const luckyDrawEditValues = ref(null);

const MAX_VARIATIONS = 3;

/** Lucky draws created from LuckyDrawEventPopup — start empty */
const activeDraws = ref([]);

const maxSubscribers = computed(() => props.publishFlow?.state?.maxSubscribers ?? '');

/** Plans from SubscriptionPlanVariationsPopup — shared with TierCard via publishFlow */
const subscriptionPlans = computed(() => {
  const plans = props.publishFlow?.state?.planVariations;
  return Array.isArray(plans) ? plans : [];
});

function setSubscriptionPlans(next) {
  props.publishFlow?.setState?.('planVariations', next);
}

const canAddVariation = computed(() => subscriptionPlans.value.length < MAX_VARIATIONS);

const CARD_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function hasCompleteRange(range) {
  return Boolean(range?.start && range?.end);
}

/** Parse picker value (MM/DD/YYYY HH:mm:ss, Date, or ISO) → Date */
function parsePickerDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const str = String(value).trim();
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) {
    return new Date(Number(mdy[3]), Number(mdy[1]) - 1, Number(mdy[2]));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Figma card date: 23 APR 2025 */
function formatCardDate(value) {
  const d = parsePickerDate(value);
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${CARD_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Figma range: 23 APR 2025-24 APR 2026 */
function formatDateRangeLabel(range) {
  if (!hasCompleteRange(range)) return t('plan.variation.mock.noEndDate');
  const start = formatCardDate(range.start);
  const end = formatCardDate(range.end);
  if (!start || !end) return t('plan.variation.mock.noEndDate');
  return `${start}-${end}`;
}

function formatMinSpendingLabel(payload) {
  const amount = String(payload.minSpendingAmount ?? '').trim();
  if (payload.showSpendingRequirement && amount) {
    return t('plan.variation.mock.minSpendingWithAmount', {
      currency: t('mediaUploader.addTier.usd'),
      amount,
    });
  }
  return t('plan.variation.mock.noMinSpending');
}

function formatAudienceLabel(whoCanUse) {
  return whoCanUse === 'invited'
    ? t('plan.detail.audienceInvited')
    : t('plan.detail.audienceEveryone');
}

function formatDiscountLabel(payload) {
  const amount = String(payload.discountAmount ?? '').trim() || '0';
  if (payload.discountType === 'amount') {
    return `-${t('mediaUploader.addTier.usd')}${amount}`;
  }
  return `-${amount}%`;
}

function formatVariationTitle(period) {
  const mockTitleKeys = {
    '2m': 'plan.variation.mock.plan2mTitle',
    '6m': 'plan.variation.mock.plan6mTitle',
    '1y': 'plan.variation.mock.plan1yTitle',
  };
  if (mockTitleKeys[period]) return t(mockTitleKeys[period]);
  const label = t(`plan.variation.popup.periods.${period}`);
  return `${String(label).toUpperCase()} SUBSCRIPTION`;
}

function computeVariationListPrice(payload) {
  const base = Number(props.publishFlow?.state?.basePrice);
  const amount = Number(payload.discountAmount);
  if (!Number.isFinite(base) || !Number.isFinite(amount) || amount <= 0) {
    return t('plan.variation.popup.previewPrice');
  }
  const discounted =
    payload.discountType === 'amount'
      ? Math.max(0, base - amount)
      : Math.max(0, base * (1 - amount / 100));
  if (Number.isInteger(discounted)) return String(discounted);
  return discounted.toFixed(2).replace(/\.?0+$/, '');
}

function mapVariationPayloadToPlan(payload, id) {
  const fans = String(payload.fansClaimLimit ?? '').trim();
  const isUnlimited = Boolean(payload.unlimitedTime) || !fans;

  return {
    id,
    title: formatVariationTitle(payload.variationPeriod || '2m'),
    isUnlimited,
    usageStart: isUnlimited ? undefined : '0',
    usageLimit: isUnlimited ? undefined : fans,
    currency: t('mediaUploader.addTier.usd'),
    price: computeVariationListPrice(payload),
    discount: formatDiscountLabel(payload),
    audience: formatAudienceLabel(payload.whoCanUse),
    dateRange: formatDateRangeLabel(payload.discountDateRange),
    minSpending: formatMinSpendingLabel(payload),
    formValues: { ...payload, id },
  };
}

function mapLuckyDrawPayloadToDraw(payload, id) {
  const dateRange = formatDateRangeLabel(payload.dateRange);
  const minSpending = formatMinSpendingLabel(payload);

  const items = (payload.prizes || []).map((prize) => {
    const n = String(prize.winnersCount ?? '0').trim() || '0';
    return {
      label: prize.prizeTitle || t('plan.luckyDraw.title'),
      tokens: t('plan.luckyDraw.popup.prizeQuotaLeft', { current: n, total: n }),
    };
  });

  return {
    id,
    audience: formatAudienceLabel(payload.whoCanEnter),
    dateRange,
    minSpending,
    items,
    formValues: { ...payload, id },
  };
}

const handleEdit = (plan) => {
  variationsEditValues.value = { ...(plan.formValues || {}), id: plan.id };
  showVariationsPopup.value = true;
};

const handleRemove = (plan) => {
  setSubscriptionPlans(subscriptionPlans.value.filter((p) => p.id !== plan.id));
};

const openAddVariation = () => {
  if (!canAddVariation.value) return;
  variationsEditValues.value = null;
  showVariationsPopup.value = true;
};

const onVariationAdd = (payload) => {
  const existingId = payload.id;
  const current = subscriptionPlans.value;
  if (existingId != null) {
    setSubscriptionPlans(
      current.map((plan) =>
        plan.id === existingId ? mapVariationPayloadToPlan(payload, existingId) : plan,
      ),
    );
    return;
  }
  if (current.length >= MAX_VARIATIONS) return;
  const id = Date.now();
  setSubscriptionPlans([...current, mapVariationPayloadToPlan({ ...payload, id }, id)]);
};

const handleCreate = () => {
  luckyDrawEditValues.value = null;
  showLuckyDrawPopup.value = true;
};

const handleLuckyDrawEdit = (draw) => {
  luckyDrawEditValues.value = { ...(draw.formValues || {}), id: draw.id };
  showLuckyDrawPopup.value = true;
};

const handleLuckyDrawRemove = (draw) => {
  activeDraws.value = activeDraws.value.filter((d) => d.id !== draw.id);
};

const onLuckyDrawCreate = (payload) => {
  const existingId = luckyDrawEditValues.value?.id;
  if (existingId != null) {
    activeDraws.value = activeDraws.value.map((draw) =>
      draw.id === existingId ? mapLuckyDrawPayloadToDraw(payload, existingId) : draw,
    );
    return;
  }
  const id = Date.now();
  activeDraws.value.push(mapLuckyDrawPayloadToDraw(payload, id));
};
</script>

<template>
  <div class="flex flex-col gap-6 grow md:gap-8">
    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:p-4 dark:bg-[#181a1b40]">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.variation.title')" />
          <span class="text-xs leading-normal font-medium italic text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('mediaUploader.addTier.optional') }}
          </span>
        </div>

        <Paragraph
          theme="custom"
          add-class="text-sm font-normal text-[#344054] dark:text-[#bdb8af] whitespace-normal"
          :text="t('plan.variation.loyaltyCopy')"
        />
      </div>

      <div class="flex flex-col gap-2">
        <SubscriptionVariations
          v-for="plan in subscriptionPlans"
          :key="plan.id"
          :plan="plan"
          @edit="handleEdit"
          @remove="handleRemove"
        />
        <DashboardPrimaryButton
          v-if="canAddVariation"
          :text="t('plan.variation.addPlan')"
          variant="none"
          :leftIcon="assets.plusBlueSquare || assets.plusSquare"
          leftIconClass="w-5 h-5"
          customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]"
          @click="openAddVariation"
        />
      </div>
    </div>

    <SubscriptionPlanVariationsPopup
      v-model="showVariationsPopup"
      :initial-values="variationsEditValues"
      :max-subscribers="maxSubscribers"
      @add="onVariationAdd"
    />

    <LuckyDrawEventPopup
      v-model="showLuckyDrawPopup"
      :initial-values="luckyDrawEditValues"
      @create="onLuckyDrawCreate"
    />

    <LuckyDrawSection
      :draws="activeDraws"
      @create="handleCreate"
      @edit="handleLuckyDrawEdit"
      @remove="handleLuckyDrawRemove"
    />
  </div>
</template>
