<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class="w-full h-full max-h-[100dvh] min-h-0 relative flex flex-col overflow-hidden shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[29.1875rem] dark:bg-[#1b1d1e]/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>

      <div
        class="relative z-[1] flex flex-col flex-1 min-h-0 h-full overflow-hidden shadow-[0px_0px_10px_-34px_#0000001A] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255,0.9)),linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_100%)]"
      >
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[12.5%] z-[-1] pointer-events-none"
          :style="{ backgroundImage: popupGradientStyle }"
        />
        <!-- Sticky progress (steps 1–4) -->
        <div
          v-if="showChrome"
          class="shrink-0 overflow-hidden w-full h-2 bg-[#EAECF0] dark:bg-[#222526] z-[3]"
        >
          <div
            class="h-full bg-[#0c111d] dark:bg-[#0a0e17] transition-all duration-300"
            :style="{ width: progressWidth }"
          />
        </div>

        <!-- Scrollable step content (panel scroll off — this owns wheel + keyboard) -->
        <div
          ref="bodyScrollRef"
          tabindex="-1"
          class="flex-1 min-h-0 overflow-y-auto overscroll-contain outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-[2]"
        >
          <WithdrawEarningsStep1
            v-if="engine.step === 1"
            ref="stepRef"
            :engine="engine"
            @close="handleClose"
          />
          <WithdrawEarningsStep2
            v-else-if="engine.step === 2"
            ref="stepRef"
            :engine="engine"
            @close="handleClose"
          />
          <WithdrawEarningsStep3
            v-else-if="engine.step === 3"
            ref="stepRef"
            :engine="engine"
            @close="handleClose"
          />
          <WithdrawEarningsStep4
            v-else-if="engine.step === 4"
            ref="stepRef"
            :engine="engine"
            @close="handleClose"
          />
          <WithdrawEarningsStep5
            v-else-if="engine.step === 5"
            :engine="engine"
            @close="handleClose"
          />
        </div>

        <!-- Sticky footer (steps 1–4) -->
        <div
          v-if="showChrome"
          class="shrink-0 flex flex-col z-[3] min-h-[7.5rem] shadow-[0px_0px_8px_0px_#00000026] relative"
          :class="{ 'proceed-next': canProceed || isSubmitStep }"
        >
          <div
            class="absolute inset-0 bg-cover bg-center bg-no-repeat z-[-1] pointer-events-none"
            :style="{ backgroundImage: popupGradientStyle }"
          />
          <div
            class="flex justify-between items-end w-full h-full min-h-[7.5rem] transition-colors duration-300"
            :class="footerBarClass"
          >
            <div class="flex items-start px-2 py-4 md:pl-6">
              <div v-if="!showFinalPayout" class="flex flex-col gap-1 md:gap-2">
                <h3 class="text-base font-medium text-white dark:text-[#e8e6e3]">
                  {{ t('payout.withdraw.availableBalance') }}
                </h3>
                <span
                  class="text-3xl leading-[2.375rem] font-semibold text-white md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem] dark:text-[#e8e6e3]"
                >
                  {{ t('payout.withdraw.usdPrefix') }}{{ formattedAvailableBalance }}
                </span>
              </div>

              <div v-else class="flex flex-col gap-1 md:gap-2">
                <h3 class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('payout.withdraw.yourFinalPayout') }}
                  <span class="hidden xl:inline">{{ t('payout.withdraw.inclusive') }}</span>
                </h3>
                <span
                  class="text-3xl leading-[2.375rem] font-semibold text-[#0C111D] md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem] dark:text-[#dbd8d3]"
                >
                  {{ t('payout.mock.finalPayoutEur') }}
                </span>
                <span class="xl:hidden text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('payout.withdraw.serviceChargeAmount', { amount: '3.45' }) }}
                </span>
                <span class="hidden xl:inline text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('payout.withdraw.transferFeeAmount', { amount: '38' }) }}
                </span>
              </div>
            </div>

            <DashboardPrimaryButton
              v-if="isSubmitStep || canProceed"
              :text="isSubmitStep ? t('payout.withdraw.submit') : t('payout.withdraw.next')"
              variant="none"
              :rightIcon="assets.arrowRight"
              :rightIconClass="actionIconClass"
              :customClass="actionButtonClass"
              @click="onFooterAction"
            />
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { createStepStateEngine } from '@/utils/stateEngine';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();
import WithdrawEarningsStep1 from './withdraw-earnings-steps/WithdrawEarningsStep1.vue';
import WithdrawEarningsStep2 from './withdraw-earnings-steps/WithdrawEarningsStep2.vue';
import WithdrawEarningsStep3 from './withdraw-earnings-steps/WithdrawEarningsStep3.vue';
import WithdrawEarningsStep4 from './withdraw-earnings-steps/WithdrawEarningsStep4.vue';
import WithdrawEarningsStep5 from './withdraw-earnings-steps/WithdrawEarningsStep5.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submitted']);

