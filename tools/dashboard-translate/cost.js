import { PRICING } from './config.js';

/**
 * Rough token count for estimates. This does not call xAI.
 *
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  if (!text) {
    return 0;
  }

  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @param {typeof PRICING} [pricing]
 * @returns {number}
 */
export function estimateUsd(inputTokens, outputTokens, pricing = PRICING) {
  const input = (inputTokens / 1_000_000) * pricing.inputUsdPerMillion;
  const output = (outputTokens / 1_000_000) * pricing.outputUsdPerMillion;
  return Number((input + output).toFixed(6));
}

/**
 * @param {Array<{ sourceText: string, destinationId: string }>} entries
 * @param {string} locale
 * @param {typeof PRICING} [pricing]
 */
export function estimateBatchCost(entries, locale, pricing = PRICING) {
  const prompt = buildPromptPreview(entries, locale);
  const inputTokens = estimateTokens(prompt);
  const outputTokens = entries.reduce((sum, entry) => sum + estimateTokens(entry.sourceText) + estimateTokens(entry.destinationId), 0);

  return {
    model: pricing.model,
    verifiedAgainstAccount: pricing.verifiedAgainstAccount,
    inputTokens,
    outputTokens,
    estimatedUsd: estimateUsd(inputTokens, outputTokens, pricing),
    note: pricing.note,
  };
}

/**
 * @param {Array<{ destinationId: string, sourceText: string, relativeSourceFile?: string }>} entries
 * @param {string} locale
 * @returns {string}
 */
export function buildPromptPreview(entries, locale) {
  const items = entries.map((entry) => ({
    id: entry.destinationId,
    text: entry.sourceText,
    context: (entry.relativeSourceFile || '').split('/')[0] || 'dashboard',
  }));

  return [
    'Translate UI strings. Return JSON only.',
    `Locale: ${locale}`,
    JSON.stringify({ locale, items }),
  ].join('\n');
}
