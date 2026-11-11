import { sha256Hex } from './identity.js';
import { buildPromptPreview, estimateTokens } from './cost.js';

/**
 * Group missing strings by section folder, then pack token-bounded batches.
 * The model never receives a destination path.
 *
 * @param {object[]} entries
 * @param {string} locale
 * @param {number} maxInputTokens
 * @returns {object[][]}
 */
export function packBatches(entries, locale, maxInputTokens) {
  const groups = new Map();

  for (const entry of entries) {
    const context = entry.relativeSourceFile.split('/')[0];
    if (!groups.has(context)) {
      groups.set(context, []);
    }
    groups.get(context).push(entry);
  }

  const batches = [];

  for (const group of groups.values()) {
    let current = [];

    for (const entry of group) {
      const candidate = [...current, entry];
      const tokens = estimateTokens(buildPromptPreview(candidate, locale));

      if (current.length > 0 && tokens > maxInputTokens) {
        batches.push(current);
        current = [entry];
        continue;
      }

      current = candidate;
    }

    if (current.length > 0) {
      batches.push(current);
    }
  }

  return batches;
}

/**
 * @param {string} locale
 * @param {string[]} destinationIds
 * @returns {string}
 */
export function batchIdFor(locale, destinationIds) {
  const canonical = [locale, ...[...destinationIds].sort()].join('\n');
  return `b_${sha256Hex(canonical).slice(0, 24)}`;
}
