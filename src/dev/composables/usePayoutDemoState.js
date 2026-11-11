import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/** localStorage key for demo active payouts (API will replace later). */
export const ACTIVE_PAYOUTS_STORAGE_KEY = 'payout-page:active-payouts';

/**
 * DEMO ONLY — set to preview a layout without withdrawing:
 * 'idle' | 'single' | 'single-fail' | 'multi' | 'multi-fail' | 'loading'
 * Leave 'idle' for real flow: withdraw → processing → (10s) fail.
 */
export const DEMO_PAYOUT_UI = 'idle';

/** Demo: after submit (single), flip processing → failed so UI can be reviewed */
export const FAIL_DEMO_DELAY_MS = 10_000;

/**
 * Demo persist / hydrate / fail-timer + layout preview for the payout page.
 * Production API should replace storage + fail scheduling.
 *
 * @param {{
 *   t: (key: string, values?: Record<string, unknown>) => string,
 *   enableLifecycle?: boolean,
 * }} options
 * `enableLifecycle` (default true): hydrate/persist/fail-timer/onMounted.
 * Pass false on DemoPage showcase so localStorage is not touched.
 */
export function usePayoutDemoState({ t, enableLifecycle = true } = {}) {
  const activePayouts = ref([]);
  const payoutsLoading = ref(false);
  let isHydratingPayouts = false;
  let payoutFailTimer = null;

  /** Demo: > 0 shows withdraw aside; set '0.00' for zero-balance copy */
  const availableBalance = ref(t('payout.mock.availableBalanceValue'));
  // const availableBalance = ref('0.00');
  const ledgerBalance = ref(t('payout.mock.ledgerBalance'));
  const nextPayoutDate = ref(t('payout.mock.nextPayoutDate'));

  const isZeroBalance = computed(() => {
    const n = parseFloat(String(availableBalance.value).replace(/[^0-9.-]/g, ''));
    return !Number.isFinite(n) || n <= 0;
  });

  const balanceAsideMode = computed(() => (isZeroBalance.value ? 'zero' : 'available'));

  const showPayoutProcessing = computed(
    () => payoutsLoading.value || activePayouts.value.length > 0,
  );

  const showPayoutViewAll = computed(() => activePayouts.value.length > 1);

  function loadPersistedPayouts() {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ACTIVE_PAYOUTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((p) => p && typeof p === 'object')
        .map((p, i) => ({
          id: p.id || `payout-${i}`,
          amount: p.amount || t('payout.mock.amountEur'),
          country: p.country || t('payout.mock.countryUsa'),
          method: p.method || t('payout.mock.methodBankDeposit'),
          date: p.date || '',
          submittedOn:
            p.submittedOn ||
            (p.date ? t('payout.processing.submittedOnDate', { date: p.date }) : ''),
          status: p.status || 'processing',
          statusStep: p.statusStep ?? 1,
          failReason: p.failReason,
          actionLabel: p.actionLabel,
          failStepLabel: p.failStepLabel,
        }));
    } catch {
      return [];
    }
  }

  function persistActivePayouts(list) {
    if (typeof localStorage === 'undefined') return;
    try {
      const clean = (list || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        country: p.country,
        method: p.method,
        date: p.date,
        submittedOn: p.submittedOn,
        status: p.status,
        statusStep: p.statusStep,
        failReason: p.failReason,
        actionLabel: p.actionLabel,
        failStepLabel: p.failStepLabel,
      }));
      localStorage.setItem(ACTIVE_PAYOUTS_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // ignore quota / private mode
    }
  }

  function makeDemoPayout(partial = {}, index = 0) {
    return {
      id: partial.id || `demo-${index}`,
      amount: partial.amount || t('payout.mock.amountEur'),
      country: partial.country || t('payout.mock.countryUsa'),
      method: partial.method || t('payout.mock.methodBankDeposit'),
      date: partial.date || t('payout.mock.dateSample22012025'),
      submittedOn: partial.submittedOn || t('payout.mock.submittedOn22Jan2025'),
      status: partial.status || 'processing',
      statusStep: partial.statusStep ?? 1,
      failReason: partial.failReason,
      actionLabel: partial.actionLabel,
      failStepLabel: partial.failStepLabel,
      loading: !!partial.loading,
    };
  }

  function clearPayoutFailTimer() {
    if (payoutFailTimer) {
      clearTimeout(payoutFailTimer);
      payoutFailTimer = null;
    }
  }

  function scheduleFirstPayoutFail(payoutId, defaults = {}) {
    clearPayoutFailTimer();
    payoutFailTimer = setTimeout(() => {
      activePayouts.value = activePayouts.value.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'failed',
              failReason: p.failReason || defaults.failReason || t('payout.processing.defaults.failReason'),
              actionLabel:
                p.actionLabel ||
                defaults.actionLabel ||
                t('payout.processing.defaults.actionUploadAddressProof'),
            }
          : p,
      );
    }, FAIL_DEMO_DELAY_MS);
  }

  function applyDemoPayoutUi() {
    payoutsLoading.value = false;
    if (DEMO_PAYOUT_UI === 'idle') return;

    if (DEMO_PAYOUT_UI === 'loading') {
      payoutsLoading.value = true;
      activePayouts.value = Array.from({ length: 6 }, (_, i) =>
        makeDemoPayout({ id: `loading-${i}`, loading: true }, i),
      );
      return;
    }

    if (DEMO_PAYOUT_UI === 'single') {
      activePayouts.value = [makeDemoPayout({ id: 'single-1' })];
      return;
    }

    if (DEMO_PAYOUT_UI === 'single-fail') {
      activePayouts.value = [
        makeDemoPayout({
          id: 'single-fail-1',
          status: 'failed',
          failReason: t('payout.processing.defaults.failReason'),
          actionLabel: t('payout.processing.defaults.actionUploadAddressProof'),
        }),
      ];
      return;
    }

    if (DEMO_PAYOUT_UI === 'multi' || DEMO_PAYOUT_UI === 'multi-fail') {
      const items = Array.from({ length: 6 }, (_, i) =>
        makeDemoPayout(
          {
            id: `multi-${i}`,
            amount: i === 0 ? t('payout.mock.amountUsdLarge') : t('payout.mock.amountEur'),
          },
          i,
        ),
      );
      if (DEMO_PAYOUT_UI === 'multi-fail') {
        items[0] = {
          ...items[0],
          status: 'failed',
          failReason: t('payout.processing.defaults.failReasonMasspayCancelled'),
          actionLabel: t('payout.processing.defaults.actionContactSupport'),
        };
        items[1] = {
          ...items[1],
          status: 'failed',
          failReason: t('payout.processing.defaults.failReason'),
          actionLabel: t('payout.processing.defaults.actionUploadAddressProof'),
        };
      }
      activePayouts.value = items;
    }
  }

  async function hydrateActivePayoutsFromStorage() {
    if (DEMO_PAYOUT_UI !== 'idle') return;

    const cached = loadPersistedPayouts();
    if (!cached.length) return;

    isHydratingPayouts = true;
    payoutsLoading.value = true;
    activePayouts.value = cached.map((p) => ({ ...p, loading: true }));

    await new Promise((r) => setTimeout(r, 500));

    activePayouts.value = cached.map((p) => ({ ...p, loading: false }));
    payoutsLoading.value = false;
    isHydratingPayouts = false;

    const firstId = cached[0]?.id;
    if (firstId && cached[0].status !== 'failed') {
      scheduleFirstPayoutFail(firstId);
    }
  }

  function onPayoutSubmitted(payload) {
    const wasEmpty = activePayouts.value.length === 0;
    const id = `payout-${Date.now()}`;
    const next = {
      id,
      ...payload,
      status: payload.status || 'processing',
      statusStep: payload.statusStep ?? 1,
      submittedOn:
        payload.submittedOn ||
        (payload.date ? t('payout.processing.submittedOnDate', { date: payload.date }) : ''),
    };

    activePayouts.value = [...activePayouts.value, next];

    if (wasEmpty) {
      scheduleFirstPayoutFail(id);
    }
  }

  if (enableLifecycle) {
    applyDemoPayoutUi();

    onMounted(() => {
      hydrateActivePayoutsFromStorage();
    });

    watch(
      activePayouts,
      (list) => {
        if (DEMO_PAYOUT_UI !== 'idle') return;
        if (isHydratingPayouts || payoutsLoading.value) return;
        persistActivePayouts(list);
      },
      { deep: true },
    );

    onBeforeUnmount(clearPayoutFailTimer);
  }

  return {
    activePayouts,
    payoutsLoading,
    availableBalance,
    ledgerBalance,
    nextPayoutDate,
    isZeroBalance,
    balanceAsideMode,
    showPayoutProcessing,
    showPayoutViewAll,
    makeDemoPayout,
    onPayoutSubmitted,
    clearPayoutFailTimer,
  };
}
