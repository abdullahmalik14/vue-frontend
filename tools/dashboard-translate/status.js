import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAtPointer } from './pointers.js';
import { readJsonFile, targetFileFor } from './inventory.js';

/**
 * @param {unknown} value
 * @returns {'existing'|'empty_invalid'|'structure_mismatch'}
 */
export function classifyTargetValue(value) {
  if (typeof value !== 'string') {
    return 'structure_mismatch';
  }

  if (value.trim() === '') {
    return 'empty_invalid';
  }

  return 'existing';
}

/**
 * @param {object} entry
 * @param {object} targetState
 * @param {Map<string, string>} ledger
 * @returns {object}
 */
export function classifyEntry(entry, targetState, ledger) {
  const base = {
    destinationId: entry.destinationId,
    scope: entry.scope,
    relativeSourceFile: entry.relativeSourceFile,
    targetRelativeFile: targetState.targetRelativeFile,
    jsonPointer: entry.jsonPointer,
    sourceHash: entry.sourceHash,
    sourceText: entry.sourceText,
    targetFileHash: targetState.hash,
    targetFileMissing: targetState.missing,
    ancestorKinds: entry.ancestorKinds,
  };

  if (targetState.error) {
    return { ...base, status: 'structure_mismatch', reason: 'malformed_target_json' };
  }

  if (targetState.missing) {
    return { ...base, status: 'missing', reason: 'target_file_missing' };
  }

  const lookedUp = getAtPointer(targetState.tree, entry.jsonPointer);
  if (!lookedUp.found) {
    return { ...base, status: 'missing', reason: 'target_key_missing' };
  }

  const valueClass = classifyTargetValue(lookedUp.value);
  if (valueClass === 'empty_invalid') {
    return { ...base, status: 'empty_invalid', reason: 'empty_target', targetValue: lookedUp.value };
  }

  if (valueClass === 'structure_mismatch') {
    return {
      ...base,
      status: 'structure_mismatch',
      reason: 'target_type',
      targetType: Array.isArray(lookedUp.value) ? 'array' : lookedUp.value === null ? 'null' : typeof lookedUp.value,
    };
  }

  const previousHash = ledger.get(entryLedgerKey(entry));
  if (!previousHash) {
    return { ...base, status: 'needs_review', reason: 'no_trusted_source_hash', targetValue: lookedUp.value };
  }

  if (previousHash !== entry.sourceHash) {
    return { ...base, status: 'source_changed', reason: 'source_hash_mismatch', targetValue: lookedUp.value };
  }

  return { ...base, status: 'existing', reason: 'hash_match', targetValue: lookedUp.value };
}

/**
 * @param {{ relativeSourceFile: string, jsonPointer: string }} entry
 * @returns {string}
 */
export function entryLedgerKey(entry) {
  return `${entry.relativeSourceFile}\n${entry.jsonPointer}`;
}

/**
 * @param {string} ledgerPath
 * @returns {Map<string, string>}
 */
export function loadLedger(ledgerPath) {
  const ledger = new Map();

  if (!existsSync(ledgerPath)) {
    return ledger;
  }

  const parsed = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  for (const row of parsed.entries ?? []) {
    ledger.set(`${row.relativeSourceFile}\n${row.jsonPointer}`, row.sourceHash);
  }

  return ledger;
}

/**
 * @param {object} inventory
 * @param {string} i18nRoot
 * @param {string} locale
 * @param {Map<string, string>} ledger
 * @returns {object}
 */
export function buildTranslationStatus(inventory, i18nRoot, locale, ledger) {
  const targetCache = new Map();
  const entries = [];

  for (const sourceEntry of inventory.strings) {
    const targetRelativeFile = targetFileFor(sourceEntry.relativeSourceFile, locale);

    if (!targetCache.has(targetRelativeFile)) {
      const loaded = readJsonFile(i18nRoot, targetRelativeFile);
      targetCache.set(targetRelativeFile, { ...loaded, targetRelativeFile });
    }

    entries.push(classifyEntry(sourceEntry, targetCache.get(targetRelativeFile), ledger));
  }

  return {
    scope: inventory.scope,
    sourceLocale: inventory.sourceLocale,
    locale,
    entries,
  };
}

/**
 * Statuses the processor may send to Grok. Legacy translations stay out.
 */
export const TRANSLATABLE_STATUSES = new Set(['missing', 'empty_invalid', 'source_changed']);

/**
 * @param {object} statusReport
 * @returns {object[]}
 */
export function selectTranslatable(statusReport) {
  return statusReport.entries.filter((entry) => TRANSLATABLE_STATUSES.has(entry.status));
}

/**
 * @param {object} inventory
 * @param {object} statusReport
 * @returns {object}
 */
export function buildSummary(inventory, statusReport) {
  const counts = {
    englishStrings: inventory.strings.length,
    translated: 0,
    missing: 0,
    empty: 0,
    structureErrors: 0,
    reviewCandidates: 0,
    sourceChanged: 0,
  };

  for (const entry of statusReport.entries) {
    if (entry.status === 'existing') {
      counts.translated += 1;
    } else if (entry.status === 'missing') {
      counts.missing += 1;
    } else if (entry.status === 'empty_invalid') {
      counts.empty += 1;
    } else if (entry.status === 'structure_mismatch') {
      counts.structureErrors += 1;
    } else if (entry.status === 'needs_review') {
      counts.reviewCandidates += 1;
    } else if (entry.status === 'source_changed') {
      counts.sourceChanged += 1;
    }
  }

  const byFile = {};
  for (const entry of statusReport.entries) {
    if (!byFile[entry.relativeSourceFile]) {
      byFile[entry.relativeSourceFile] = {
        englishStrings: 0,
        translated: 0,
        missing: 0,
        empty: 0,
        structureErrors: 0,
        reviewCandidates: 0,
        sourceChanged: 0,
      };
    }

    const bucket = byFile[entry.relativeSourceFile];
    bucket.englishStrings += 1;
    if (entry.status === 'existing') bucket.translated += 1;
    if (entry.status === 'missing') bucket.missing += 1;
    if (entry.status === 'empty_invalid') bucket.empty += 1;
    if (entry.status === 'structure_mismatch') bucket.structureErrors += 1;
    if (entry.status === 'needs_review') bucket.reviewCandidates += 1;
    if (entry.status === 'source_changed') bucket.sourceChanged += 1;
  }

  return {
    scope: inventory.scope,
    locale: statusReport.locale,
    counts,
    byFile,
    fileErrors: inventory.fileErrors,
  };
}

/**
 * @param {string} absolutePath
 */
export function assertPathInside(absolutePath, root) {
  const normalizedRoot = join(root);
  if (!absolutePath.startsWith(normalizedRoot)) {
    throw new Error(`Refusing to touch a path outside ${normalizedRoot}`);
  }
}
