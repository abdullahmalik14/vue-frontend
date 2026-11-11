<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import TipModelCard from '@/dev/components/checkout/tip/TipModelCard.vue';
import TipAmountOption from '@/dev/components/checkout/tip/TipAmountOption.vue';

const { t } = useI18n();

const NOTES_MAX = 300;
const CARD_STEP_PX = 112 + 12;

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cardLast4: { type: String, default: '3374' },
  models: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'skip']);

const { url: avatarUrl } = useAssetUrl('checkout.tip.avatarCarrot');
const { url: iconStar } = useAssetUrl('checkout.tip.iconStar');
const { url: iconHeart } = useAssetUrl('checkout.tip.iconHeart');
const { url: iconCoffee } = useAssetUrl('checkout.tip.iconCoffee');
const { url: iconMoney } = useAssetUrl('checkout.tip.iconMoney');
const { url: iconCustom } = useAssetUrl('checkout.tip.iconCustom');
const { url: heroStar } = useAssetUrl('checkout.tip.heroStar');
const { url: heroHeart } = useAssetUrl('checkout.tip.heroHeart');
const { url: heroCoffee } = useAssetUrl('checkout.tip.heroCoffee');
const { url: heroMoney } = useAssetUrl('checkout.tip.heroMoney');
const { url: heroCustom } = useAssetUrl('checkout.tip.heroCustom');
const { url: faceSmileUrl } = useAssetUrl('checkout.demo.faceSmile');
const { url: closeGreenUrl } = useAssetUrl('plan.icon.closeGreen');

/** height/width untouched — chrome styles live on inner shell */
const popupConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'scale',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '641px', '<768': '100%' },
  height: { default: '90%', '<768': '100%' },
  scrollable: true,
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const defaultModels = computed(() => {
  if (props.models?.length) return props.models;
  const avatar = avatarUrl.value || '';
  const shapeCycle = [1, 2, 3, 4, 2, 1];
  return Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    name: t('checkout.tip.demoModelName'),
    username: t('checkout.tip.demoModelUsername'),
    avatarSrc: avatar,
    shape: shapeCycle[i % shapeCycle.length],
  }));
});

const selectedIds = ref([]);
const notes = ref('');
const selectedAmountId = ref('5');
const customAmount = ref('');
const sliderTrackRef = ref(null);
const canSlidePrev = ref(false);
const canSlideNext = ref(false);

/** Row = small CDN icons; hero = larger same cup/style assets (not emoji text) */
const tipOptions = computed(() => [
  { id: '1', amount: 1, label: t('checkout.tip.amount1'), iconSrc: iconStar.value, heroSrc: heroStar.value, iconClass: 'w-10 h-10 object-contain' },
  { id: '3', amount: 3, label: t('checkout.tip.amount3'), iconSrc: iconHeart.value, heroSrc: heroHeart.value, iconClass: 'w-10 h-10 object-contain' },
  { id: '5', amount: 5, label: t('checkout.tip.amount5'), iconSrc: iconCoffee.value, heroSrc: heroCoffee.value, iconClass: 'w-12 h-12 object-contain' },
  { id: '10', amount: 10, label: t('checkout.tip.amount10'), iconSrc: iconMoney.value, heroSrc: heroMoney.value, iconClass: 'w-10 h-10 object-contain' },
  { id: 'custom', amount: null, label: t('checkout.tip.custom'), iconSrc: iconCustom.value, heroSrc: heroCustom.value, iconClass: 'w-10 h-10 object-contain' },
]);

const selectedTipOption = computed(() =>
  tipOptions.value.find((o) => o.id === selectedAmountId.value) || tipOptions.value[2],
);

