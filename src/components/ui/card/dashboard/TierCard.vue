<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useTierCardAssets } from '@/dev/composables/useTierCardAssets.js';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import TierCardStats from '@/components/ui/card/dashboard/TierCardStats.vue';
import TierCardSettingsHover from '@/components/ui/card/dashboard/TierCardSettingsHover.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';

const emit = defineEmits([
  'settings-edit',
  'settings-publish',
  'settings-add-media',
  'settings-delete',
  'settings-feature',
  'settings-unfeature',
  'settings-unpublish',
]);

const { t } = useI18n();
const { assets } = useTierCardAssets();
const { assets: planAssets } = usePlanAssets();
const { url: tierBgUrl } = useAssetUrl('tier.demo.background');
const { url: tierButtonPinkUrl } = useAssetUrl('tier.demo.buttonBgPink');
const { url: tierButtonGreenUrl } = useAssetUrl('tier.demo.buttonBgGreen');
const settingsMenuOpen = ref(false);

/** Pass `:tier` from a real page, or `variant` for built-in presets (demo / quick copy). */
const props = defineProps({
  tier: {
    type: Object,
    default: null,
  },
  variant: {
    type: String,
    default: '',
    validator: (value) =>
      !value ||
      ['standardClaim', 'spendToClaim', 'standard95', 'hiddenProgress', 'subscribe'].includes(value),
  },
  /** When true, card fills parent height (preview slide-in). Default keeps desktop sidebar max-height caps. */
  fillHeight: {
    type: Boolean,
    default: false,
  },
});

function buildVariantTier(variant) {
  const price = t('tierCard.demo.price');
  const plans = [
    { id: '1d', label: t('tierCard.demo.plans.oneDay'), price, discount: null },
    { id: '1m', label: t('tierCard.demo.plans.oneMonth'), price, discount: t('tierCard.demo.discount5') },
    { id: '6m', label: t('tierCard.demo.plans.sixMonth'), price, discount: t('tierCard.demo.discount50'), isMostValue: true },
    { id: '1y', label: t('tierCard.demo.plans.oneYear'), price, discount: t('tierCard.demo.discount5') },
  ];

  const pinkTheme = {
    textPrimary: '#FB0464',
    textSecondary: 'text-[#FFED29] dark:text-[#ffee37]',
    shadow: 'shadow-[0px_0px_80px_0px_#FF8FBA40,0px_0px_8px_0px_#FF8FBA40]',
    barColor: 'bg-[#FB0464] dark:bg-[#c90350]',
    barTextColor: 'text-[#FFED29]',
    featuredBg: 'bg-[#FB0464] dark:bg-[#c90350]',
    buttonBgImage: `url('${tierButtonPinkUrl.value}')`,
    flashLabel: 'text-white dark:text-[#e8e6e3]',
    flashText: '#FB0464',
    textReNew: 'text-white dark:text-[#e8e6e3]',
    featuredText: 'text-white dark:text-[#e8e6e3]',
  };

  const goldTheme = {
    ...pinkTheme,
    textPrimary: 'text-[#FFED29]',
    shadow: 'shadow-[0px_0px_80px_0px_#FFED2940,0px_0px_8px_0px_#FFED2980]',
    barColor: 'bg-[#ffffff]',
  };

  const greenTheme = {
    textPrimary: 'text-[#07F468] dark:text-[#06c454]',
    textSecondary: 'text-[#FFED29] dark:text-[#FFED29]',
    shadow: 'shadow-[0px_0px_80px_0px_#07F46840,0px_0px_8px_0px_#07F46880]',
    barColor: 'bg-[#FFED29] dark:bg-[#ffee37]',
    barTextColor: 'text-[#FFED29]',
    featuredBg: 'bg-black dark:bg-[#181a1b]',
    buttonBgImage: `url('${tierButtonGreenUrl.value}')`,
    flashLabel: 'text-[#07F468] dark:text-[#06c454]',
    flashText: '#07F468',
    textReNew: 'text-white dark:text-[#e8e6e3]',
    featuredText: 'text-[#07F468] dark:text-[#06c454]',
  };

  const base = {
    title: t('tierCard.demo.title'),
    backgroundImage: tierBgUrl.value,
    stats: { video: 100, image: 80, audio: 70 },
    plans,
    defaultPlan: '6m',
    flashSale: {
      active: true,
      endsIn: t('tierCard.demo.flashSale.endsIn'),
      originalPrice: t('tierCard.demo.flashSale.originalPrice'),
    },
    description: t('tierCard.demo.description'),
  };

  const presets = {
    standardClaim: {
      id: 1,
      ...base,
      isFeatured: true,
      theme: pinkTheme,
      footer: {
        type: 'standard',
        buttonText: t('tierCard.demo.footer.claimOffer'),
        progress: {
          visible: true,
          width: '5%',
          leftText: t('tierCard.demo.footer.fiveLeft'),
          rightText: t('tierCard.demo.footer.offerProgressLow'),
        },
      },
    },
    spendToClaim: {
      id: 2,
      ...base,
      isFeatured: true,
      theme: goldTheme,
      footer: {
        type: 'spend',
        buttonText: t('tierCard.demo.footer.claimOffer'),
        progress: {
          visible: true,
          width: '80%',
          leftText: t('tierCard.demo.footer.spendMore'),
          rightText: t('tierCard.demo.footer.spendProgress'),
        },
      },
    },
    standard95: {
      id: 3,
      ...base,
      isFeatured: true,
      theme: { ...pinkTheme, barTextColor: 'text-[#FB0464]' },
      footer: {
        type: 'standard',
        buttonText: t('tierCard.demo.footer.claimOffer'),
        progress: {
          visible: true,
          width: '95%',
          leftText: t('tierCard.demo.footer.ninetyFiveLeft'),
          rightText: t('tierCard.demo.footer.offerProgressHigh'),
        },
      },
    },
    hiddenProgress: {
      id: 4,
      ...base,
      isFeatured: true,
      theme: { ...pinkTheme, barColor: 'bg-[#FFED29] dark:bg-[#ffee37]' },
      footer: {
        type: 'hidden',
        buttonText: t('tierCard.demo.footer.claimOffer'),
        progress: { visible: false },
      },
    },
    subscribe: {
      id: 5,
      ...base,
      isFeatured: false,
      theme: greenTheme,
      footer: {
        type: 'subscribe',
        buttonText: t('tierCard.demo.footer.subscribe'),
        progress: { visible: false },
      },
    },
  };

  return presets[variant] || presets.standardClaim;
}

