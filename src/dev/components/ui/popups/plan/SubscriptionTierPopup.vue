<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import TierCard from '@/components/ui/card/dashboard/TierCard.vue';
import PlanDetail from '@/dev/components/plan/PlanDetail.vue';
import PlanVariation from '@/dev/components/plan/PlanVariation.vue';
import PlanSharing from '@/dev/components/plan/PlanSharing.vue';
import PlanPublishSetting from '@/dev/components/plan/PlanPublishSetting.vue';
import PlanConfirmPopup from '@/dev/components/ui/popups/plan/PlanConfirmPopup.vue';
import PlanFlowTabs from '@/dev/components/plan/parts/PlanFlowTabs.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { createDashboardSidebarSlideInConfig } from '@/systems/dashboard/createDashboardSidebarSlideInConfig.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useTierCardAssets } from '@/dev/composables/useTierCardAssets.js';
import { useSubscriptionTiersEngine } from '@/dev/composables/useSubscriptionTiersEngine.js';
import { mapPublishStateToTierCard } from '@/dev/utils/plan/mapPublishStateToTierCard.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Existing tier entry to edit / add media — null = new tier. */
  editEntry: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'published', 'drafted', 'add-media', 'publish-blocked']);

const { t } = useI18n();
const { assets } = usePlanAssets();
const { assets: tierCardAssets } = useTierCardAssets();
const { url: defaultTierBgUrl } = useAssetUrl('tier.demo.background');
const { upsertTier, tiers, canPublishNewTier } = useSubscriptionTiersEngine();

const publishFlow = createStepStateEngine({
  flowId: 'publishFlow',
  initialStep: 1,
  urlSync: 'none',
  persist: { key: 'stateEngine:publishFlow' },
  defaults: {
    activeDiscountPlan: '',
    isDraftPopupOpen: false,
    publishDate: '',
    publishEndDate: '',
    postToX: false,
    postMessage: '',
    socialThumbnailMode: '',
    invitedPerformers: [],
    verifiedFanOnly: false,

    planDetailSubstep: 'paid-tier',
    publishSettingSubstep: 'publish-immediately',

    tierName: '',
    description: '',
    bgImage: null,
    isFeaturedTier: false,

    priceDuration: '',
    basePrice: '',

    subscriberDiscount: null,
    unsubscribeDiscount: null,

    tierAudience: '',
    maxSubscribers: '',
    freeTokensDiscount: '',

    merchDiscount: '',
    applyMerchToSale: false,
    payToViewDiscount: '',
    applyPayToViewToSale: false,
    customRequestDiscount: '',
    applyCustomToSale: false,

    selectedMediaOptions: [],
    planVariations: [],
  },
});

const isLargeScreen = ref(true);
const isPreviewPopupOpen = ref(false);
const planDetailRef = ref(null);
const showLeaveConfirm = ref(false);
const showDraftSavedConfirm = ref(false);
const draftSavedTierName = ref('');
const draftSavedEntry = ref(null);
/** true when draft has no media checkboxes — show Add Media on confirm. */
const draftSavedNeedsMedia = ref(true);
/** When true, allow BasePopup / parent model to actually close. */
const isForceClosing = ref(false);

function checkScreenSize() {
  isLargeScreen.value = window.innerWidth >= 1365;
  if (isLargeScreen.value) {
    isPreviewPopupOpen.value = false;
  }
}

function forceClosePopup() {
  isForceClosing.value = true;
  isPreviewPopupOpen.value = false;
  showLeaveConfirm.value = false;
  publishFlow.setState('isDraftPopupOpen', false);
  emit('update:modelValue', false);
  nextTick(() => {
    isForceClosing.value = false;
  });
}

function closePopup() {
  // Nested cropper must dismiss before leave confirm / slide-in close.
  if (planDetailRef.value?.closeBgCropper?.()) return;
  showLeaveConfirm.value = true;
}

function handlePopupModel(val) {
  if (!val) {
    if (isForceClosing.value) {
      emit('update:modelValue', false);
      return;
    }
    // Intercept Escape / overlay close → leave confirm (keep slide-in open).
    closePopup();
    return;
  }
  emit('update:modelValue', true);
}

function onLeaveConfirmCancel() {
  showLeaveConfirm.value = false;
}

function onLeaveConfirmLeave() {
  showLeaveConfirm.value = false;
  forceClosePopup();
}

function onDraftSavedBack() {
  // Popup already closed on draft save — just clear confirm state.
  showDraftSavedConfirm.value = false;
  draftSavedEntry.value = null;
  draftSavedNeedsMedia.value = true;
}

function onDraftSavedAddMedia() {
  // Popup was closed on draft save — parent reopens via add-media at Plan Detail.
  const entry = draftSavedEntry.value;
  showDraftSavedConfirm.value = false;
  draftSavedEntry.value = null;
  draftSavedNeedsMedia.value = true;
  if (entry) emit('add-media', entry);
}