const selectedAmount = computed(() => {
  if (selectedAmountId.value === 'custom') {
    const n = Number(customAmount.value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  return selectedTipOption.value?.amount ?? 0;
});

const tipBadgeLabel = computed(() => {
  if (selectedAmountId.value === 'custom') {
    return selectedAmount.value ? `$${selectedAmount.value}` : t('checkout.tip.custom');
  }
  return selectedTipOption.value?.label || t('checkout.tip.amount5');
});

const heroIconSrc = computed(
  () => selectedTipOption.value?.heroSrc || selectedTipOption.value?.iconSrc || iconCoffee.value,
);

const selectedCount = computed(() => selectedIds.value.length);

const selectedTotalLabel = computed(() => {
  if (!selectedCount.value) return '$0';
  return `$${selectedAmount.value * selectedCount.value}`;
});

const charsLeftLabel = computed(() =>
  t('checkout.tip.charactersLeft', {
    count: Math.max(0, NOTES_MAX - (notes.value?.length || 0)),
  }),
);

const chargeAmountLabel = computed(() => `$${selectedAmount.value || 0}`);
const cardEndingLabel = computed(() => `*${props.cardLast4}`);

const updateSliderNav = () => {
  const el = sliderTrackRef.value;
  if (!el) {
    canSlidePrev.value = false;
    canSlideNext.value = false;
    return;
  }
  const max = el.scrollWidth - el.clientWidth;
  canSlidePrev.value = el.scrollLeft > 2;
  canSlideNext.value = el.scrollLeft < max - 2;
};

const slidePrev = () => {
  const el = sliderTrackRef.value;
  if (!el) return;
  el.scrollBy({ left: -CARD_STEP_PX, behavior: 'smooth' });
};

const slideNext = () => {
  const el = sliderTrackRef.value;
  if (!el) return;
  el.scrollBy({ left: CARD_STEP_PX, behavior: 'smooth' });
};

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    selectedIds.value = defaultModels.value[1]
      ? [defaultModels.value[1].id]
      : defaultModels.value[0]
        ? [defaultModels.value[0].id]
        : [];
    notes.value = '';
    selectedAmountId.value = '5';
    customAmount.value = '';
    await nextTick();
    if (sliderTrackRef.value) {
      sliderTrackRef.value.scrollLeft = 0;
      updateSliderNav();
    }
  },
);

const close = () => {
  emit('update:modelValue', false);
  emit('skip');
};

const toggleModel = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const deselectModel = (id) => {
  selectedIds.value = selectedIds.value.filter((x) => x !== id);
};

const selectAll = () => {
  selectedIds.value = defaultModels.value.map((m) => m.id);
};

const onNotesInput = (val) => {
  notes.value = String(val || '').slice(0, NOTES_MAX);
};

const confirmTip = () => {
  emit('confirm', {
    modelIds: [...selectedIds.value],
    amount: selectedAmount.value,
    notes: notes.value,
  });
  emit('update:modelValue', false);
};
</script>