/** Resolved card model — real `:tier` wins; otherwise built from `variant`. */
const tier = computed(() => {
  if (props.tier) return props.tier;
  if (props.variant) return buildVariantTier(props.variant);
  return {
    plans: [],
    theme: {},
    footer: {},
    flashSale: {},
    stats: {},
  };
});

/* ===============================
   STATE & LOGIC
================================ */
const activePlan = ref('6m');
const showMorePlans = ref(false);
const cardRef = ref(null);
/** Only show Read more when description is actually truncated. */
const showReadMore = ref(false);

watch(
  () => tier.value?.defaultPlan,
  (planId) => {
    if (planId) activePlan.value = planId;
  },
  { immediate: true },
);

const showPlanSelector = computed(() => {
  if (tier.value?.hidePlanSelector) return false;
  return (tier.value?.plans?.length || 0) > 1;
});

const isEmptyState = computed(() => Boolean(tier.value?.emptyState));
const isFreePrice = computed(
  () => isEmptyState.value || tier.value?.priceDisplay === 'free',
);

/** PlanPage settings list — same TierCard, Figma status/border/checkbox layout. */
const isSettingsList = computed(() => Boolean(tier.value?.settingsList));
const ribbonVariant = computed(() => tier.value?.statusRibbon?.variant || '');
const hasFollowers = computed(() => ribbonVariant.value === 'followers');
/** Published (no followers) → yellow price; followers / draft → white. */
const settingsPriceYellow = computed(
  () => isSettingsList.value && ribbonVariant.value === 'none',
);

/** Stroke color for settings-list frame (drawn as overlay so content cannot cover it). */
const settingsBorderClass = computed(() => {
  if (!isSettingsList.value) return '';
  if (ribbonVariant.value === 'draft') return 'border-[#7E7E7E]';
  if (hasFollowers.value) return 'border-[#07F468]';
  return 'border-[#4D20FF]';
});

/** Featured chip: published = blue gradient; followers = green; draft = grey. */
const featuredBadgeClass = computed(() => {
  const base =
    'absolute -top-2 -left-2 z-[27] flex h-6 w-[115px] items-center justify-center [clip-path:polygon(0_0,100%_0,calc(100%-0.5rem)_100%,0_100%)]';
  if (!isSettingsList.value) {
    return `${base} bg-[#FB0464] dark:bg-[#c90350]`;
  }
  if (hasFollowers.value) return `${base} bg-[#07F468]`;
  if (ribbonVariant.value === 'draft') return `${base} bg-[#D0D5DD]`;
  return base;
});

const featuredBadgeStyle = computed(() => {
  if (!isSettingsList.value) return {};
  if (hasFollowers.value || ribbonVariant.value === 'draft') return {};
  return {
    background: 'linear-gradient(180deg, #4D20FF 0%, #7E5EFF 100%)',
  };
});

const featuredBadgeTextClass = computed(() => {
  if (isSettingsList.value && ribbonVariant.value === 'draft') {
    return 'text-sm font-semibold text-[#0C111D]';
  }
  return 'text-sm font-semibold text-white';
});