/** Baseline after open/reset — any change enables SAVE & PUBLISH on every step. */
const dirtyBaseline = ref('');
const editingTierId = ref(null);

function snapshotWizardState() {
  const snap = toPersistableState(publishFlow.state) || {};
  delete snap.isDraftPopupOpen;
  return JSON.stringify(snap);
}

function captureDirtyBaseline() {
  dirtyBaseline.value = snapshotWizardState();
}

const WIZARD_STATE_KEYS = [
  'activeDiscountPlan',
  'publishDate',
  'publishEndDate',
  'postToX',
  'postMessage',
  'socialThumbnailMode',
  'invitedPerformers',
  'verifiedFanOnly',
  'planDetailSubstep',
  'publishSettingSubstep',
  'tierName',
  'description',
  'bgImage',
  'isFeaturedTier',
  'priceDuration',
  'basePrice',
  'subscriberDiscount',
  'unsubscribeDiscount',
  'tierAudience',
  'maxSubscribers',
  'freeTokensDiscount',
  'merchDiscount',
  'applyMerchToSale',
  'payToViewDiscount',
  'applyPayToViewToSale',
  'customRequestDiscount',
  'applyCustomToSale',
  'selectedMediaOptions',
  'planVariations',
];

function resetWizard() {
  publishFlow.forceStep(1);
  const emptyKeys = [
    'activeDiscountPlan',
    'publishDate',
    'publishEndDate',
    'postMessage',
    'socialThumbnailMode',
    'tierName',
    'description',
    'priceDuration',
    'basePrice',
    'subscriberDiscount',
    'unsubscribeDiscount',
    'tierAudience',
    'maxSubscribers',
    'freeTokensDiscount',
    'merchDiscount',
    'payToViewDiscount',
    'customRequestDiscount',
  ];
  emptyKeys.forEach((key) => {
    if (key === 'subscriberDiscount' || key === 'unsubscribeDiscount') {
      publishFlow.setState(key, null);
      return;
    }
    publishFlow.setState(key, '');
  });
  publishFlow.setState('planDetailSubstep', 'paid-tier');
  publishFlow.setState('publishSettingSubstep', 'publish-immediately');
  publishFlow.setState('postToX', false);
  publishFlow.setState('verifiedFanOnly', false);
  publishFlow.setState('isFeaturedTier', false);
  publishFlow.setState('applyMerchToSale', false);
  publishFlow.setState('applyPayToViewToSale', false);
  publishFlow.setState('applyCustomToSale', false);
  publishFlow.setState('bgImage', null);
  publishFlow.setState('invitedPerformers', []);
  publishFlow.setState('selectedMediaOptions', []);
  publishFlow.setState('planVariations', []);
  publishFlow.setState('isDraftPopupOpen', false);
  editingTierId.value = null;
  publishFlow.flushPersist();
}

function cloneWizardValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneWizardValue(item));
  if (value && typeof value === 'object') return { ...value };
  return value;
}

function hydrateFromEntry(entry) {
  if (!entry?.id) return;
  editingTierId.value = entry.id;
  const formValues = entry.formValues || {};
  WIZARD_STATE_KEYS.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(formValues, key)) return;
    publishFlow.setState(key, cloneWizardValue(formValues[key]));
  });
  publishFlow.setState('isDraftPopupOpen', false);
  publishFlow.forceStep(1);
  publishFlow.flushPersist();
}

async function applyPopupOpenState() {
  resetWizard();
  // Drop any leftover wizard persist so another tier's draft cannot leak in.
  publishFlow.clearPersist();
  if (props.editEntry?.id) {
    hydrateFromEntry(props.editEntry);
  }
  await nextTick();
  captureDirtyBaseline();
}

watch(
  () => [props.modelValue, props.editEntry?.id],
  async ([open]) => {
    if (!open) return;
    await applyPopupOpenState();
  },
);

function handleBack() {
  if (publishFlow.step > 1) {
    publishFlow.goToStep(publishFlow.step - 1);
    return;
  }
  // Step 1 back / close → leave confirm
  closePopup();
}

function handleMainTab(stepNumber) {
  publishFlow.setState('isDraftPopupOpen', false);
  publishFlow.goToStep(Number(stepNumber));
}

const mainFlowTabs = computed(() => [
  {
    id: 1,
    label: t('plan.page.tabs.detail'),
    icon: assets.value.infoSquare,
  },
  {
    id: 2,
    label: t('plan.page.tabs.variation'),
    icon: assets.value.dollar,
  },
  {
    id: 3,
    label: t('plan.page.tabs.sharing'),
    icon: assets.value.share,
  },
  {
    id: 4,
    label: t('plan.page.tabs.publish'),
    icon: assets.value.upload,
  },
]);

