/**
 * Stateful mock API for subscription plans (tiers).
 * Contract lives in mockApi.config.js + planStateEngine.schema.json.
 * Plan media is out of scope — no media endpoints here.
 */
import MockApi from '@/lib/mock-api-demo/MockApi.js';
import mockApiConfig from '@/lib/mock-api-demo/mockApi.config.js';

export const PLAN_MOCK_SCENARIOS = ['success', 'failure'];

const mockApi = new MockApi(mockApiConfig);
const listeners = new Set();

/** In-memory plan store — source of truth for mock CRUD. */
let plansStore = [];
let activeScenario = 'success';
let lastResult = null;

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function notify(result) {
  lastResult = result;
  listeners.forEach((fn) => {
    try {
      fn(result);
    } catch {
      /* ignore */
    }
  });
}

function toResult(label, response, extra = {}) {
  const result = {
    label,
    status: response?.status ?? null,
    ok: Boolean(response?.ok ?? extra.ok),
    scenario: activeScenario,
    body: response?.body ?? null,
    at: new Date().toISOString(),
    ...extra,
  };
  notify(result);
  return result;
}

async function parseResponse(response) {
  const body = typeof response?.json === 'function' ? await response.json() : response;
  return {
    status: response?.status ?? null,
    ok: Boolean(response?.ok),
    body,
  };
}

function resolveScenario(payload = {}, query = {}) {
  return payload.scenario || query.scenario || activeScenario;
}

function normalizePlan(entry) {
  const next = clone(entry) || {};
  if (!next.id) next.id = `tier-${Date.now()}`;
  if (!next.status) next.status = 'draft';
  if (typeof next.followers !== 'number') next.followers = Number(next.followers) || 0;
  return next;
}

export function setPlanMockScenario(name) {
  if (PLAN_MOCK_SCENARIOS.includes(name)) activeScenario = name;
  return activeScenario;
}

export function getPlanMockScenario() {
  return activeScenario;
}

export function getLastPlanMockResult() {
  return lastResult;
}

export function onPlanMockResult(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Sync snapshot of the mock store (for engine hydrate / debugging). */
export function getPlanStorePlans() {
  return clone(plansStore);
}

export function seedPlanStore(entries = []) {
  plansStore = Array.isArray(entries) ? entries.map((entry) => normalizePlan(entry)) : [];
  return getPlanStorePlans();
}

/**
 * GET /plans — all plans (optional status filter).
 */
export async function listPlans({ status, scenario } = {}) {
  const query = {
    scenario: resolveScenario({ scenario }),
    ...(status ? { status } : {}),
  };
  const raw = await mockApi.get('/plans', { query });
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('GET /plans', parsed, { plans: [], ok: false });
  }

  let plans = getPlanStorePlans();
  if (status) {
    plans = plans.filter((plan) => plan.status === status);
  }

  return toResult('GET /plans', parsed, {
    ok: true,
    plans,
    body: { ...parsed.body, ok: true, plans },
  });
}

/**
 * GET /plans/detail — one plan by id.
 */
export async function getPlan(id, { scenario } = {}) {
  const query = { id, scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.get('/plans/detail', { query });
  const parsed = await parseResponse(raw);

  const plan = plansStore.find((item) => item.id === id) || null;
  if (!plan) {
    return toResult('GET /plans/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'PLAN_NOT_FOUND', message: 'Plan not found.' },
    }, { plan: null, ok: false });
  }

  if (!parsed.ok && resolveScenario({ scenario }) === 'failure') {
    return toResult('GET /plans/detail', parsed, { plan: null, ok: false });
  }

  return toResult('GET /plans/detail', parsed, {
    ok: true,
    plan: clone(plan),
    body: { ...parsed.body, ok: true, plan: clone(plan) },
  });
}

/**
 * POST /plans — create.
 */
export async function createPlan(entry, { scenario } = {}) {
  const payload = { ...normalizePlan(entry), scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.post('/plans', payload);
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('POST /plans', parsed, { plan: null, ok: false });
  }

  const plan = normalizePlan(entry);
  const index = plansStore.findIndex((item) => item.id === plan.id);
  if (index >= 0) {
    plansStore[index] = plan;
  } else {
    plansStore.push(plan);
  }

  return toResult('POST /plans', parsed, {
    ok: true,
    plan: clone(plan),
    body: { ...parsed.body, ok: true, plan: clone(plan) },
  });
}

/**
 * PATCH /plans/detail — edit / update.
 */
export async function updatePlan(entry, { scenario } = {}) {
  const payload = { ...normalizePlan(entry), scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.patch('/plans/detail', payload);
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('PATCH /plans/detail', parsed, { plan: null, ok: false });
  }

  const plan = normalizePlan(entry);
  const index = plansStore.findIndex((item) => item.id === plan.id);
  if (index < 0) {
    return toResult('PATCH /plans/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'PLAN_NOT_FOUND', message: 'Plan not found.' },
    }, { plan: null, ok: false });
  }

  plansStore[index] = { ...plansStore[index], ...plan };
  const saved = clone(plansStore[index]);

  return toResult('PATCH /plans/detail', parsed, {
    ok: true,
    plan: saved,
    body: { ...parsed.body, ok: true, plan: saved },
  });
}

/**
 * DELETE /plans/detail — delete by id.
 */
export async function deletePlan(id, { scenario } = {}) {
  const query = { id, scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.delete('/plans/detail', { query });
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('DELETE /plans/detail', parsed, { id, ok: false });
  }

  const before = plansStore.length;
  plansStore = plansStore.filter((item) => item.id !== id);
  if (plansStore.length === before) {
    return toResult('DELETE /plans/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'PLAN_NOT_FOUND', message: 'Plan not found.' },
    }, { id, ok: false });
  }

  return toResult('DELETE /plans/detail', parsed, {
    ok: true,
    id,
    body: { ...parsed.body, ok: true, id },
  });
}

/**
 * Create or update depending on whether id exists in the store.
 */
export async function upsertPlan(entry, { scenario } = {}) {
  const plan = normalizePlan(entry);
  const exists = plansStore.some((item) => item.id === plan.id);
  return exists ? updatePlan(plan, { scenario }) : createPlan(plan, { scenario });
}

/**
 * Replace entire store (demo reset / seed).
 */
export async function replacePlans(entries = [], { scenario } = {}) {
  const listResult = await listPlans({ scenario });
  if (!listResult.ok && resolveScenario({ scenario }) === 'failure') {
    return listResult;
  }
  plansStore = Array.isArray(entries) ? entries.map((entry) => normalizePlan(entry)) : [];
  return toResult('REPLACE /plans', {
    status: 200,
    ok: true,
    body: { ok: true, plans: getPlanStorePlans() },
  }, { ok: true, plans: getPlanStorePlans() });
}

/** Console helpers for flow verification (no demo UI). */
if (typeof window !== 'undefined') {
  window.__planMockApi = {
    listPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    upsertPlan,
    replacePlans,
    getPlanStorePlans,
    getLastPlanMockResult,
    setPlanMockScenario,
    getPlanMockScenario,
  };
}