const resolvedBgImage = computed(() => {
  if (tier.value?.backgroundImage) return tier.value.backgroundImage;
  if (isSettingsList.value && tierBgUrl.value) return tierBgUrl.value;
  return null;
});

const cardSurfaceStyle = computed(() => {
  if (isEmptyState.value || !resolvedBgImage.value) {
    return {
      backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)',
      backgroundColor: '#5C5C5C',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    };
  }
  return {
    backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.14) 30%,rgba(0,0,0,0.7) 100%), url('${resolvedBgImage.value}')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };
});

const useCheckboxFeatures = computed(() => {
  const list = tier.value?.features;
  if (!Array.isArray(list) || !list.length) return false;
  const first = list[0];
  return typeof first === 'string' || Boolean(first?.html);
});

/** Settings perk check fill — green (followers/draft) or blue (published). Tick is always white. */
const settingsCheckboxClass = computed(() => {
  const fill =
    hasFollowers.value || ribbonVariant.value === 'draft'
      ? 'checked:bg-[#07F468] checked:border-[#07F468]'
      : 'checked:bg-[#4D20FF] checked:border-[#4D20FF]';
  return [
    'h-[14px] w-[14px] min-h-[14px] min-w-[14px] shrink-0 appearance-none [-webkit-appearance:none] rounded-[2px] cursor-pointer',
    'border border-white bg-white',
    fill,
    'checked:border-0 before:!hidden after:!hidden',
  ].join(' ');
});

/** User-toggled perk checks on settings list (start unchecked). */
const featureCheckedMap = ref({});

watch(
  () => tier.value?.id,
  () => {
    featureCheckedMap.value = {};
  },
);

function isFeatureChecked(index) {
  return Boolean(featureCheckedMap.value[index]);
}

function setFeatureChecked(index, value) {
  featureCheckedMap.value = {
    ...featureCheckedMap.value,
    [index]: Boolean(value),
  };
}

const resolvedFeatures = computed(() => {
  if (isEmptyState.value) return [];
  if (Array.isArray(tier.value?.features)) return tier.value.features;
  if (isSettingsList.value) return [];
  return [
    {
      icon: assets.value.takeCoin,
      label: t('tierCard.ui.features.freeTokens'),
      value: t('tierCard.ui.features.freeTokensValue'),
    },
    {
      icon: assets.value.cart,
      label: t('tierCard.ui.features.merchDiscount'),
      value: t('tierCard.ui.features.percentOff10'),
    },
    {
      icon: assets.value.image,
      label: t('tierCard.ui.features.ppvDiscount'),
      value: t('tierCard.ui.features.percentOff10'),
    },
    {
      icon: assets.value.cart,
      label: t('tierCard.ui.features.customRequest'),
      value: t('tierCard.ui.features.percentOff5'),
    },
  ];
});

function featureHtml(feature) {
  return typeof feature === 'string' ? feature : feature?.html || '';
}

const currentPlan = computed(() => {
  return (
    tier.value?.plans?.find((p) => p?.id === activePlan.value) ||
    tier.value?.plans?.[0]
  );
});

/* Activate plan */
function activatePlan(planId) {
  activePlan.value = planId;
  showMorePlans.value = false;
}

/* Toggle popup */
function toggleMorePlans() {
  showMorePlans.value = !showMorePlans.value;
}

/* ===============================
   LINE CLAMP LOGIC (Ported)
================================ */
function measureReadMore(descText, maxLinesHint = null) {
  if (!descText) {
    showReadMore.value = false;
    return;
  }
  const style = getComputedStyle(descText);
  const lineHeight = parseFloat(style.lineHeight) || 20;
  descText.style.webkitLineClamp = 'unset';
  descText.style.display = 'block';
  descText.style.overflow = 'visible';
  const fullHeight = descText.scrollHeight;
  const maxLines =
    maxLinesHint != null
      ? maxLinesHint
      : Math.max(1, Math.floor(fullHeight / lineHeight));
  // Settings list: only clamp/show when content exceeds ~3 lines
  if (isSettingsList.value) {
    const limit = 3;
    const needsClamp = fullHeight > lineHeight * limit + 2;
    showReadMore.value = needsClamp;
    if (needsClamp) {
      descText.style.display = '-webkit-box';
      descText.style.webkitBoxOrient = 'vertical';
      descText.style.overflow = 'hidden';
      descText.style.webkitLineClamp = String(limit);
    } else {
      descText.style.display = 'block';
      descText.style.webkitLineClamp = 'unset';
      descText.style.overflow = 'visible';
    }
    return;
  }

  void maxLines;
  showReadMore.value = false;
}

