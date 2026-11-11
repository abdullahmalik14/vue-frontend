import { computed } from 'vue';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine';
import {
  listPlans,
  getPlan,
  upsertPlan,
  deletePlan,
  replacePlans,
  getPlanStorePlans,
  seedPlanStore,
} from '@/dev/utils/plan/planMockApi.js';

export const MAX_FREE_TIERS = 1;
export const MAX_PAID_TIERS = 3;

/** Shared persisted list of creator subscription tiers (published + draft). */
let tiersEngine = null;
let hydratedFromMock = false;

function syncEngineFromStore() {
  const list = getPlanStorePlans();
  tiersEngine.setState('tiers', list);
  tiersEngine.flushPersist();
  return list;
}

export function useSubscriptionTiersEngine() {
  if (!tiersEngine) {
    tiersEngine = createStepStateEngine({
      flowId: 'subscriptionTiers',
      urlSync: 'none',
      persist: { key: 'stateEngine:subscriptionTiers' },
      initialStep: 1,
      defaults: {
        tiers: [],
        activeTab: 'published',
      },
    });
    tiersEngine.initialize({ fromUrl: false });

    // One-time: seed mock store from any previously persisted engine list.
    const existing = Array.isArray(tiersEngine.state.tiers) ? tiersEngine.state.tiers : [];
    seedPlanStore(existing);
    hydratedFromMock = true;
  }

  const tiers = computed(() =>
    Array.isArray(tiersEngine.state.tiers) ? tiersEngine.state.tiers : [],
  );

  const activeTab = computed({
    get: () => tiersEngine.state.activeTab || 'published',
    set: (value) => tiersEngine.setState('activeTab', value),
  });

  const publishedTiers = computed(() =>
    tiers.value.filter((tier) => tier.status === 'published'),
  );

  const draftTiers = computed(() =>
    tiers.value.filter((tier) => tier.status === 'draft'),
  );

  const visibleTiers = computed(() =>
    activeTab.value === 'draft' ? draftTiers.value : publishedTiers.value,
  );

  function isFreeTierEntry(entry) {
    return Boolean(
      entry?.isFreeTier
        || entry?.card?.isFreeTier
        || entry?.formValues?.planDetailSubstep === 'free-tier',
    );
  }

  const paidPublishedCount = computed(
    () => publishedTiers.value.filter((tier) => !isFreeTierEntry(tier)).length,
  );

  const freePublishedCount = computed(
    () => publishedTiers.value.filter((tier) => isFreeTierEntry(tier)).length,
  );

  const atPaidLimit = computed(() => paidPublishedCount.value >= MAX_PAID_TIERS);
  const atFreeLimit = computed(() => freePublishedCount.value >= MAX_FREE_TIERS);
  const atPublishLimit = computed(() => atPaidLimit.value && atFreeLimit.value);
  const maxPublishedSlots = MAX_FREE_TIERS + MAX_PAID_TIERS;

  /**
   * Whether a new publish is allowed for free vs paid.
   * Already-published updates should skip this (caller checks status).
   */
  function canPublishNewTier({ isFree = false, excludeId = null } = {}) {
    const published = publishedTiers.value.filter((tier) => tier.id !== excludeId);
    const freeCount = published.filter((tier) => isFreeTierEntry(tier)).length;
    const paidCount = published.length - freeCount;
    if (published.length >= maxPublishedSlots) return false;
    if (isFree) return freeCount < MAX_FREE_TIERS;
    return paidCount < MAX_PAID_TIERS;
  }

  function canPublishEntry(entry) {
    if (!entry) return false;
    // Re-publish / update of an already-live tier does not consume a new slot.
    if (entry.status === 'published') return true;
    return canPublishNewTier({ isFree: isFreeTierEntry(entry) });
  }

  /** GET /plans — hydrate engine from mock store. */
  async function loadPlans(options = {}) {
    const result = await listPlans(options);
    if (result.ok) {
      tiersEngine.setState('tiers', result.plans || []);
      tiersEngine.flushPersist();
    }
    return result;
  }

  /** GET /plans/detail */
  async function loadPlan(id, options = {}) {
    return getPlan(id, options);
  }

  /**
   * Create or edit via mock API (POST /plans or PATCH /plans/detail),
   * then sync engine from store.
   */
  async function upsertTier(entry) {
    const next = toPersistableState(entry);
    if (!next?.id) {
      next.id = `tier-${Date.now()}`;
    }
    const result = await upsertPlan(next);
    if (result.ok) {
      syncEngineFromStore();
      return result.plan;
    }
    // Keep UI usable if mock scenario fails — still mirror locally for this session.
    const list = Array.isArray(tiersEngine.state.tiers) ? [...tiersEngine.state.tiers] : [];
    const index = list.findIndex((tier) => tier.id === next.id);
    if (index >= 0) list[index] = { ...list[index], ...next };
    else list.push(next);
    tiersEngine.setState('tiers', list);
    tiersEngine.flushPersist();
    return next;
  }

  /** DELETE /plans/detail */
  async function removeTier(id) {
    const result = await deletePlan(id);
    if (result.ok) {
      syncEngineFromStore();
      return result;
    }
    const list = (tiersEngine.state.tiers || []).filter((tier) => tier.id !== id);
    tiersEngine.setState('tiers', list);
    tiersEngine.flushPersist();
    return result;
  }

  /** Replace entire list through mock store (demo reset / seed). */
  async function replaceTiers(entries) {
    const result = await replacePlans(entries);
    if (result.ok) {
      syncEngineFromStore();
      return result.plans;
    }
    const list = Array.isArray(entries)
      ? entries.map((entry) => toPersistableState(entry)).filter((entry) => entry?.id)
      : [];
    seedPlanStore(list);
    tiersEngine.setState('tiers', list);
    tiersEngine.flushPersist();
    return list;
  }

  return {
    engine: tiersEngine,
    tiers,
    activeTab,
    publishedTiers,
    draftTiers,
    visibleTiers,
    paidPublishedCount,
    freePublishedCount,
    atPaidLimit,
    atFreeLimit,
    atPublishLimit,
    maxPublishedSlots,
    isFreeTierEntry,
    canPublishNewTier,
    canPublishEntry,
    loadPlans,
    loadPlan,
    upsertTier,
    removeTier,
    replaceTiers,
    hydratedFromMock: () => hydratedFromMock,
  };
}