const bodyScrollRef = ref(null);

const popupGradientStyle = computed(() =>
  assets.value.popupGradient ? `url('${assets.value.popupGradient}')` : 'none',
);

function countryLabel(countryRaw) {
  const key = String(countryRaw || 'usa').toLowerCase();
  const map = {
    usa: t('payout.mock.countryUsa'),
    uk: t('payout.mock.countryUk'),
    australia: t('payout.mock.countryAustralia'),
    china: t('payout.mock.countryChina'),
    singapore: t('payout.mock.countrySingapore'),
  };
  return map[key] || countryRaw.toUpperCase();
}

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  // Panel must not own scroll — bodyScrollRef does (same as TransactionHistory).
  scrollable: false,
  // BasePopup content wrapper needs height so flex-1 + overflow-y-auto can scroll.
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '29.1875rem' },
  height: { default: '100%' },
};

function focusBodyScroll() {
  bodyScrollRef.value?.focus?.({ preventScroll: true });
}

function onBodyKeydown(e) {
  if (!props.modelValue) return;

  const el = bodyScrollRef.value;
  if (!el) return;

  const key = e.key;
  const isScrollKey =
    key === 'ArrowDown' ||
    key === 'ArrowUp' ||
    key === 'PageDown' ||
    key === 'PageUp' ||
    key === 'Home' ||
    key === 'End';

  if (!isScrollKey) return;
  if (e.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;

  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return;

  let next = el.scrollTop;
  if (key === 'ArrowDown') next += 40;
  else if (key === 'ArrowUp') next -= 40;
  else if (key === 'PageDown') next += el.clientHeight * 0.9;
  else if (key === 'PageUp') next -= el.clientHeight * 0.9;
  else if (key === 'Home') next = 0;
  else if (key === 'End') next = max;

  next = Math.min(max, Math.max(0, next));
  if (next === el.scrollTop) return;

  e.preventDefault();
  el.scrollTop = next;
}

function bindKeyboardScroll() {
  window.addEventListener('keydown', onBodyKeydown, true);
}

function unbindKeyboardScroll() {
  window.removeEventListener('keydown', onBodyKeydown, true);
}

const FLOW_DEFAULTS = {
  selectedCountry: '',
  amount: '',
  availableBalance: 30054.4,
  canProceed: false,
  payoutOptionId: null,
  payoutOption: null,
  swiftCode: '',
  accountNumber: '',
  address1: '',
  address2: '',
  postalCode: '',
  city: '',
  addressCountry: '',
  addressState: '',
  phoneCountry: '',
  phoneCode: '',
  phoneNumber: '',
};

const engine = createStepStateEngine({
  flowId: 'withdraw-earnings-popup-flow',
  initialStep: 1,
  urlSync: 'none',
  defaults: { ...FLOW_DEFAULTS },
});

const stepRef = ref(null);

async function resetFlow() {
  Object.entries(FLOW_DEFAULTS).forEach(([key, value]) => {
    engine.setState(key, value, { silent: true });
  });
  if (engine.step !== 1) {
    await engine.goToStep(1, { force: true, intent: 'reset' });
  }
}

const showChrome = computed(() => engine.step >= 1 && engine.step <= 4);
const isSubmitStep = computed(() => engine.step === 4);
const canProceed = computed(() => Boolean(engine.state.canProceed));

const progressWidth = computed(() => {
  const map = {
    1: '20%',
    2: '40%',
    3: '74.656%',
    4: '92%',
  };
  return map[engine.step] || '0%';
});

const showFinalPayout = computed(() => {
  if (engine.step === 1) return false;
  if (engine.step === 2) return canProceed.value;
  return engine.step === 3 || engine.step === 4;
});

const footerBarClass = computed(() =>
  showFinalPayout.value
    ? 'bg-white/50 dark:bg-[#181a1b]/50'
    : 'bg-black/80 dark:bg-[#181a1b]/80'
);

const formattedAvailableBalance = computed(() => {
  const balance = Number(engine.state.availableBalance || 30054.4);
  return balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const nextButtonClass =
  '!min-w-0 flex items-center gap-2 pl-[2.125rem] pr-4 h-11 shadow-[0px_0px_16px_0px_rgba(255,255,255,0.5)] [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] bg-black group/button enabled:hover:bg-[#07F468] text-lg font-semibold text-[#07F468] enabled:hover:text-black md:pl-[3.64125rem] md:pr-6 md:h-[5.25rem] md:[clip-path:polygon(100%_0%,100%_100%,0%_100%,2.14125rem_0%)] dark:bg-[#181a1b] dark:enabled:hover:bg-[#06c454] dark:text-[#23f97b] dark:enabled:hover:text-[#e8e6e3]';

const submitButtonClass =
  '!min-w-0 flex items-center gap-2 pl-[2.125rem] pr-4 h-11 shadow-[0px_0px_16px_0px_rgba(255,255,255,0.5)] [clip-path:polygon(100%_0%,100%_100%,0%_100%,1.125rem_0%)] bg-[#07F468] group/button enabled:hover:bg-black text-lg font-semibold text-black enabled:hover:text-[#07F468] md:pl-[3.64125rem] md:pr-6 md:h-[5.25rem] md:[clip-path:polygon(100%_0%,100%_100%,0%_100%,2.14125rem_0%)] dark:bg-[#06c454] dark:enabled:hover:bg-[#181a1b] dark:text-[#e8e6e3] dark:enabled:hover:text-[#23f97b]';

const actionButtonClass = computed(() =>
  isSubmitStep.value ? submitButtonClass : nextButtonClass
);

const actionIconClass = computed(() =>
  isSubmitStep.value
    ? 'w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover/button:[filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)]'
    : 'w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]'
);

onMounted(() => {
  engine.initialize({ fromUrl: false });
});

watch(
  () => engine.step,
  (step) => {
    if (step !== 5) return;

    const countryRaw = String(engine.state.selectedCountry || engine.state.country || 'usa');
    const payoutOption = engine.state.payoutOption || {};
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    emit('submitted', {
      amount: t('payout.mock.amountEur'),
      withdrawAmount: engine.state.amount || '',
      country: countryLabel(countryRaw),
      method: payoutOption.title || t('payout.mock.methodBankDeposit'),
      date,
      status: 'processing',
      statusStep: 1,
    });
  }
);

const handleClose = () => {
  emit('update:modelValue', false);
};

// Close via X, overlay, or v-model — always restart at step 1 for next withdraw
watch(
  () => props.modelValue,
  (open) => {
    unbindKeyboardScroll();
    if (!open) {
      resetFlow();
      return;
    }

    bindKeyboardScroll();
    nextTick(() => {
      focusBodyScroll();
      // BasePopup focuses panel after open — reclaim shortly after.
      setTimeout(focusBodyScroll, 50);
      setTimeout(focusBodyScroll, 200);
    });
  }
);

onBeforeUnmount(() => {
  unbindKeyboardScroll();
});

const onFooterAction = () => {
  stepRef.value?.proceed?.();
};
</script>