function resetDescClamp(descText) {
  descText.style.display = "";
  descText.style.webkitBoxOrient = "";
  descText.style.overflow = "";
  descText.style.webkitLineClamp = "unset";
}

function applyDescClamp(descText, lines) {
  descText.style.display = "-webkit-box";
  descText.style.webkitBoxOrient = "vertical";
  descText.style.overflow = "hidden";
  descText.style.webkitLineClamp = String(lines);
}

function clampDescription() {
  if (!cardRef.value) return;

  const content = cardRef.value.querySelector("[data-tier-content]");
  const descWrap = cardRef.value.querySelector("[data-tier-description]");
  const descText = cardRef.value.querySelector("[data-tier-description-text]");
  const featureList = cardRef.value.querySelector("[data-feature-list]");

  if (!content || !descWrap || !descText) {
    showReadMore.value = false;
    return;
  }

  if (isSettingsList.value) {
    measureReadMore(descText);
    return;
  }

  resetDescClamp(descText);

  const contentRect = content.getBoundingClientRect();
  const descRect = descWrap.getBoundingClientRect();

  let usedBelow = 0;
  // Reserve space for read-more row even if currently hidden
  usedBelow += 20;
  if (featureList) usedBelow += featureList.getBoundingClientRect().height;

  usedBelow += window.innerWidth >= 768 ? 24 : 16;

  const availableHeight = contentRect.bottom - descRect.top - usedBelow;

  const style = getComputedStyle(descText);
  const lineHeight = parseFloat(style.lineHeight);

  if (!lineHeight) {
    showReadMore.value = false;
    return;
  }

  const fullHeight = descText.scrollHeight;
  // Cramped / fillHeight cards: never drop below 1 readable line (avoids tops-of-letters clip).
  const maxLines = Math.max(1, Math.floor(Math.max(availableHeight, lineHeight) / lineHeight));

  applyDescClamp(descText, maxLines);
  showReadMore.value = fullHeight > lineHeight * maxLines + 2;
}

watch(
  () => tier.value?.description,
  async () => {
    await nextTick();
    clampDescription();
  },
);

watch(isSettingsList, async () => {
  await nextTick();
  clampDescription();
});

watch(
  () => props.fillHeight,
  async () => {
    await nextTick();
    clampDescription();
  },
);

onMounted(async () => {
  await nextTick();
  clampDescription();
  window.addEventListener("resize", clampDescription);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", clampDescription);
});
</script>