/** Mobile ⋮: show bottom “Save as draft” sheet. Desktop draft link: save immediately. */
function toggleDraftPopup() {
  if (!isLargeScreen.value) {
    publishFlow.setState('isDraftPopupOpen', !publishFlow.state.isDraftPopupOpen);
    return;
  }
  handleSaveAsDraft();
}

function resolveHasMedia(formValues) {
  const selected = formValues?.selectedMediaOptions;
  return Array.isArray(selected) && selected.length > 0;
}

function buildTierEntry(status) {
  const formValues = toPersistableState(publishFlow.state) || {};
  delete formValues.isDraftPopupOpen;
  const id = editingTierId.value || `tier-${Date.now()}`;
  const existing = (tiers.value || []).find((tier) => tier.id === id);
  // Followers are not edited in the popup — keep prior value (0 on create).
  const followers = Number(existing?.followers) || 0;
  // List Publish gate = Plan Detail media checkboxes only.
  const hasMedia = resolveHasMedia(formValues);
  const card = mapPublishStateToTierCard({
    state: formValues,
    t,
    tierCardAssets: tierCardAssets.value,
    unionGreenUrl: assets.value.unionGreen,
    defaultBgUrl: defaultTierBgUrl.value,
    status,
    id,
    followers,
    hasMedia,
    listMode: true,
  });
  return {
    id,
    status,
    isFreeTier: card.isFreeTier,
    followers,
    hasMedia,
    formValues,
    card,
  };
}

function handleSaveAsDraft() {
  if (!canSave.value) return;
  publishFlow.setState('isDraftPopupOpen', false);
  publishFlow.flushPersist();
  const entry = buildTierEntry('draft');
  upsertTier(entry);
  emit('drafted', entry);
  publishFlow.clearPersist();
  draftSavedTierName.value = String(entry?.formValues?.tierName || entry?.card?.title || '').trim();
  draftSavedEntry.value = entry;
  // Add Media CTA only when no Plan Detail media checkboxes are selected.
  draftSavedNeedsMedia.value = !entry.hasMedia;
  showDraftSavedConfirm.value = true;
  // Close SubscriptionTierPopup behind the draft-saved confirm.
  forceClosePopup();
}

function handleNextStep() {
  // Soft-enabled Schedule CTA still requires real form changes before publish.
  if (!canSave.value) return;
  // Plan Detail range warnings: Save as draft OK; next step blocked + scroll to first warning.
  if (publishFlow.step === 1 && planDetailRef.value?.hasBlockingErrors) {
    planDetailRef.value.scrollToFirstError?.();
    return;
  }

  publishFlow.setState('isDraftPopupOpen', false);

  if (publishFlow.step < 4) {
    // goToStep already schedulePersist — don't sync-flush (large bgImage) before paint
    publishFlow.goToStep(publishFlow.step + 1);
    return;
  }

  // Publish Now / Schedule Publish — save via StateEngine + close
  const existing = editingTierId.value
    ? (tiers.value || []).find((tier) => tier.id === editingTierId.value)
    : null;
  const wasUpdate = existing?.status === 'published';
  const isFree = publishFlow.state.planDetailSubstep === 'free-tier';
  // New publish must fit 1 free / 3 paid — updates of live tiers stay allowed.
  if (!wasUpdate && !canPublishNewTier({ isFree })) {
    const draftEntry = buildTierEntry('draft');
    upsertTier(draftEntry);
    emit('publish-blocked', { entry: draftEntry });
    publishFlow.clearPersist();
    forceClosePopup();
    return;
  }
  const entry = buildTierEntry('published');
  upsertTier(entry);
  emit('published', { entry, wasUpdate });
  publishFlow.clearPersist();
  forceClosePopup();
}

const canSave = computed(() => {
  // Touch reactive state so any setState re-evaluates
  void publishFlow.state.tierName;
  void publishFlow.state.description;
  void publishFlow.state.basePrice;
  void publishFlow.state.bgImage;
  void publishFlow.state.priceDuration;
  void publishFlow.state.isFeaturedTier;
  void publishFlow.state.postToX;
  void publishFlow.state.postMessage;
  void publishFlow.state.publishDate;
  void publishFlow.state.publishEndDate;
  void publishFlow.state.subscriberDiscount;
  void publishFlow.state.unsubscribeDiscount;
  void publishFlow.state.freeTokensDiscount;
  void publishFlow.state.merchDiscount;
  void publishFlow.state.payToViewDiscount;
  void publishFlow.state.customRequestDiscount;
  void publishFlow.state.maxSubscribers;
  void publishFlow.state.tierAudience;
  void publishFlow.state.invitedPerformers;
  void publishFlow.state.selectedMediaOptions;
  void publishFlow.state.planDetailSubstep;
  void publishFlow.state.publishSettingSubstep;
  if (!dirtyBaseline.value) return false;
  return snapshotWizardState() !== dirtyBaseline.value;
});

