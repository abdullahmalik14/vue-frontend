import { startOfLocalDay } from '../config/periodBuckets.js';

/**
 * Parse amCharts / chartsHandler period labels like "2026-08-31 00:00:00".
 * @param {unknown} value
 * @returns {Date|null}
 */
export function parseChartPeriodDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  const isoish = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const parsed = new Date(isoish);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameUtcOrLocalDay(date, now) {
  if (startOfLocalDay(date).getTime() === startOfLocalDay(now).getTime()) return true;
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return utcDate === utcNow;
}

/**
 * Pick the bar/line row that represents "now".
 * Monthly/yearly/alltime series often end yesterday (UTC range) and never include today —
 * that is a chart-range gap, not a 15-vs-0 value mismatch.
 *
 * @param {object[]} rows
 * @param {Date} [now]
 * @returns {{ row: object|null, currentPeriodMissing: boolean, lastSlotDate?: Date }}
 */
// export function pickChartSlotRow(rows, now = new Date()) {
//   const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
//   if (list.length === 0) return { row: null, currentPeriodMissing: false };

//   const dated = list
//     .map((row) => ({ row, date: parseChartPeriodDate(row.period) }))
//     .filter((entry) => entry.date);

//   if (dated.length === 0) {
//     return { row: list[list.length - 1], currentPeriodMissing: false };
//   }

//   const todayMatch = dated.find((entry) => isSameUtcOrLocalDay(entry.date, now));
//   if (todayMatch) {
//     return { row: todayMatch.row, currentPeriodMissing: false };
//   }

//   const last = dated[dated.length - 1];
//   return {
//     row: last.row,
//     // A scan must never silently substitute a different dated row. This is
//     // especially important for Ref-date runs, where the latest chart row can
//     // be newer than the requested historical date.
//     currentPeriodMissing: true,
//     lastSlotDate: last.date,
//   };
// }

export function pickChartSlotRow(rows, targetDate = new Date()) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];

  if (list.length === 0) {
    return {
      row: null,
      currentPeriodMissing: false,
    };
  }

  const dated = list
    .map((row) => ({
      row,
      date: parseChartPeriodDate(row.period),
    }))
    .filter((entry) => entry.date)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dated.length === 0) {
    return {
      row: list[list.length - 1],
      currentPeriodMissing: false,
    };
  }

  const target = targetDate instanceof Date
    ? targetDate
    : new Date(targetDate);

  if (Number.isNaN(target.getTime())) {
    return {
      row: dated[dated.length - 1].row,
      currentPeriodMissing: false,
    };
  }

  /*
   * Find the bucket whose start is the latest date <= target date.
   *
   * Examples:
   *
   * target = 2026-08-10
   * rows   = 2026-08-01, 2026-09-01
   * result = 2026-08-01
   *
   * target = 2026-08-10
   * rows   = 2026-01-01, 2027-01-01
   * result = 2026-01-01
   */
  let selected = null;

  for (const entry of dated) {
    if (entry.date.getTime() <= target.getTime()) {
      selected = entry;
    } else {
      break;
    }
  }

  /*
   * Target is earlier than the first chart bucket.
   */
  if (!selected) {
    const first = dated[0];

    return {
      row: first.row,
      currentPeriodMissing: true,
      lastSlotDate: first.date,
    };
  }

  return {
    row: selected.row,
    currentPeriodMissing: false,
    lastSlotDate: selected.date,
  };
}

