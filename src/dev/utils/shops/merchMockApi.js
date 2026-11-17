/**
 * Stateful mock API for merch listings (shop products).
 * Contract lives in mockApi.config.js + merchStateEngine.schema.json.
 * Gallery media is out of scope — no media endpoints here.
 */
import MockApi from '@/lib/mock-api-demo/MockApi.js';
import mockApiConfig from '@/lib/mock-api-demo/mockApi.config.js';

export const MERCH_MOCK_SCENARIOS = ['success', 'failure'];

const mockApi = new MockApi(mockApiConfig);
const listeners = new Set();

/** In-memory merch store — source of truth for mock CRUD (lean entity, no gallery blobs). */
let merchStore = [];
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

/** Strip heavy gallery payloads — media stays in merchGalleryMediaStore. */
function leanGallery(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery.map((entry) => ({
    id: entry?.id,
    name: entry?.name || '',
    dataUrl: '',
    objectUrl: '',
  }));
}

function normalizeMerch(entry) {
  const next = clone(entry) || {};
  if (!next.id) next.id = `merch_${Date.now()}`;
  if (!next.status) next.status = 'draft';
  if (typeof next.itemsSold !== 'number') next.itemsSold = Number(next.itemsSold) || 0;
  if (next.totalSales == null) next.totalSales = '0';
  if (!next.currency) next.currency = 'USD';
  if (!next.updatedAt) next.updatedAt = new Date().toISOString();
  if (!next.createdAt) next.createdAt = next.updatedAt;
  next.galleryUploaded = leanGallery(next.galleryUploaded);
  if (typeof next.thumbnail === 'string' && next.thumbnail.length > 350_000) {
    next.thumbnail = '';
  }
  return next;
}

export function setMerchMockScenario(name) {
  if (MERCH_MOCK_SCENARIOS.includes(name)) activeScenario = name;
  return activeScenario;
}

export function getMerchMockScenario() {
  return activeScenario;
}

export function getLastMerchMockResult() {
  return lastResult;
}

export function onMerchMockResult(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Sync snapshot of the mock store (for engine hydrate / debugging). */
export function getMerchStoreItems() {
  return clone(merchStore);
}

export function seedMerchStore(entries = []) {
  merchStore = Array.isArray(entries) ? entries.map((entry) => normalizeMerch(entry)) : [];
  return getMerchStoreItems();
}

/**
 * GET /merch — all listings (optional status filter).
 */
export async function listMerch({ status, scenario } = {}) {
  const query = {
    scenario: resolveScenario({ scenario }),
    ...(status ? { status } : {}),
  };
  const raw = await mockApi.get('/merch', { query });
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('GET /merch', parsed, { items: [], ok: false });
  }

  let items = getMerchStoreItems();
  if (status) {
    items = items.filter((item) => item.status === status);
  }

  return toResult('GET /merch', parsed, {
    ok: true,
    items,
    body: { ...parsed.body, ok: true, items },
  });
}

/**
 * GET /merch/detail — one listing by id.
 */
export async function getMerch(id, { scenario } = {}) {
  const query = { id, scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.get('/merch/detail', { query });
  const parsed = await parseResponse(raw);

  const item = merchStore.find((row) => row.id === id) || null;
  if (!item) {
    return toResult('GET /merch/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'MERCH_NOT_FOUND', message: 'Merch not found.' },
    }, { item: null, ok: false });
  }

  if (!parsed.ok && resolveScenario({ scenario }) === 'failure') {
    return toResult('GET /merch/detail', parsed, { item: null, ok: false });
  }

  return toResult('GET /merch/detail', parsed, {
    ok: true,
    item: clone(item),
    body: { ...parsed.body, ok: true, item: clone(item) },
  });
}

/**
 * POST /merch — create.
 */
export async function createMerch(entry, { scenario } = {}) {
  const payload = { ...normalizeMerch(entry), scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.post('/merch', payload);
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('POST /merch', parsed, { item: null, ok: false });
  }

  const item = normalizeMerch(entry);
  const index = merchStore.findIndex((row) => row.id === item.id);
  if (index >= 0) {
    merchStore[index] = item;
  } else {
    merchStore.unshift(item);
  }

  return toResult('POST /merch', parsed, {
    ok: true,
    item: clone(item),
    body: { ...parsed.body, ok: true, item: clone(item) },
  });
}

/**
 * PATCH /merch/detail — edit / update.
 */
export async function updateMerch(entry, { scenario } = {}) {
  const payload = { ...normalizeMerch(entry), scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.patch('/merch/detail', payload);
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('PATCH /merch/detail', parsed, { item: null, ok: false });
  }

  const item = normalizeMerch(entry);
  const index = merchStore.findIndex((row) => row.id === item.id);
  if (index < 0) {
    return toResult('PATCH /merch/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'MERCH_NOT_FOUND', message: 'Merch not found.' },
    }, { item: null, ok: false });
  }

  merchStore[index] = { ...merchStore[index], ...item };
  const saved = clone(merchStore[index]);

  return toResult('PATCH /merch/detail', parsed, {
    ok: true,
    item: saved,
    body: { ...parsed.body, ok: true, item: saved },
  });
}

/**
 * DELETE /merch/detail — delete by id.
 */
export async function deleteMerch(id, { scenario } = {}) {
  const query = { id, scenario: resolveScenario({ scenario }) };
  const raw = await mockApi.delete('/merch/detail', { query });
  const parsed = await parseResponse(raw);

  if (!parsed.ok) {
    return toResult('DELETE /merch/detail', parsed, { id, ok: false });
  }

  const before = merchStore.length;
  merchStore = merchStore.filter((row) => row.id !== id);
  if (merchStore.length === before) {
    return toResult('DELETE /merch/detail', {
      status: 404,
      ok: false,
      body: { ok: false, error: 'MERCH_NOT_FOUND', message: 'Merch not found.' },
    }, { id, ok: false });
  }

  return toResult('DELETE /merch/detail', parsed, {
    ok: true,
    id,
    body: { ...parsed.body, ok: true, id },
  });
}

/**
 * Create or update depending on whether id exists in the store.
 */
export async function upsertMerch(entry, { scenario } = {}) {
  const item = normalizeMerch(entry);
  const exists = merchStore.some((row) => row.id === item.id);
  return exists ? updateMerch(item, { scenario }) : createMerch(item, { scenario });
}

/**
 * Replace entire store (demo reset / seed).
 */
export async function replaceMerch(entries = [], { scenario } = {}) {
  const listResult = await listMerch({ scenario });
  if (!listResult.ok && resolveScenario({ scenario }) === 'failure') {
    return listResult;
  }
  merchStore = Array.isArray(entries) ? entries.map((entry) => normalizeMerch(entry)) : [];
  return toResult('REPLACE /merch', {
    status: 200,
    ok: true,
    body: { ok: true, items: getMerchStoreItems() },
  }, { ok: true, items: getMerchStoreItems() });
}

/** Console helpers for flow verification (no demo UI). */
if (typeof window !== 'undefined') {
  window.__merchMockApi = {
    listMerch,
    getMerch,
    createMerch,
    updateMerch,
    deleteMerch,
    upsertMerch,
    replaceMerch,
    getMerchStoreItems,
    getLastMerchMockResult,
    setMerchMockScenario,
    getMerchMockScenario,
  };
}