const buttonLabel = computed(() => {
  if (publishFlow.step < 4) return t('plan.page.saveAndPublish');
  return publishFlow.state.publishSettingSubstep === 'schedule-publish-time'
    ? t('plan.page.schedulePublish')
    : t('plan.page.publishNow');
});

const isImmediatePublish = computed(
  () => publishFlow.state.publishSettingSubstep === 'publish-immediately',
);

const isSchedulePublish = computed(
  () =>
    publishFlow.state.publishSettingSubstep === 'schedule-publish-time' &&
    publishFlow.step === 4,
);

/** Step 4 CTAs (Publish Now / Schedule) stay visually active — same soft-enable for both. */
const isPublishStepSoftEnabled = computed(() => publishFlow.step === 4);

/** Width/height from ProfileMerchPopup; scrollable like AddTierPopup */
const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  offset: '0px',
  speed: '0ms',
  effect: 'ease-in-out',
  shouldShowOverlay: true,
  // Fake filler / external tools click outside the slide-in; don't close on that.
  shouldCloseOnOutsideClick: false,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '90%', '<768': '100%' },
  height: { default: '100%', '<768': '100%' },
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
};

const previewPopupConfig = createDashboardSidebarSlideInConfig({
  from: 'right',
  offset: '0px',
  // Fixed width so Preview tab `right` offset can sit on the panel edge (auto caused a gap).
  // Full width below project sm (480px) — matches p-0 / full-bleed card below sm.
  width: { default: '25rem', '<480': '100%' },
  height: '100%',
  shouldLockBodyScroll: false,
  // Close only via Preview button — outside-click + button toggle was reopening it.
  shouldCloseOnOutsideClick: false,
  speed: '0ms',
  closeSpeed: '0ms',
  closeEffect: 'instant',
  // Above teleported mobile footer (z-10060) so Save & Publish / draft stay behind preview.
  forceZIndex: 10100,
});

function togglePreviewPopup() {
  isPreviewPopupOpen.value = !isPreviewPopupOpen.value;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrice(value, fallback = '11.69') {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw;
  return Number.isInteger(num) ? String(num) : String(num);
}

function formatPercentOff(value, fallback = '10') {
  const raw = String(value ?? '').trim();
  const amount = raw || fallback;
  return t('tierCard.ui.features.percentOffAmount', { amount });
}

function formatTokensValue(value, fallback = '100') {
  const amount = String(value ?? '').trim() || fallback;
  return t('tierCard.ui.features.tokensEveryMonth', { count: amount });
}

const durationPlanMeta = computed(() => {
  const duration = publishFlow.state.priceDuration || 'month';
  if (duration === 'day') {
    return { id: 'day', label: t('tierCard.demo.plans.oneDay') };
  }
  if (duration === 'year') {
    return { id: 'year', label: t('tierCard.demo.plans.oneYear') };
  }
  return { id: 'month', label: t('tierCard.demo.plans.oneMonth') };
});

function computeDiscountedPrice(basePrice, discount) {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || !discount) return null;
  const amount = Number(discount.discountAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (discount.discountType === 'amount') {
    return Math.max(0, base - amount);
  }
  return Math.max(0, base * (1 - amount / 100));
}

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, '');
}

const isPlanDetailCardEmpty = computed(() => {
  const state = publishFlow.state;
  return (
    !String(state.tierName || '').trim() &&
    !stripHtml(state.description) &&
    !state.bgImage &&
    !String(state.basePrice || '').trim()
  );
});

