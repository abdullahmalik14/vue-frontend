/** Keep in sync with `PERIOD_KEYS` in masterEventChildMap.js */
const PERIOD_ORDER = ['daily', 'weekly', 'monthly', 'yearly', 'alltime'];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calendar start of local day (runner "today" = browser local date).
 * @param {Date} date
 */
export function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Whole local days between `from` and `to` (to − from). Today vs 8 days ago → 8.
 * @param {Date} from
 * @param {Date} to
 */
export function localDayDiff(from, to) {
  return Math.round((startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) / MS_PER_DAY);
}

/**
 * @param {number} daysAgo
 * @param {Date} [now]
 * @returns {Date}
 */
export function dateDaysAgo(daysAgo, now = new Date()) {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() - Number(daysAgo || 0));
  return d;
}

/**
 * @param {number} daysAgo
 * @param {Date} [now]
 * @returns {string} ISO timestamp
 */
export function isoDaysAgo(daysAgo, now = new Date()) {
  return dateDaysAgo(daysAgo, now).toISOString();
}

/**
 * Normalize occurredAt from Date, ISO string, or days-ago number.
 * `null`/`undefined` means "now" (same-day, all period buckets).
 * @param {Date|string|number|null|undefined} value
 * @param {Date} [now]
 * @returns {Date}
 */
export function resolveOccurredAt(value, now = new Date()) {
  if (value == null || value === '') return new Date(now.getTime());
  if (typeof value === 'number' && Number.isFinite(value)) {
    return dateDaysAgo(value, now);
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date(now.getTime());
  return d;
}

/**
 * Which ledger PERIOD_KEYS an event belongs to.
 *
 * | Period   | Rule |
 * |----------|------|
 * | daily    | Same local calendar day as `now` |
 * | weekly   | Last 7 local days inclusive of today (dayDiff 0..6) |
 * | monthly  | Same local calendar month and year |
 * | yearly   | Same local calendar year |
 * | alltime  | Always |
 *
 * Same-day / missing timestamp → all keys (legacy placeholder behavior).
 *
 * @param {Date|string|number|null|undefined} occurredAt
 * @param {Date} [now]
 * @returns {string[]}
 */
export function resolvePeriodKeysForOccurredAt(occurredAt, now = new Date()) {
  if (occurredAt == null || occurredAt === '') {
    return [...PERIOD_ORDER];
  }

  const at = resolveOccurredAt(occurredAt, now);
  const keys = ['alltime'];
  const dayDiff = localDayDiff(at, now);

  if (at.getFullYear() === now.getFullYear()) {
    keys.unshift('yearly');
    if (at.getMonth() === now.getMonth()) {
      keys.unshift('monthly');
    }
  }

  if (dayDiff >= 0 && dayDiff < 7) {
    keys.unshift('weekly');
  }

  if (dayDiff === 0) {
    keys.unshift('daily');
  }

  const unique = [];
  PERIOD_ORDER.forEach((key) => {
    if (keys.includes(key)) unique.push(key);
  });
  return unique;
}

/**
 * Timestamp fields the Node trigger API may accept. All set to the same ISO
 * string so whichever key the server reads will backdate (if it supports it).
 */
export const TIMESTAMP_FIELD_KEYS = ['occurredAt', 'createdAt', 'eventAt', 'timestamp'];

/**
 * @param {Record<string, unknown>} fields
 * @param {Date|string|number|null|undefined} occurredAt
 * @param {Date} [now]
 */
export function attachEventTimestamps(fields, occurredAt, now = new Date()) {
  if (occurredAt == null || occurredAt === '') return { ...fields };
  const iso = resolveOccurredAt(occurredAt, now).toISOString();
  const next = { ...fields };
  TIMESTAMP_FIELD_KEYS.forEach((key) => {
    next[key] = iso;
  });
  return next;
}

/**
 * Split `count` events across day-offset buckets (round-robin remainder on first buckets).
 * @param {number} count
 * @param {number[]} datedOffsetsDays e.g. [0, 8, 40]
 * @returns {Array<{ index: number, offsetDays: number, occurredAt: string }>}
 */
export function splitCountAcrossOffsets(count, datedOffsetsDays, now = new Date()) {
  const offsets = datedOffsetsDays?.length ? datedOffsetsDays : [0];
  const n = Math.max(0, Math.floor(Number(count) || 0));
  const base = Math.floor(n / offsets.length);
  let remainder = n % offsets.length;
  const plan = [];
  let index = 0;
  offsets.forEach((offsetDays) => {
    const bucketCount = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    for (let i = 0; i < bucketCount; i += 1) {
      plan.push({
        index,
        offsetDays: Number(offsetDays) || 0,
        occurredAt: isoDaysAgo(Number(offsetDays) || 0, now),
      });
      index += 1;
    }
  });
  return plan;
}