<template>
  <div
    ref="cardRef"
    data-tier-card-wrapper
    class="relative overflow-visible"
    :class="[
      fillHeight ? 'h-full' : '',
      tier?.statusRibbon ? 'pb-1' : '',
    ]"
  >
    <div
      class="relative mx-auto w-[384px] h-[602px] max-w-[384px] rounded-[5px]"
      :class="[
        fillHeight ? '!h-full !max-h-full !w-full !max-w-full' : '',
        isSettingsList ? '' : tier?.theme?.shadow,
      ]"
      :style="cardSurfaceStyle"
    >
      <!-- 1.5px frame above blur/ribbon so all 4 sides stay visible -->
      <div
        v-if="isSettingsList"
        class="pointer-events-none absolute inset-0 z-[24] rounded-[5px] border-[1.5px] border-solid"
        :class="settingsBorderClass"
        aria-hidden="true"
      />
      <button
        v-if="isSettingsList"
        type="button"
        class="absolute top-[0px] right-[0px] z-[26] flex h-9 w-9 items-center justify-center rounded-[1px] bg-[#000000BF] p-0 outline-none ring-0"
        :aria-label="t('plan.page.alt.settings')"
        :aria-expanded="settingsMenuOpen"
        @click.stop="settingsMenuOpen = !settingsMenuOpen"
      >
        <img
          v-if="planAssets.threeDots"
          :src="planAssets.threeDots"
          alt=""
          class="h-5 w-5 object-contain brightness-0 invert"
        />
      </button>
      <div
        v-if="tier?.isFeatured"
        :class="featuredBadgeClass"
        :style="featuredBadgeStyle"
      >
        <span :class="featuredBadgeTextClass">{{ t('tierCard.ui.featured') }}</span>
      </div>
      <div
        class="relative h-full flex flex-col rounded-[5px]"
        :class="isEmptyState ? 'bg-transparent' : 'bg-black/30 backdrop-blur-[5px]'"
      >
        <TierCardSettingsHover
          v-if="isSettingsList"
          :open="settingsMenuOpen"
          :status="tier?.status || 'draft'"
          :is-featured="Boolean(tier?.isFeatured)"
          :has-media="Boolean(tier?.hasMedia)"
          :can-publish-slot="tier?.canPublishSlot !== false"
          :followers="Number(tier?.followers) || 0"
          @close="settingsMenuOpen = false"
          @edit="emit('settings-edit', tier)"
          @publish="emit('settings-publish', tier)"
          @add-media="emit('settings-add-media', tier)"
          @delete="emit('settings-delete', tier)"
          @feature="emit('settings-feature', tier)"
          @unfeature="emit('settings-unfeature', tier)"
          @unpublish="emit('settings-unpublish', tier)"
        />
        <div
          data-tier-content
          class="flex flex-col gap-3 px-4 pt-5 overflow-y-hidden grow [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none]"
          :class="tier?.statusRibbon ? 'pb-16' : 'pb-4'"
        >
          <span class="flex items-center">
            <div
              class="w-full text-[1.875rem] z-[5] relative overflow-hidden drop-shadow-[0px_4px_18px_#00000080] hover:overflow-visible hover:cursor-pointer group"
            >
              <h2
                class="text-[1.875rem] leading-[2.375rem] font-semibold overflow-hidden line-clamp-2 text-white dark:text-[#e8e6e3]"
              >
                {{ tier?.title }}
              </h2>
              <div
                class="absolute z-[2] flex flex-col items-start w-full max-w-[22.4375rem] md:max-w-[21.5rem] opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto text-xs leading-normal font-medium text-white py-2 px-3 rounded-lg bg-[#101828B2] dark:bg-[rgba(14,19,32,0.9)] dark:text-[#dbd8d3] [box-shadow:0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] [backdrop-filter:blur(25px)] left-1/2 top-full translate-x-[-50%] translate-y-2"
              >
                <span
                  class="pointer-events-none absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 -translate-y-full border-x-[6px] border-b-[6px] border-x-transparent border-b-[#101828B2] dark:border-b-[rgba(14,19,32,0.9)]"
                  aria-hidden="true"
                />
                {{ tier?.title }}
              </div>
            </div>
          </span>

          <TierCardStats :stats="tier?.stats" :muted="isEmptyState" />

          <div v-if="showPlanSelector" class="flex items-center gap-2 py-2">
            <div
              class="flex bg-white/15 rounded-[3.125rem] backdrop-blur-[25px] w-1/2 sm:w-full dark:bg-[#181a1b26]"
            >
              <button
                v-for="plan in tier.plans"
                :key="plan.id"
                @click.stop="activatePlan(plan.id)"
                :class="
                  activePlan === plan?.id
                    ? '!flex bg-black dark:bg-[#181a1b]'
                    : 'hidden sm:flex'
                "
                class="justify-center items-center gap-0.5 px-2.5 py-1.5 rounded-[3.125rem] w-full cursor-pointer sm:grow"
              >
                <span
                  class="text-xs leading-normal font-medium whitespace-nowrap text-white dark:text-[#e8e6e3]"
                  >{{ plan.label }}</span
                >
                <span
                  v-if="plan.discount"
                  class="text-xs leading-normal font-medium text-[#FFED29] dark:text-[#ffee37]"
                  >{{ plan.discount }}</span
                >
              </button>
            </div>
            <button
              @click.stop="toggleMorePlans"
              class="flex justify-center items-center gap-0.5 px-2.5 py-1.5 rounded-[3.125rem] bg-white/15 backdrop-blur-[25px] cursor-pointer w-1/2 sm:hidden dark:bg-[#181a1b26]"
            >
              <span
                class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]"
                >{{ t('tierCard.ui.morePlans') }}</span
              >
            </button>
          </div>

          <!-- Settings list price: published = #FFCD29; followers/draft = white -->
          <div v-if="isSettingsList" class="flex items-end gap-1">
            <div
              class="flex items-baseline"
              :class="settingsPriceYellow ? 'text-[#FFCD29]' : 'text-white'"
            >
              <span
                v-if="!isFreePrice"
                class="text-xl font-semibold opacity-100"
              >{{ t('tierCard.ui.usdPrefix') }}</span>
              <span class="text-5xl font-semibold tracking-tighter">
                {{ isFreePrice ? '0' : currentPlan?.price }}
              </span>
            </div>
            <div v-if="tier?.discountLabel && tier?.oldPrice" class="mb-1 flex flex-col gap-0.5">
              <div
                class="flex h-5 w-max items-center justify-center px-1.5 text-sm font-bold"
                :class="
                  settingsPriceYellow
                    ? 'bg-[#FFCD29] text-[#0C111D]'
                    : 'bg-[#949494] text-white'
                "
              >
                {{ tier.discountLabel }}
              </div>
              <div class="flex items-end gap-1">
                <span
                  class="text-sm font-medium line-through"
                  :class="settingsPriceYellow ? 'text-[#FFCD29]/80' : 'text-white/80'"
                >${{ tier.oldPrice }}</span>
                <span
                  class="text-[0.625rem]"
                  :class="settingsPriceYellow ? 'text-[#FFCD29]' : 'text-white'"
                >{{ t('subscriptionCard.perMonth') }}</span>
              </div>
            </div>
            <span
              v-else
              class="mb-2 text-[0.625rem] leading-[0.8125rem]"
              :class="settingsPriceYellow ? 'text-[#FFCD29]' : 'text-white'"
            >
              {{ t('subscriptionCard.perMonth') }}
            </span>
          </div>

          <div v-else class="flex gap-2">
            <div v-if="isFreePrice" class="flex items-baseline">
              <span class="text-4xl leading-[2.75rem] font-semibold tracking-[-0.045rem] text-white dark:text-[#e8e6e3]">
                {{ t('tierCard.ui.free') }}
              </span>
            </div>
            <template v-else>
              <div class="flex items-baseline">
                <span
                  class="text-xl leading-normal font-semibold text-white"
                  :class="tier?.theme?.textSecondary"
                  >{{ t('tierCard.ui.usdPrefix') }}</span
                >
                <span
                  class="text-4xl leading-[2.75rem] font-semibold tracking-[-0.045rem]"
                  :class="tier?.theme?.textSecondary"
                  >{{ currentPlan?.price }}</span
                >
              </div>

              <div class="flex flex-col justify-between">
                <div
                  v-if="tier?.flashSale?.active"
                  class="flex items-baseline gap-1 relative pl-4 pr-1 rounded bg-black ml-[0.3125rem] flex-wrap dark:bg-[#181a1b] max-[360px]:py-1 max-[360px]:w-min"
                >
                  <img
                    :src="assets.flash"
                    :alt="t('tierCard.alt.flash')"
                    class="absolute -left-1.5 top-1/2 -translate-y-1/2 h-5"
                  />

                  <span
                    class="text-[0.6875rem] leading-none whitespace-nowrap"
                    :class="tier.theme.flashLabel"
                  >
                    {{ t('tierCard.ui.saleEndsIn') }}
                  </span>

                  <div class="flex items-center gap-0.5">
                    <span
                      class="text-xs leading-normal font-bold"
                      :style="{ color: tier.theme.flashText }"
                    >
                      {{ tier.flashSale.endsIn }}
                    </span>
                  </div>
                </div>

                <span
                  v-if="tier?.flashSale?.active"
                  class="text-xs leading-normal font-medium line-through text-white dark:text-[#e8e6e3]"
                >
                  {{ tier?.flashSale?.originalPrice }}
                </span>
              </div>
            </template>
          </div>

          <div
            data-tier-description
            class="flex min-h-[1.25rem] flex-col sm:gap-2 drop-shadow-[0px_2px_12px_0px_#000000BF]"
            :class="isSettingsList ? 'shrink' : 'shrink-0'"
          >
            <div
              v-if="isSettingsList"
              data-tier-description-text
              class="text-sm text-white drop-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]"
              v-html="tier?.description"
            />
            <p
              v-else
              data-tier-description-text
              class="min-h-[1.25rem] text-sm leading-5 drop-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]"
              :class="isEmptyState ? 'text-[#D0D5DD] dark:text-[#cfcac4]' : 'text-white dark:text-[#e8e6e3]'"
            >
              {{ tier?.description }}
            </p>
            <button
              v-if="!isEmptyState && showReadMore"
              data-read-more
              type="button"
              class="flex items-center gap-0.5 shrink-0"
            >
              <span
                class="text-xs leading-normal font-medium"
                :class="isSettingsList ? 'text-[#07F468]' : 'text-[#D0D5DD] dark:text-[#cfcac4]'"
                >{{ isSettingsList ? t('subscriptionCard.readMore') : t('tierCard.ui.readMore') }}</span
              >
              <img
                v-if="!isSettingsList"
                :src="assets.doubleArrows"
                :alt="t('tierCard.alt.doubleArrows')"
                class="w-4 h-4"
              />
            </button>
          </div>

          <!-- Settings: white square checkboxes — above ribbon, clear of slanted badge -->
          <ul
            v-if="resolvedFeatures.length && useCheckboxFeatures"
            data-feature-list
            class="mt-auto flex w-full shrink-0 flex-col gap-2 drop-shadow-[0px_2px_12px_0px_#000000BF]"
          >
            <li v-for="(feature, index) in resolvedFeatures" :key="`cb-${index}`">
              <CheckboxGroup
                :model-value="isFeatureChecked(index)"
                theme=""
                :custom-check-mark="true"
                tick-stroke="#FFFFFF"
                wrapper-class="relative z-[2] flex items-center gap-2 cursor-pointer"
                :checkbox-class="settingsCheckboxClass"
                label-class="text-sm text-white"
                @update:model-value="setFeatureChecked(index, $event)"
              >
                <span v-html="featureHtml(feature)" />
              </CheckboxGroup>
            </li>
          </ul>

          <ul
            v-else-if="resolvedFeatures.length"
            data-feature-list
            class="flex flex-col gap-1 drop-shadow-[0px_2px_12px_0px_#000000BF]"
          >
            <li
              v-for="(feature, index) in resolvedFeatures"
              :key="`${feature.label}-${index}`"
              class="flex items-start gap-4"
            >
              <div class="flex items-center gap-2 w-1/2">
                <img
                  v-if="feature.icon"
                  :src="feature.icon"
                  class="w-4 h-4"
                  alt=""
                />
                <span class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]">
                  {{ feature.label }}
                </span>
              </div>
              <span class="text-sm font-medium text-white dark:text-[#e8e6e3] w-1/2">
                {{ feature.value }}
              </span>
            </li>
          </ul>
        </div>

        <div
          v-if="tier?.footer?.type === 'standard'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold"  :style="{ color: tier.theme.textPrimary }">
                  {{ t('tierCard.ui.planForPrice', { label: currentPlan?.label, price: currentPlan?.price }) }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem]"
                  :class="tier?.theme?.textReNew"
                >
                  {{ t('tierCard.ui.renewsAt', { price: currentPlan?.price, label: currentPlan?.label }) }}
                </p>
              </div>
              <div class="flex flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="h-full rounded-[0.3125rem]"
                    :class="tier?.theme?.barColor"
                    :style="{ width: tier?.footer?.progress?.width }"
                  ></div>
                </div>
                <div class="flex justify-between gap-1">
                  <span
                    class="text-xs leading-normal font-medium"
                    :class="tier.theme.barTextColor"
                    >{{ tier?.footer?.progress?.leftText }}</span
                  >
                  <span
                    class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                    >{{ tier?.footer?.progress?.rightText }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier?.theme?.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier?.footer?.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'spend'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 p-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :class="tier?.theme?.textPrimary">
                  {{ t('tierCard.ui.planForPrice', { label: currentPlan?.label, price: currentPlan?.price }) }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem] "
                  :class="tier?.theme?.textReNew"
                >
                  {{ t('tierCard.ui.renewsAt', { price: currentPlan?.price, label: currentPlan?.label }) }}
                </p>
              </div>
              <div class="flex flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="h-full rounded-[0.3125rem]"
                    :class="tier?.theme?.barColor"
                    :style="{ width: tier?.footer?.progress?.width }"
                  ></div>
                </div>
                <div class="flex justify-between gap-1">
                  <div class="flex items-center gap-1">
                    <span
                      class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                      >{{ tier?.footer?.progress?.leftText }}</span
                    >
                    <div
                      class="relative inline-flex overflow-hidden cursor-pointer group hover:overflow-visible"
                    >
                      <img
                        :src="assets.tooltip"
                        :alt="t('tierCard.alt.tooltip')"
                        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(15%)_sepia(83%)_saturate(7346%)_hue-rotate(330deg)_brightness(98%)_contrast(100%)]"
                      />
                      <div
                        class="absolute z-[2] opacity-0 group-hover:opacity-100 flex flex-col items-start w-[8.6875rem] text-xs text-white bg-[#101828B2] p-2 rounded-lg left-1/2 bottom-full translate-x-[-50%] -translate-y-2"
                      >
                        <p>
                          {{ t('tierCard.ui.spendingTooltip') }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-xs leading-normal font-medium text-[#D0D5DD] dark:text-[#cfcac4]"
                    >{{ tier?.footer?.progress?.rightText }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier?.theme?.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier?.footer?.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'hidden'"
          class="flex cursor-pointer rounded-t-[0.625rem] w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#FF8FBA40] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :style="{ color: tier.theme.textPrimary }">
                  {{ t('tierCard.ui.planForPrice', { label: currentPlan.label, price: currentPlan.price }) }}
                </h3>
                <p
                  class="text-[0.65625rem] leading-[1.125rem]"
                  :class="tier?.theme?.textReNew"
                >
                  {{ t('tierCard.ui.renewsAt', { price: currentPlan.price, label: currentPlan.label }) }}
                </p>
              </div>
              <div class="hidden flex-col gap-[0.4375rem]">
                <div
                  class="w-full h-[0.3125rem] rounded-[0.3125rem] bg-white/20 dark:bg-[#181a1b33]"
                >
                  <div
                    class="w-[5%] h-full rounded-[0.3125rem]"
                    :class="tier.theme.barColor"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-8 pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier.theme.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier.footer.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'subscribe'"
          class="flex cursor-pointer rounded-t-[0.625rem] overflow-hidden w-full min-h-fit mt-auto relative shadow-[0px_-8px_24px_0px_#07F46840] bg-black dark:bg-[#181a1b]"
        >
          <div class="flex items-center z-[1] w-full min-h-[5rem]">
            <div class="flex flex-col gap-2 pl-2 py-2 w-full">
              <div class="flex flex-col">
                <h3 class="text-lg font-bold" :class="tier.theme.textPrimary">
                  {{ t('tierCard.ui.planForPrice', { label: currentPlan.label, price: currentPlan.price }) }}
                </h3>
                <p
                  class="text-xs leading-normal font-medium"
                  :class="tier?.theme?.textReNew"
                >
                  {{ t('tierCard.ui.renewsAt', { price: currentPlan.price, label: currentPlan.label }) }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center items-center pl-[1.625rem] pr-2.5 w-max z-[0] bg-cover bg-no-repeat"
            :style="{ backgroundImage: tier.theme.buttonBgImage }"
          >
            <span
              class="text-base font-bold italic text-[#0C111D] dark:text-[#dbd8d3]"
              v-html="tier.footer.buttonText"
            ></span>
          </div>
        </div>

        <div
          v-else-if="tier?.footer?.type === 'subscribeFree'"
          class="w-full"
        >
          <button
            type="button"
            class="flex w-full h-[80px]  items-center justify-center rounded-t-[5px] bg-[#07F468] text-[18px] font-bold uppercase text-[#0C111D]"
          >
            {{ tier.footer.buttonText }}
          </button>
        </div>

        <!-- Status ribbon — hide under settings hover so it cannot show through -->
        <div
          v-if="tier?.statusRibbon"
          class="absolute -bottom-px right-0 z-[6] [filter:drop-shadow(4px_4px_0_#000000)] transition-opacity duration-200"
          :class="
            settingsMenuOpen
              ? 'pointer-events-none opacity-0'
              : ''
          "
        >
          <DashboardPrimaryButton
            :text="tier.statusRibbon.text"
            variant="none"
            type="button"
            :textClass="
              ribbonVariant === 'draft'
                ? '!text-sm !font-semibold !normal-case !text-[#0C111D]'
                : ribbonVariant === 'followers'
                  ? '!text-[24px] !font-semibold !leading-none !normal-case !text-[#0C111D]'
                  : '!text-[24px] !font-semibold !leading-none !normal-case !text-white'
            "
            :customClass="[
              '!min-w-0 flex items-center justify-center pl-6 pr-3 [clip-path:polygon(19px_0%,100%_0%,100%_100%,0%_100%,19px_0%)]',
              ribbonVariant === 'draft'
                ? 'h-9 border-2 border-[#0C111D] bg-[#D0D5DD]'
                : ribbonVariant === 'followers'
                  ? 'h-14 bg-[#07F468]'
                  : 'h-14 bg-[#4D20FF]',
            ].join(' ')"
          />
        </div>
      </div>
    </div>
  </div>

  <div
    data-more-plans-popup
    :class="showMorePlans ? 'flex' : 'hidden'"
    class="fixed bottom-0 left-0 w-full rounded-t-[0.625rem] bg-white shadow-[0px_0px_12px_0px_#0000001A] backdrop-blur-[50px] z-[5] sm:!hidden dark:bg-[#181a1b]"
  >
    <div class="flex flex-col py-1 w-full">
      <div
        v-for="plan in tier.plans"
        :key="plan.id"
        @click="activatePlan(plan.id)"
        @click.stop="activatePlan(plan.id)"
        class="flex justify-center items-center h-11 px-1.5 py-0.5 cursor-pointer"
        :class="
          activePlan === plan.id
            ? 'bg-[#F2F4F7] dark:bg-[#1e2022] discount-active'
            : ''
        "
      >
        <div
          class="flex justify-between items-center gap-6 px-2.5 py-2 w-full max-[350px]:gap-2"
        >
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              <span
                class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
                >{{ plan.label }}</span
              >
              <span
                v-if="plan.discount"
                class="text-xs leading-normal font-medium text-[#FF0066] dark:text-[#ff1a76]"
                >{{ plan.discount }}</span
              >
            </div>

            <div v-if="plan.isMostValue" class="backdrop-blur-[10px]">
              <div
                class="flex justify-center items-center gap-1 rounded ml-2 pl-2.5 pr-1.5 py-0.5 backdrop-blur-[10px] bg-[#FCE40D] dark:bg-[#a19102]"
              >
                <img
                  :src="assets.hot"
                  :alt="t('tierCard.alt.hot')"
                  class="absolute -top-1 -left-2 w-6 h-6"
                />
                <span
                  class="text-[0.625rem] leading-normal whitespace-nowrap font-semibold text-black dark:text-[#e8e6e3]"
                  >{{ t('tierCard.ui.mostValue') }}</span
                >
              </div>
            </div>
          </div>
          <span class="text-base font-semibold text-black dark:text-[#e8e6e3]"
            >{{ t('tierCard.ui.usdPrice', { price: plan.price }) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