const planDetailTierData = computed(() => {
  const state = publishFlow.state;
  const planMeta = durationPlanMeta.value;
  const empty = isPlanDetailCardEmpty.value;

  if (empty) {
    return {
      id: 1,
      emptyState: true,
      title: t('tierCard.ui.empty.tierName'),
      backgroundImage: null,
      isFeatured: false,
      hidePlanSelector: true,
      priceDisplay: 'free',
      stats: { video: '—', image: '—', audio: '—' },
      theme: {
        textPrimary: 'text-[#07F468]',
        textSecondary: 'text-white',
        shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',
        barColor: 'bg-[#FFED29]',
        barTextColor: 'text-[#FFED29]',
        featuredBg: 'bg-black',
        buttonBgImage: `url('${assets.value.unionGreen}')`,
        flashLabel: 'text-[#07F468]',
        flashText: '#07F468',
        textReNew: 'text-white',
        featuredText: 'text-[#07F468]',
      },
      plans: [{ id: 'free', label: t('tierCard.ui.free'), price: t('tierCard.ui.free'), discount: null }],
      defaultPlan: 'free',
      flashSale: { active: false },
      description: t('tierCard.ui.empty.description'),
      features: [],
      footer: {
        type: 'subscribeFree',
        buttonText: t('tierCard.ui.empty.subscribeForFree'),
        progress: { visible: false },
      },
    };
  }

  const isFreeTier = state.planDetailSubstep === 'free-tier';
  const basePrice = formatPrice(state.basePrice, '');
  const subscriberDiscount = state.subscriberDiscount;
  const unsubscribeDiscount = state.unsubscribeDiscount;
  const discounted = computeDiscountedPrice(basePrice, subscriberDiscount);
  const displayPrice =
    discounted != null ? formatMoney(discounted) : basePrice || '0';
  const description = stripHtml(state.description) || t('tierCard.ui.empty.description');

  const features = [];
  if (String(state.freeTokensDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets.value.takeCoin,
      label: t('tierCard.ui.features.freeTokens'),
      value: formatTokensValue(state.freeTokensDiscount),
    });
  }
  if (String(state.merchDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets.value.cart,
      label: t('tierCard.ui.features.merchDiscount'),
      value: formatPercentOff(state.merchDiscount),
    });
  }
  if (String(state.payToViewDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets.value.image,
      label: t('tierCard.ui.features.ppvDiscount'),
      value: formatPercentOff(state.payToViewDiscount),
    });
  }
  if (String(state.customRequestDiscount || '').trim()) {
    features.push({
      icon: tierCardAssets.value.cart,
      label: t('tierCard.ui.features.customRequest'),
      value: formatPercentOff(state.customRequestDiscount),
    });
  }
  if (unsubscribeDiscount && Number(unsubscribeDiscount.discountAmount) > 0) {
    features.push({
      icon: tierCardAssets.value.cart,
      label: t('tierCard.ui.features.unsubscribeDiscount'),
      value:
        unsubscribeDiscount.discountType === 'amount'
          ? t('tierCard.ui.features.amountOff', {
              amount: formatMoney(unsubscribeDiscount.discountAmount),
            })
          : formatPercentOff(unsubscribeDiscount.discountAmount),
    });
  }

  return {
    id: 1,
    emptyState: false,
    title: String(state.tierName || '').trim() || t('tierCard.ui.empty.tierName'),
    backgroundImage: state.bgImage || null,
    isFeatured: Boolean(state.isFeaturedTier),
    hidePlanSelector: true,
    priceDisplay: isFreeTier ? 'free' : 'paid',
    stats: { video: 100, image: 50, audio: 70 },
    theme: {
      textPrimary: 'text-[#07F468] dark:text-[#06c454]',
      textSecondary: 'text-[#FFED29] dark:text-[#FFED29]',
      shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',
      barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',
      barTextColor: 'text-[#FFED29]',
      featuredBg: 'bg-black dark:bg-[#181a1b]',
      buttonBgImage: `url('${assets.value.unionGreen}')`,
      flashLabel: 'text-[#07F468] dark:text-[#06c454]',
      flashText: '#07F468',
      textReNew: 'text-[#07F468] dark:text-[#06c454]',
      featuredText: 'text-[#07F468] dark:text-[#06c454]',
    },
    plans: [
      {
        id: planMeta.id,
        label: planMeta.label,
        price: isFreeTier ? t('tierCard.ui.free') : displayPrice,
        discount: null,
      },
    ],
    defaultPlan: planMeta.id,
    flashSale: {
      active: Boolean(subscriberDiscount && discounted != null && basePrice),
      endsIn: t('plan.preview.mock.endsIn'),
      originalPrice: basePrice ? `$${basePrice}` : '',
    },
    description,
    features,
    footer: isFreeTier
      ? {
          type: 'subscribeFree',
          buttonText: t('tierCard.ui.empty.subscribeForFree'),
          progress: { visible: false },
        }
      : {
          type: 'subscribe',
          buttonText: t('tierCard.demo.footer.subscribe'),
          progress: { visible: false },
        },
  };
});

function formatVariationDiscountLabel(discountType, discountAmount) {
  const amount = String(discountAmount ?? '').trim();
  if (!amount) return null;
  if (discountType === 'amount') {
    return `-${t('mediaUploader.addTier.usd')}${amount}`;
  }
  return `-${amount}%`;
}

function mapVariationToTierPlan(variation, basePrice, isFreeTier) {
  const formValues = variation?.formValues || variation || {};
  const period = formValues.variationPeriod || '2m';
  const discountType = formValues.discountType;
  const discountAmount = formValues.discountAmount;
  const discounted = computeDiscountedPrice(basePrice, {
    discountType,
    discountAmount,
  });
  const price = isFreeTier
    ? t('tierCard.ui.free')
    : discounted != null
      ? formatMoney(discounted)
      : basePrice || '0';

  return {
    id: String(variation.id),
    label: t(`plan.variation.popup.periods.${period}`),
    price,
    discount: formatVariationDiscountLabel(discountType, discountAmount),
  };
}

