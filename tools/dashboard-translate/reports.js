import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { estimateBatchCost } from './cost.js';
import { selectTranslatable } from './status.js';

/**
 * @param {string} outputDir
 * @param {object} inventory
 * @param {object} statusReport
 * @param {object} summary
 * @param {string} generatedAt
 */
export function writeReports(outputDir, inventory, statusReport, summary, generatedAt) {
  mkdirSync(outputDir, { recursive: true });

  const translatable = selectTranslatable(statusReport);
  const cost = estimateBatchCost(translatable, statusReport.locale);
  const summaryWithCost = {
    ...summary,
    generatedAt,
    costEstimate: cost,
    batchApi: {
      used: false,
      note: 'Estimates assume chat completions with several strings per request. That is not the xAI Batch API discount.',
    },
  };

  const files = {
    'source-inventory.json': { ...inventory, generatedAt },
    'translation-status.json': { ...statusReport, generatedAt },
    'missing-translations.json': {
      scope: inventory.scope,
      locale: statusReport.locale,
      generatedAt,
      entries: translatable,
    },
    'translation-summary.json': summaryWithCost,
  };

  for (const [name, value] of Object.entries(files)) {
    writeFileSync(join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  }

  return { files: Object.keys(files), cost, translatableCount: translatable.length };
}
