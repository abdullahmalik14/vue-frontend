import { runApiStep } from './runner.js';
import { TEST_API, TEST_CREATOR_ID, resolveTestCreatorId } from '../config/testCreator.js';

/**
 * Step 3 in dom_chart_test_scanner_runner_build_instructions.md — always runs before any event.
 * @param {number} [creatorId]
 */
export async function resetTestDatabase(creatorId = resolveTestCreatorId()) {
  return clearCreatorDatabase(creatorId);
}

export async function clearCreatorDatabase(creatorId = resolveTestCreatorId()) {
  return runApiStep({
    name: 'clear-database',
    method: 'POST',
    url: TEST_API.reset,
    body: { creatorId },
  });
}

/** Runner-only keys that Node ingest must not receive. */
const RUNNER_ONLY_TRIGGER_KEYS = new Set(['earningsCreditField']);

export function sanitizeTriggerFields(fields) {
  if (fields == null || typeof fields !== 'object' || Array.isArray(fields)) return fields;
  const out = { ...fields };
  RUNNER_ONLY_TRIGGER_KEYS.forEach((key) => {
    delete out[key];
  });
  return out;
}

// export async function triggerMasterEvent({ masterEventType, fields, data }) {
//   const eventData = sanitizeTriggerFields(fields ?? data);
//   if (!masterEventType || eventData == null) {
//     throw new Error('triggerMasterEvent requires masterEventType and fields (or data)');
//   }

//   return runApiStep({
//     name: `trigger-${masterEventType}`,
//     method: 'POST',
//     url: TEST_API.trigger,
//     body: {
//       masterEventType,
//       fields: eventData,
//       data: eventData,
//     },
//   });
// }

function toOccurredAtIso(value) {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`Invalid occurredAt: ${value}`);
    }
    return value.toISOString();
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid occurredAt: ${value}`);
  }
  return d.toISOString();
}

export async function triggerMasterEvent({ masterEventType, fields, data, occurredAt }) {
  const eventData = sanitizeTriggerFields(fields ?? data);
  if (!masterEventType || eventData == null) {
    throw new Error('triggerMasterEvent requires masterEventType and fields (or data)');
  }

  const occurredAtIso = toOccurredAtIso(occurredAt);

  return runApiStep({
    name: `trigger-${masterEventType}`,
    method: 'POST',
    url: TEST_API.trigger,
    body: {
      masterEventType,
      fields: eventData,
      data: eventData,
      ...(occurredAtIso ? { options: { occurredAt: occurredAtIso } } : {}),
    },
  });
}

export async function fetchChartsPayload(
  creatorId = resolveTestCreatorId(),
  referenceDate = null,
) {
  const baseUrl = TEST_API.charts(creatorId);

  const separator = baseUrl.includes('?') ? '&' : '?';

  const url = referenceDate
    ? `${baseUrl}${separator}referenceDate=${encodeURIComponent(referenceDate)}`
    : baseUrl;

  const entry = await runApiStep({
    name: 'fetch-charts',
    method: 'GET',
    url,
  });

  return entry.response;
}