/** Steps 2–4: same Plan Detail TierCard, with variation pills when added (max 3). */
const planVariationTierData = computed(() => {
  const base = planDetailTierData.value;
  const state = publishFlow.state;
  const variations = Array.isArray(state.planVariations) ? state.planVariations : [];

  if (!variations.length || base.emptyState) {
    return base;
  }

  const isFreeTier = state.planDetailSubstep === 'free-tier';
  const basePrice = formatPrice(state.basePrice, '');
  const plans = variations.map((variation) =>
    mapVariationToTierPlan(variation, basePrice, isFreeTier),
  );

  return {
    ...base,
    hidePlanSelector: plans.length <= 1,
    plans,
    defaultPlan: plans[0]?.id,
  };
});

const currentTierData = computed(() => {
  void publishFlow.step;
  void publishFlow.state.bgImage;
  void publishFlow.state.planVariations;
  if (publishFlow.step === 1) return planDetailTierData.value;
  return planVariationTierData.value;
});

const previewTierKey = computed(() => {
  const variations = Array.isArray(publishFlow.state.planVariations)
    ? publishFlow.state.planVariations
    : [];
  const variationKey = variations.map((v) => v.id).join('-') || 'none';
  return `tier-preview-${publishFlow.step}-${publishFlow.state.bgImage || 'none'}-${variationKey}`;
});

