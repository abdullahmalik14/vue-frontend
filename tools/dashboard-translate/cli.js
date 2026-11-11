#!/usr/bin/env node
/**
 * Dashboard translation CLI.
 *
 * Offline by default. A live Grok call also requires DASHBOARD_TRANSLATE_ALLOW_LIVE=1
 * and XAI_API_KEY in the environment. The key is never printed.
 *
 *   node tools/dashboard-translate/cli.js scan --locale fr
 *   node tools/dashboard-translate/cli.js estimate --locale fr
 *   node tools/dashboard-translate/cli.js dry-run --locale fr
 *   node tools/dashboard-translate/cli.js translate --locale fr --mock --limit 10
 *   node tools/dashboard-translate/cli.js apply --locale fr
 *   node tools/dashboard-translate/cli.js rescan --locale fr
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPaths, DEFAULT_MAX_INPUT_TOKENS, MODEL } from './config.js';
import { estimateBatchCost } from './cost.js';
import { liveChatTransport } from './grokClient.js';
import { applyCompleted, readCheckpoint, scanDashboard, translateMissing } from './pipeline.js';
import { selectTranslatable } from './status.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const command = process.argv[2];
const flags = parseFlags(process.argv.slice(3));

if (!command || flags.help) {
  console.log('Commands: scan, estimate, dry-run, translate, apply, rescan');
  console.log('Required: --locale <code>');
  process.exit(command ? 0 : 1);
}

const locale = flags.locale;
if (!locale || typeof locale !== 'string') {
  console.error('Pass --locale. Example: --locale fr');
  process.exit(1);
}

const paths = createPaths(projectRoot);
const ledgerPath = join(paths.stateDir, 'hash-ledger.json');
const checkpointPath = join(paths.stateDir, `checkpoint-${locale}.json`);
const io = {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  renameSync,
  unlinkSync,
  rmSync,
  existsSync,
};

try {
  if (command === 'scan' || command === 'rescan' || command === 'estimate') {
    const scanned = scanDashboard({
      i18nRoot: paths.i18nRoot,
      outputDir: paths.outputDir,
      locale,
      ledgerPath,
    });
    const translatable = selectTranslatable(scanned.statusReport);
    const cost = estimateBatchCost(translatable, locale);
    console.log(`${command}: ${scanned.summary.counts.englishStrings} English strings`);
    console.log(`missing ${scanned.summary.counts.missing}, empty ${scanned.summary.counts.empty}, review ${scanned.summary.counts.reviewCandidates}, existing ${scanned.summary.counts.translated}`);
    console.log(`estimate USD ${cost.estimatedUsd} (unverified rates: ${cost.verifiedAgainstAccount === false}) for ${translatable.length} strings`);
    console.log(`reports: ${paths.outputDir}`);
    process.exit(0);
  }

  if (command === 'dry-run') {
    const checkpoint = readCheckpoint(checkpointPath, locale);
    const result = applyCompleted({
      checkpoint,
      locale,
      i18nRoot: paths.i18nRoot,
      io,
      backupDir: join(paths.stateDir, 'backups', 'dry-run'),
      dryRun: true,
      ledgerPath,
    });
    mkdirSync(paths.outputDir, { recursive: true });
    const previewPath = join(paths.outputDir, `dry-run-${locale}.json`);
    writeFileSync(previewPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`dry-run changes ${result.changes.length}, blocked ${result.blocked.length}`);
    console.log(`preview: ${previewPath}`);
    process.exit(0);
  }

  if (command === 'translate') {
    const scanned = scanDashboard({
      i18nRoot: paths.i18nRoot,
      outputDir: paths.outputDir,
      locale,
      ledgerPath,
    });
    const transport = flags.mock ? mockTransport(locale) : (request) => liveChatTransport(request);
    const checkpoint = await translateMissing({
      statusReport: scanned.statusReport,
      locale,
      transport,
      model: flags.mock ? 'mock' : MODEL,
      checkpointPath,
      maxInputTokens: flags['max-input-tokens'] ? Number(flags['max-input-tokens']) : DEFAULT_MAX_INPUT_TOKENS,
      limit: flags.limit ? Number(flags.limit) : undefined,
    });
    const completed = Object.values(checkpoint.entries).filter((entry) => entry.status === 'completed').length;
    const failed = Object.values(checkpoint.entries).filter((entry) => entry.status === 'failed').length;
    console.log(`translate completed ${completed}, failed ${failed}, requests ${checkpoint.usage.requests}`);
    console.log(`checkpoint: ${checkpointPath}`);
    process.exit(failed > 0 ? 2 : 0);
  }

  if (command === 'apply') {
    const scanned = scanDashboard({
      i18nRoot: paths.i18nRoot,
      outputDir: paths.outputDir,
      locale,
      ledgerPath,
    });
    const checkpoint = readCheckpoint(checkpointPath, locale);
    const mockRows = Object.values(checkpoint.entries).filter((entry) => entry.model === 'mock');
    if (mockRows.length > 0 && !flags['allow-mock-apply']) {
      throw new Error('Refusing to apply mock translations. Re-run translate without --mock.');
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const result = applyCompleted({
      checkpoint,
      inventory: scanned.inventory,
      locale,
      i18nRoot: paths.i18nRoot,
      io,
      backupDir: join(paths.stateDir, 'backups', stamp),
      dryRun: false,
      ledgerPath,
    });
    console.log(`apply wrote ${result.written.length} file(s), changes ${result.changes.length}, blocked ${result.blocked.length}`);
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'dashboard translation failed');
  process.exit(1);
}

/**
 * @param {string[]} argv
 */
function parseFlags(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }

  return parsed;
}

/**
 * @param {string} locale
 */
function mockTransport(locale) {
  return async (request) => {
    const payload = JSON.parse(request.user);
    const translations = {};
    for (const item of payload.items) {
      translations[item.id] = `«${item.text}»`;
    }

    return {
      status: 200,
      content: JSON.stringify({ locale, batchId: payload.batchId, translations }),
      usage: { promptTokens: 1, completionTokens: 1 },
    };
  };
}