<template>
  <BasePopup
    :modelValue="modelValue"
    :popupConfig="popupConfig"
    @update:modelValue="(val) => { if (!val) close(); else emit('update:modelValue', val); }"
  >
    <div
      class="w-[641px] max-w-full pt-4 pb-6 relative bg-white/10 rounded-[10px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] backdrop-blur-2xl inline-flex flex-col justify-start items-center gap-6 overflow-x-hidden"
    >
      <!-- Header — title centered; close sits absolute top-right -->
      <div class="self-stretch px-4 relative flex justify-center items-start">
        <div class="flex flex-col justify-center items-center gap-2 px-8">
          <Heading
            tag="h2"
            theme="custom"
            no-wrap
            :text="t('checkout.tip.title')"
            add-class="text-center text-[#F9FAFB] text-3xl font-semibold leading-9 whitespace-pre-line"
          />
        </div>
        <button
          type="button"
          class="absolute right-4 top-0 w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
          :aria-label="t('checkout.tip.closeAlt')"
          @click="close"
        >
          <img v-if="closeGreenUrl" :src="closeGreenUrl" alt="" class="w-4 h-4" />
          <span v-else class="block w-4 h-4 border-2 border-[#07F468]" aria-hidden="true" />
        </button>
      </div>
      <!-- Model slider -->
      <div class="self-stretch px-4 flex flex-col justify-center items-start gap-4">
        <div class="self-stretch inline-flex justify-center items-center gap-2.5">
          <Heading
            tag="h3"
            theme="custom"
            no-wrap
            :text="t('checkout.tip.chooseModels')"
            add-class="text-center text-[#EAECF0] text-base font-semibold leading-6"
          />
        </div>

        <div class="self-stretch relative flex items-center gap-2">
          <button
            type="button"
            class="w-6 h-6 p-1 bg-white/5 rounded-[20px] backdrop-blur-[10px] flex justify-center items-center border-none cursor-pointer disabled:opacity-30 shrink-0 z-20"
            :disabled="!canSlidePrev"
            :aria-label="t('checkout.tip.prevModelsAlt')"
            @click="slidePrev"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
              <path d="M6.5 1L1.5 6L6.5 11" stroke="#07F468" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div
            ref="sliderTrackRef"
            class="flex-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-5 pb-2"
            @scroll="updateSliderNav"
          >
            <div class="inline-flex items-end gap-3 min-h-[8.5rem] px-1">
              <template v-for="model in defaultModels" :key="model.id">
                <BaseTooltip
                  v-if="selectedIds.includes(model.id)"
                  placement="bottom"
                  :width="240"
                >
                  <template #trigger>
                    <TipModelCard
                      :name="model.name"
                      :username="model.username"
                      :avatar-src="model.avatarSrc || avatarUrl"
                      :shape="model.shape"
                      :selected="true"
                      :tip-label="tipBadgeLabel"
                      @select="toggleModel(model.id)"
                      @deselect="deselectModel(model.id)"
                    />
                  </template>
                  <Paragraph
                    theme="custom"
                    no-wrap
                    :text="t('checkout.tip.firstTipTooltip')"
                    add-class="text-center text-white text-xs font-medium leading-4"
                  />
                </BaseTooltip>

                <TipModelCard
                  v-else
                  :name="model.name"
                  :username="model.username"
                  :avatar-src="model.avatarSrc || avatarUrl"
                  :shape="model.shape"
                  :selected="false"
                  :tip-label="tipBadgeLabel"
                  @select="toggleModel(model.id)"
                  @deselect="deselectModel(model.id)"
                />
              </template>
            </div>
          </div>

          <button
            type="button"
            class="w-6 h-6 p-1 bg-white/5 rounded-[20px] backdrop-blur-[10px] flex justify-center items-center border-none cursor-pointer disabled:opacity-30 shrink-0 z-20"
            :disabled="!canSlideNext"
            :aria-label="t('checkout.tip.nextModelsAlt')"
            @click="slideNext"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
              <path d="M1.5 1L6.5 6L1.5 11" stroke="#07F468" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div class="self-stretch inline-flex justify-end items-end gap-2">
          <div class="rounded-sm flex justify-center items-center gap-1 text-[10px] leading-4">
            <Paragraph
              theme="custom"
              no-wrap
              :text="String(selectedCount)"
              add-class="text-[#07F468] font-medium text-[10px] leading-4"
            />
            <Paragraph
              theme="custom"
              no-wrap
              :text="t('checkout.tip.selectedWord')"
              add-class="text-white font-normal text-[10px] leading-4"
            />
            <Paragraph
              theme="custom"
              no-wrap
              :text="t('checkout.tip.selectedSep')"
              add-class="text-white font-normal text-[10px] leading-4"
            />
            <Paragraph
              theme="custom"
              no-wrap
              :text="selectedTotalLabel"
              add-class="text-[#07F468] font-medium text-[10px] leading-4"
            />
          </div>
          <button
            type="button"
            class="px-2 py-1 rounded  outline outline-1 outline-[#07F468] bg-transparent flex justify-center items-center cursor-pointer"
            @click="selectAll"
          >
            <Paragraph
              theme="custom"
              no-wrap
              :text="t('checkout.tip.selectAll')"
              add-class="text-center text-[#07F468] text-xs font-medium leading-3"
            />
          </button>
        </div>
      </div>

      <!-- Hero + copy — same 3D cup asset as Figma (CDN image, not emoji text) -->
      <div class="self-stretch px-4 flex flex-col justify-start items-center gap-2 relative z-10 isolate">
        <div class="flex flex-col justify-center items-center gap-2">
          <img
            v-if="heroIconSrc"
            :src="heroIconSrc"
            alt=""
            class="w-[150px] h-[150px] object-contain"
            decoding="async"
          />
          <Heading
            tag="h3"
            theme="custom"
            no-wrap
            :text="t('checkout.tip.selectTipBelow')"
            add-class="text-center text-[#F9FAFB] text-base font-semibold leading-6"
          />
        </div>
        <p class="self-stretch px-6 text-center text-sm leading-5">
          <span class="text-[#98A2B3] font-medium">{{ t('checkout.tip.supportHelpPrefix') }} </span>
          <span class="text-[#D0D5DD] font-semibold">{{ t('checkout.tip.demoSupportHandle') }}</span>
          <span class="text-[#98A2B3] font-medium"> {{ t('checkout.tip.supportHelpSuffix') }}</span>
        </p>
        <div class="self-stretch">
          <DashboardTextInput
            :model-value="notes"
            theme="tipCheckoutNotes"
            :show-label="false"
            :placeholder="t('checkout.tip.notesPlaceholder')"
            right-span
            :right-span-text="charsLeftLabel"
            right-span-class="!text-[10px] !font-normal !leading-4 tracking-tight text-[#F9FAFB] opacity-70 whitespace-nowrap"
            :right-icon="faceSmileUrl"
            right-icon-class="!opacity-100 [filter:brightness(0)_saturate(100%)_invert(72%)_sepia(64%)_saturate(483%)_hue-rotate(85deg)_brightness(101%)_contrast(101%)]"
            @update:model-value="onNotesInput"
          />
        </div>
      </div>

      <!-- Tip amounts -->
      <div class="self-stretch px-8 pt-4 inline-flex justify-between items-end">
        <template v-for="opt in tipOptions" :key="opt.id">
          <BaseTooltip
            v-if="selectedAmountId === opt.id"
            placement="top"
            :width="200"
          >
            <template #trigger>
              <TipAmountOption
                :icon-src="opt.iconSrc"
                :label="opt.label"
                :icon-class="opt.iconClass"
                :selected="true"
                @select="selectedAmountId = opt.id"
              />
            </template>
            <Paragraph
              theme="custom"
              no-wrap
              :text="t('checkout.tip.fansTipTooltip')"
              add-class="text-center text-white text-xs font-medium leading-4"
            />
          </BaseTooltip>

          <TipAmountOption
            v-else
            :icon-src="opt.iconSrc"
            :label="opt.label"
            :icon-class="opt.iconClass"
            :selected="false"
            @select="selectedAmountId = opt.id"
          />
        </template>
      </div>

      <div v-if="selectedAmountId === 'custom'" class="self-stretch px-8">
        <DashboardTextInput
          v-model="customAmount"
          theme="tipCheckoutNotes"
          type="number"
          :show-label="false"
          :show-controls="false"
          :placeholder="t('checkout.tip.customAmountPlaceholder')"
        />
      </div>

      <!-- Disclaimer + CTA -->
      <div class="self-stretch px-4 flex flex-col justify-end items-start gap-2">
        <div class="self-stretch flex flex-wrap justify-center items-center gap-x-1 text-center text-sm font-normal tracking-tight">
          <Paragraph
            theme="custom"
            no-wrap
            :text="t('checkout.tip.chargePrefix')"
            add-class="text-[#98A2B3] text-sm font-normal tracking-tight"
          />
          <Paragraph
            theme="custom"
            no-wrap
            :text="chargeAmountLabel"
            add-class="text-[#07F468] text-sm font-normal tracking-tight"
          />
          <Paragraph
            theme="custom"
            no-wrap
            :text="t('checkout.tip.chargeMiddle')"
            add-class="text-[#98A2B3] text-sm font-normal tracking-tight"
          />
          <Paragraph
            theme="custom"
            no-wrap
            :text="cardEndingLabel"
            add-class="text-[#07F468] text-sm font-normal tracking-tight"
          />
          <Paragraph
            theme="custom"
            no-wrap
            :text="t('checkout.tip.chargeSuffix')"
            add-class="text-[#98A2B3] text-sm font-normal tracking-tight"
          />
        </div>
        <DashboardPrimaryButton
          :text="t('checkout.tip.confirmTip')"
          theme="confirmTip"
          class="self-stretch w-full"
          :wrapper-overrides="[
            { target: 'wrapper1', addClass: 'w-full self-stretch' },
            { target: 'wrapper2', addClass: 'w-full' },
          ]"
          :disabled="!selectedCount || !selectedAmount"
          @click="confirmTip"
        />
      </div>
    </div>
  </BasePopup>
</template>
