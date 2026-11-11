import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isAllowedTargetLocale, PRICING } from './config.js';
import { buildSourceInventory } from './inventory.js';
import { buildSummary, buildTranslationStatus, loadLedger, selectTranslatable } from './status.js';
import { writeReports } from './reports.js';
import { packBatches } from './batcher.js';
import { emptyCheckpoint, translateEntries } from './grokClient.js';
import { applyUpdates, ledgerRowsFromCheckpoint } from './updater.js';
import { estimateUsd } from './cost.js';

/**
 * @param {object} options
 */
export function scanDashboard(options) {
  const { i18nRoot, outputDir, locale, ledgerPath, generatedAt = new Date().toISOString() } = options;
  assertLocale(locale);

  const inventory = buildSourceInventory(i18nRoot);
  const ledger = loadLedger(ledgerPath);
  const statusReport = buildTranslationStatus(inventory, i18nRoot, locale, ledger);
  const summary = buildSummary(inventory, statusReport);
  const written = writeReports(outputDir, inventory, statusReport, summary, generatedAt);

  return { inventory, statusReport, summary, ...written };
}

/**
 * @param {object} options
 */
export async function translateMissing(options) {
  const {
    statusReport,
    locale,
    transport,
    checkpointPath,
    maxInputTokens,
    limit,
    model,
  } = options;

  assertLocale(locale);

  const selected = selectTranslatable(statusReport).slice(0, limit ?? undefined);
  const batches = packBatches(selected, locale, maxInputTokens);
  const checkpoint = readCheckpoint(checkpointPath, locale);

  const updated = await translateEntries({
    entries: selected,
    batches,
    locale,
    transport,
    model,
    checkpoint,
    maxAttempts: options.maxAttempts,
    backoffBaseMs: options.backoffBaseMs,
    sleep: options.sleep,
    now: options.now,
    onCheckpoint: (current) => writeCheckpoint(checkpointPath, current),
    maxBatches: options.maxBatches,
  });

  updated.usage.estimatedUsd = estimateUsd(updated.usage.promptTokens, updated.usage.completionTokens, PRICING);
  updated.usage.pricingVerified = PRICING.verifiedAgainstAccount;
  writeCheckpoint(checkpointPath, updated);
  return updated;
}

/**
 * @param {object} options
 */
export function applyCompleted(options) {
  const { checkpoint, locale, i18nRoot, io, backupDir, dryRun, ledgerPath, inventory } = options;
  assertLocale(locale);

  const result = applyUpdates({
    checkpoint,
    locale,
    i18nRoot,
    io,
    backupDir,
    dryRun,
  });

  if (!dryRun && result.written.length > 0 && ledgerPath && inventory) {
    const existing = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : { entries: [] };
    const merged = new Map(existing.entries.map((row) => [`${row.relativeSourceFile}\n${row.jsonPointer}`, row]));
    for (const row of ledgerRowsFromCheckpoint(checkpoint, inventory.strings)) {
      merged.set(`${row.relativeSourceFile}\n${row.jsonPointer}`, row);
    }
    mkdirSync(join(ledgerPath, '..'), { recursive: true });
    writeFileSync(ledgerPath, `${JSON.stringify({ entries: [...merged.values()] }, null, 2)}\n`, 'utf8');
  }

  return result;
}

/**
 * @param {string} locale
 */
export function assertLocale(locale) {
  if (!isAllowedTargetLocale(locale)) {
    throw new Error(`Locale is not an existing non-English dashboard language: ${locale}`);
  }
}

/**
 * @param {string} checkpointPath
 * @param {string} locale
 */
export function readCheckpoint(checkpointPath, locale) {
  if (!existsSync(checkpointPath)) {
    return emptyCheckpoint(locale);
  }

  const parsed = JSON.parse(readFileSync(checkpointPath, 'utf8'));
  if (parsed.locale !== locale) {
    throw new Error(`Checkpoint locale ${parsed.locale} does not match ${locale}`);
  }

  return parsed;
}

/**
 * @param {string} checkpointPath
 * @param {object} checkpoint
 */
export function writeCheckpoint(checkpointPath, checkpoint) {
  mkdirSync(join(checkpointPath, '..'), { recursive: true });
  writeFileSync(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`, 'utf8');
}