onMounted(() => {
  publishFlow.initialize();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="handlePopupModel"
    :popup-config="popupConfig"
  >
    <div
      data-component="subscription-tier-popup"
      class="relative flex min-h-full w-full flex-col bg-[#FFFFFFBF] backdrop-blur-[100px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]"
      :class="{ 'schedule-publish-time': isSchedulePublish }"
    >
      <div class="relative z-[1] flex w-full flex-col gap-6 pb-2 md:gap-8 max-md:pb-16">
            <div
              class="flex flex-col gap-2 md:gap-6 md:px-4 xl:px-10"
            >
              <div class="flex justify-between items-center p-2 md:hidden">
                <img
                  @click="handleBack"
                  :src="assets.chevronLeft"
                  :alt="t('plan.page.alt.back')"
                  class="w-6 h-6 [filter:brightness(0)] cursor-pointer dark:[filter:brightness(100%)]"
                />

                <Heading tag="h1" theme="custom" no-wrap add-class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]" :text="t('plan.page.titleNewTier')" />
                <img
                  @click.stop="toggleDraftPopup"
                  :src="assets.threeDots"
                  :alt="t('plan.page.alt.settings')"
                  class="w-6 h-6 [filter:brightness(0)] cursor-pointer dark:[filter:brightness(100%)]"
                />
              </div>

              <div class="hidden justify-between items-center pt-10 md:flex md:pt-6 xl:pt-10">
                <div
                  class="flex justify-center items-center gap-1 cursor-pointer"
                  @click="handleBack"
                >
                  <img
                    :src="assets.arrowLeft"
                    :alt="t('plan.page.alt.back')"
                    class="w-4 h-4 [filter:brightness(0)] dark:[filter:brightness(100%)]"
                  />
                  <span class="text-xs leading-normal font-medium text-[#344054] dark:text-[#bdb8af]">
                    {{ t('plan.page.back') }}
                  </span>
                </div>

                <div class="flex items-center gap-[1.625rem]">
                  <div
                    class="flex items-center gap-0.5 cursor-pointer"
                    @click="handleSaveAsDraft"
                  >
                    <img
                      :src="assets.uploadDraft"
                      :alt="t('plan.page.alt.upload')"
                      class="w-5 h-5"
                    />
                    <span class="text-sm font-medium text-[#155EEF]">
                      {{ t('plan.page.saveAsDraft') }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="group/button flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-[#0C111D] px-2 text-[#07F468] hover:!bg-[#07F468] hover:!text-[#0C111D] md:w-max"
                    :class="[
                      { disabled: !canSave && !isPublishStepSoftEnabled },
                      isPublishStepSoftEnabled
                        ? ''
                        : '[&.disabled]:pointer-events-none [&.disabled]:bg-[#3440540D] [&.disabled]:text-[#98A2B3] dark:[&.disabled]:bg-[#323e520d] dark:[&.disabled]:text-[#b0a99e]',
                    ]"
                    :disabled="!canSave && !isPublishStepSoftEnabled"
                    :aria-disabled="!canSave"
                    @click="handleNextStep"
                  >
                    <img
                      v-if="publishFlow.step === 4 && isImmediatePublish"
                      :src="assets.upload"
                      :alt="t('plan.page.alt.upload')"
                      class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                    />
                    <img
                      v-else-if="publishFlow.step === 4"
                      :src="assets.time"
                      :alt="t('plan.page.alt.time')"
                      class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                    />
                    <span
                      class="text-base font-medium text-inherit"
                      :class="
                        isPublishStepSoftEnabled
                          ? ''
                          : 'group-[.disabled]/button:text-[#98A2B3] dark:group-[.disabled]/button:text-[#b0a99e]'
                      "
                    >
                      {{ buttonLabel }}
                    </span>
                  </button>
                </div>
              </div>

              <PlanFlowTabs
                :model-value="publishFlow.step"
                :tabs="mainFlowTabs"
                @update:model-value="handleMainTab"
              />
            </div>

            <div class="flex gap-6 grow md:gap-10 xl:px-10">
              <div class="flex flex-col gap-6 grow md:gap-8">
                <div>
                  <!-- v-show: keep steps mounted so tab switches stay instant -->
                  <PlanDetail
                    v-show="publishFlow.step === 1"
                    ref="planDetailRef"
                    :publishFlow="publishFlow"
                  />
                  <PlanVariation v-show="publishFlow.step === 2" :publishFlow="publishFlow" />
                  <PlanSharing v-show="publishFlow.step === 3" :publishFlow="publishFlow" />
                  <PlanPublishSetting v-show="publishFlow.step === 4" :publishFlow="publishFlow" />
                </div>

                <!-- Desktop footer actions (md+) -->
                <div
                  class="hidden items-center gap-2 p-2 md:flex md:static md:gap-6 md:px-4 md:py-0 md:justify-end xl:px-0"
                >
                  <div
                    class="flex items-center gap-0.5 cursor-pointer"
                    @click="handleSaveAsDraft"
                  >
                    <img
                      :src="assets.uploadDraft"
                      :alt="t('plan.page.alt.upload')"
                      class="w-5 h-5"
                    />
                    <span class="text-sm font-medium text-[#155EEF]">
                      {{ t('plan.page.saveAsDraft') }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="group/button flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-[#0C111D] px-2 text-[#07F468] hover:!bg-[#07F468] hover:!text-[#0C111D] md:w-max"
                    :class="[
                      { disabled: !canSave && !isPublishStepSoftEnabled },
                      isPublishStepSoftEnabled
                        ? ''
                        : '[&.disabled]:pointer-events-none [&.disabled]:bg-[#3440540D] [&.disabled]:text-[#98A2B3] dark:[&.disabled]:bg-[#323e520d] dark:[&.disabled]:text-[#b0a99e]',
                    ]"
                    :disabled="!canSave && !isPublishStepSoftEnabled"
                    :aria-disabled="!canSave"
                    @click="handleNextStep"
                  >
                    <img
                      v-if="publishFlow.step === 4 && isImmediatePublish"
                      :src="assets.upload"
                      :alt="t('plan.page.alt.upload')"
                      class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                    />
                    <img
                      v-else-if="publishFlow.step === 4"
                      :src="assets.time"
                      :alt="t('plan.page.alt.time')"
                      class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                    />
                    <span
                      class="text-base font-medium text-inherit"
                      :class="
                        isPublishStepSoftEnabled
                          ? ''
                          : 'group-[.disabled]/button:text-[#98A2B3] dark:group-[.disabled]/button:text-[#b0a99e]'
                      "
                    >
                      {{ buttonLabel }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Inline desktop preview — beside form (Tier information), normal card size -->
              <div v-if="isLargeScreen" class="shrink-0">
                <div class="w-[384px] rounded-[5px] shadow-[0px_0px_20px_0px_#07F46840,0px_0px_20px_0px_#07F46880]">
                  <TierCard :key="previewTierKey" :tier="currentTierData" />
                </div>
              </div>
            </div>
          </div>

          <!-- Viewport-centered Preview toggle (50vh); teleported so popup transform can't steal fixed -->
          <Teleport to="body">
            <div
              v-if="modelValue && !isLargeScreen"
              class="fixed top-[50vh] z-[10110] -translate-y-1/2 xl:hidden"
              :class="
                isPreviewPopupOpen
                  ? 'right-[-2rem] sm:right-[calc(25rem+0.5rem)]'
                  : 'right-[-2.0625rem]'
              "
              @mousedown.stop
              @click.stop
            >
              <DashboardPrimaryButton
                :text="t('plan.page.preview')"
                variant="none"
                :wrapperOverrides="[
                  { target: 'wrapper1', removeClass: true },
                  { target: 'wrapper2', removeClass: true },
                ]"
                customClass="-rotate-90 flex items-center gap-2 px-2 py-1 rounded-md border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none hover:border-none shadow-[0px_1px_2px_0px_#1018280F,0px_1px_3px_0px_#1018281A] transition-colors duration-300 ease-out cursor-pointer group bg-[#07F468] hover:bg-[#06c454]"
                textClass="text-sm transition-all duration-300 text-[#0C111D]"
                :leftIcon="isPreviewPopupOpen ? assets.closeGreen : assets.eye"
                :leftIconClass="
                  isPreviewPopupOpen
                    ? 'w-4 h-4 brightness-0 transition-all duration-300'
                    : 'w-4 h-4 rotate-90 brightness-0 transition-all duration-300'
                "
                @click.stop="togglePreviewPopup"
              />
            </div>
          </Teleport>

          <!-- Mobile footer: teleport so slide-in transform cannot break fixed bottom -->
          <Teleport to="body">
            <div
              v-if="modelValue"
              class="fixed inset-x-0 bottom-0 z-[10060] flex items-center md:hidden"
              :class="publishFlow.state.isDraftPopupOpen ? '' : 'gap-2 p-2'"
              @mousedown.stop
              @click.stop
            >
              <button
                v-if="publishFlow.state.isDraftPopupOpen"
                type="button"
                class="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-t-[0.625rem] bg-white px-2 py-2.5 text-[#0C111D] hover:bg-[#0C111D] hover:text-white dark:bg-white dark:text-[#0C111D] dark:hover:bg-[#0C111D] dark:hover:text-white"
                :class="{ 'pointer-events-none opacity-50': !canSave }"
                :disabled="!canSave"
                @click="handleSaveAsDraft"
              >
                <span class="text-sm font-medium text-inherit">
                  {{ t('plan.page.saveAsDraft') }}
                </span>
              </button>
              <button
                v-else
                type="button"
                class="group/button flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-[#0C111D] px-2 text-[#07F468] hover:!bg-[#07F468] hover:!text-[#0C111D]"
                :class="[
                  { disabled: !canSave && !isPublishStepSoftEnabled },
                  isPublishStepSoftEnabled
                    ? ''
                    : '[&.disabled]:pointer-events-none [&.disabled]:bg-[#3440540D] [&.disabled]:text-[#98A2B3] dark:[&.disabled]:bg-[#323e520d] dark:[&.disabled]:text-[#b0a99e]',
                ]"
                :disabled="!canSave && !isPublishStepSoftEnabled"
                :aria-disabled="!canSave"
                @click="handleNextStep"
              >
                <img
                  v-if="publishFlow.step === 4 && isImmediatePublish"
                  :src="assets.upload"
                  :alt="t('plan.page.alt.upload')"
                  class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                />
                <img
                  v-else-if="publishFlow.step === 4"
                  :src="assets.time"
                  :alt="t('plan.page.alt.time')"
                  class="h-6 w-6 [filter:brightness(0)_saturate(100%)_invert(79%)_sepia(53%)_saturate(4738%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(53%)_saturate(560%)_hue-rotate(184deg)_brightness(99%)_contrast(99%)]"
                />
                <span
                  class="text-base font-medium text-inherit"
                  :class="
                    isPublishStepSoftEnabled
                      ? ''
                      : 'group-[.disabled]/button:text-[#98A2B3] dark:group-[.disabled]/button:text-[#b0a99e]'
                  "
                >
                  {{ buttonLabel }}
                </span>
              </button>
            </div>
          </Teleport>

          <BasePopup
            :modelValue="isPreviewPopupOpen"
            @update:modelValue="(val) => (isPreviewPopupOpen = val)"
            :popup-config="previewPopupConfig"
          >
            <!-- Mobile/tablet only: scale card to viewport. Desktop keeps fixed 384 inline preview above. -->
            <!-- Below sm: no padding, card full width. sm+: padded + max 384. -->
            <div
              class="flex h-full w-full min-h-0 items-center justify-center overflow-hidden bg-black/80 p-0 backdrop-blur-md sm:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div
                class="flex h-full max-h-full w-full max-w-full min-h-0 items-stretch sm:max-h-[602px] sm:max-w-[384px]"
              >
                <div
                  class="h-full min-h-0 w-full rounded-none shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880] sm:rounded-[5px]"
                >
                  <TierCard
                    :key="previewTierKey"
                    fill-height
                    :tier="currentTierData"
                  />
                </div>
              </div>
            </div>
          </BasePopup>
    </div>
  </BasePopup>

  <PlanConfirmPopup
    v-model="showLeaveConfirm"
    variant="leave"
    @secondary="onLeaveConfirmCancel"
    @primary="onLeaveConfirmLeave"
  />

  <PlanConfirmPopup
    v-model="showDraftSavedConfirm"
    variant="draftSaved"
    :tier-name="draftSavedTierName"
    :show-add-media="draftSavedNeedsMedia"
    max-width="30rem"
    @secondary="onDraftSavedBack"
    @primary="onDraftSavedAddMedia"
  />
</template>
